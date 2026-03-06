import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const budgets = await prisma.budget.findMany({
      include: {
        expenses: {
          select: { id: true, participante: true, valor: true, data: true, forecast: true },
          orderBy: { data: "desc" },
        },
      },
    });

    const budgetAnalytics = budgets.map((budget) => {
      const actualExpenses = budget.expenses.filter((e) => !e.forecast);
      const forecastExpenses = budget.expenses.filter((e) => e.forecast);
      const totalSpent = actualExpenses.reduce((sum, exp) => sum + Number(exp.valor), 0);
      const totalForecast = forecastExpenses.reduce((sum, exp) => sum + Number(exp.valor), 0);
      const investimento = Number(budget.investimento);
      const remaining = investimento - totalSpent;
      const utilization = investimento > 0 ? (totalSpent / investimento) * 100 : 0;
      const forecastUtilization = investimento > 0 ? ((totalSpent + totalForecast) / investimento) * 100 : 0;
      const avgExpense = actualExpenses.length > 0 ? totalSpent / actualExpenses.length : 0;

      return {
        budgetId: budget.id,
        franquia: budget.franquia,
        produto: budget.produto,
        tema: budget.tema,
        investimento,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalForecast: Math.round(totalForecast * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        utilization: Math.round(utilization * 100) / 100,
        forecastUtilization: Math.round(forecastUtilization * 100) / 100,
        expenseCount: actualExpenses.length,
        forecastCount: forecastExpenses.length,
        avgExpense: Math.round(avgExpense * 100) / 100,
      };
    });

    const totalBudget = budgetAnalytics.reduce((s, b) => s + b.investimento, 0);
    const totalSpent = budgetAnalytics.reduce((s, b) => s + b.totalSpent, 0);
    const totalForecast = budgetAnalytics.reduce((s, b) => s + b.totalForecast, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overallForecastUtilization = totalBudget > 0 ? ((totalSpent + totalForecast) / totalBudget) * 100 : 0;

    const recentExpenses = await prisma.expense.findMany({
      take: 10,
      orderBy: { data: "desc" },
      include: { budget: { select: { franquia: true, produto: true } } },
    });

    // Daily expenses for chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyExpenses = await prisma.expense.findMany({
      where: { data: { gte: thirtyDaysAgo } },
      select: { valor: true, data: true, forecast: true },
      orderBy: { data: "asc" },
    });

    const dailyMap = new Map<string, { actual: number; forecast: number }>();
    for (const exp of dailyExpenses) {
      const day = new Date(exp.data).toISOString().split("T")[0];
      const existing = dailyMap.get(day) || { actual: 0, forecast: 0 };
      if (exp.forecast) {
        existing.forecast += Number(exp.valor);
      } else {
        existing.actual += Number(exp.valor);
      }
      dailyMap.set(day, existing);
    }
    const dailyChart = Array.from(dailyMap.entries()).map(([date, values]) => ({
      date,
      actual: Math.round(values.actual * 100) / 100,
      forecast: Math.round(values.forecast * 100) / 100,
    }));

    res.json({
      overview: {
        totalBudget: Math.round(totalBudget * 100) / 100,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalForecast: Math.round(totalForecast * 100) / 100,
        totalRemaining: Math.round(totalRemaining * 100) / 100,
        overallUtilization: Math.round(overallUtilization * 100) / 100,
        overallForecastUtilization: Math.round(overallForecastUtilization * 100) / 100,
        budgetCount: budgets.length,
        expenseCount: budgetAnalytics.reduce((s, b) => s + b.expenseCount, 0),
        forecastCount: budgetAnalytics.reduce((s, b) => s + b.forecastCount, 0),
      },
      budgets: budgetAnalytics,
      recentExpenses: recentExpenses.map((e) => ({
        id: e.id,
        participante: e.participante,
        valor: Number(e.valor),
        data: e.data,
        forecast: e.forecast,
        budget: e.budget,
      })),
      dailyChart,
    });
  })
);

export default router;
