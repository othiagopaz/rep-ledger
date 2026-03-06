import { PrismaClient, Prisma } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export async function getAllExpenses() {
  return prisma.expense.findMany({
    include: {
      budget: {
        select: { id: true, franquia: true, produto: true, tema: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getExpenseById(id: number) {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      budget: true,
    },
  });
  if (!expense) throw new NotFoundError("Expense");
  return expense;
}

export async function createExpense(data: {
  participante: string;
  valor: number;
  local?: string;
  forecast?: boolean;
  data?: Date;
  categoria?: string;
  budgetId: number;
}) {
  // Verify budget exists
  const budget = await prisma.budget.findUnique({
    where: { id: data.budgetId },
  });
  if (!budget) throw new NotFoundError("Budget");

  return prisma.expense.create({
    data: {
      participante: data.participante,
      valor: new Prisma.Decimal(data.valor),
      local: data.local ?? "",
      forecast: data.forecast ?? false,
      data: data.data ?? new Date(),
      categoria: data.categoria ?? "",
      budgetId: data.budgetId,
    },
    include: {
      budget: {
        select: { id: true, franquia: true, produto: true, tema: true },
      },
    },
  });
}

export async function updateExpense(
  id: number,
  data: Partial<{
    participante: string;
    valor: number;
    local: string;
    forecast: boolean;
    data: Date;
    categoria: string;
    budgetId: number;
  }>
) {
  await getExpenseById(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.valor !== undefined) {
    updateData.valor = new Prisma.Decimal(data.valor);
  }
  return prisma.expense.update({
    where: { id },
    data: updateData,
    include: {
      budget: {
        select: { id: true, franquia: true, produto: true, tema: true },
      },
    },
  });
}

export async function deleteExpense(id: number) {
  await getExpenseById(id);
  return prisma.expense.delete({ where: { id } });
}

export async function getUniqueSuggestions(
  field: "participante" | "local" | "categoria"
): Promise<string[]> {
  const results = await prisma.expense.findMany({
    where: { [field]: { not: "" } },
    select: { [field]: true },
    distinct: [field],
    orderBy: { [field]: "asc" },
  });
  return results.map((r) => r[field] as string);
}
