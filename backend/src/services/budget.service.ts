import { PrismaClient, Prisma } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export async function getAllBudgets() {
  return prisma.budget.findMany({
    include: {
      _count: { select: { expenses: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBudgetById(id: number) {
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: {
      expenses: { orderBy: { createdAt: "desc" } },
      _count: { select: { expenses: true } },
    },
  });
  if (!budget) throw new NotFoundError("Budget");
  return budget;
}

export async function createBudget(data: {
  franquia: string;
  produto: string;
  tema: string;
  speaker1: string;
  investimento: number;
}) {
  return prisma.budget.create({
    data: {
      ...data,
      investimento: new Prisma.Decimal(data.investimento),
    },
  });
}

export async function updateBudget(
  id: number,
  data: Partial<{
    franquia: string;
    produto: string;
    tema: string;
    speaker1: string;
    investimento: number;
  }>
) {
  await getBudgetById(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.investimento !== undefined) {
    updateData.investimento = new Prisma.Decimal(data.investimento);
  }
  return prisma.budget.update({ where: { id }, data: updateData });
}

export async function deleteBudget(id: number) {
  await getBudgetById(id);
  return prisma.budget.delete({ where: { id } });
}
