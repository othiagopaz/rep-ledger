import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface AnalyticsData {
  overview: {
    totalBudget: number;
    totalSpent: number;
    totalForecast: number;
    totalRemaining: number;
    overallUtilization: number;
    overallForecastUtilization: number;
    budgetCount: number;
    expenseCount: number;
    forecastCount: number;
  };
  budgets: {
    budgetId: number;
    franquia: string;
    produto: string;
    tema: string;
    investimento: number;
    totalSpent: number;
    totalForecast: number;
    remaining: number;
    utilization: number;
    forecastUtilization: number;
    expenseCount: number;
    forecastCount: number;
    avgExpense: number;
  }[];
  recentExpenses: {
    id: number;
    participante: string;
    valor: number;
    data: string;
    forecast: boolean;
    budget: { franquia: string; produto: string };
  }[];
  dailyChart: {
    date: string;
    actual: number;
    forecast: number;
  }[];
}

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/analytics`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}
