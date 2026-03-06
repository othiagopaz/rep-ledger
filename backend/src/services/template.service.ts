import { PrismaClient, Prisma } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export async function getAllTemplates() {
  return prisma.expenseTemplate.findMany({
    include: {
      budget: {
        select: { id: true, franquia: true, produto: true, tema: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTemplateById(id: number) {
  const template = await prisma.expenseTemplate.findUnique({
    where: { id },
    include: {
      budget: {
        select: { id: true, franquia: true, produto: true, tema: true },
      },
    },
  });
  if (!template) throw new NotFoundError("ExpenseTemplate");
  return template;
}

export async function createTemplate(data: {
  name: string;
  participante?: string;
  valor?: number;
  local?: string;
  forecast?: boolean;
  categoria?: string;
  budgetId?: number;
}) {
  if (data.budgetId) {
    const budget = await prisma.budget.findUnique({
      where: { id: data.budgetId },
    });
    if (!budget) throw new NotFoundError("Budget");
  }

  return prisma.expenseTemplate.create({
    data: {
      name: data.name,
      participante: data.participante ?? null,
      valor: data.valor !== undefined ? new Prisma.Decimal(data.valor) : null,
      local: data.local ?? null,
      forecast: data.forecast ?? null,
      categoria: data.categoria ?? null,
      budgetId: data.budgetId ?? null,
    },
    include: {
      budget: {
        select: { id: true, franquia: true, produto: true, tema: true },
      },
    },
  });
}

export async function updateTemplate(
  id: number,
  data: Partial<{
    name: string;
    participante: string | null;
    valor: number | null;
    local: string | null;
    forecast: boolean | null;
    categoria: string | null;
    budgetId: number | null;
  }>
) {
  await getTemplateById(id);
  const updateData: Record<string, unknown> = { ...data };
  if (data.valor !== undefined && data.valor !== null) {
    updateData.valor = new Prisma.Decimal(data.valor);
  }
  return prisma.expenseTemplate.update({
    where: { id },
    data: updateData,
    include: {
      budget: {
        select: { id: true, franquia: true, produto: true, tema: true },
      },
    },
  });
}

export async function deleteTemplate(id: number) {
  await getTemplateById(id);
  return prisma.expenseTemplate.delete({ where: { id } });
}
