import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

export const createBudgetSchema = z.object({
  franquia: z.string().min(1, "Franquia is required"),
  produto: z.string().optional().default(""),
  tema: z.string().optional().default(""),
  speaker1: z.string().optional().default(""),
  investimento: z.number().positive("Investimento must be positive"),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const createExpenseSchema = z.object({
  participante: z.string().min(1, "Participante is required"),
  valor: z.number().positive("Valor must be positive"),
  local: z.string().optional().default(""),
  forecast: z.boolean().optional().default(false),
  data: z.string().optional().transform((v) => v ? new Date(v) : undefined),
  categoria: z.string().optional().default(""),
  budgetId: z.number().int().positive("Budget ID is required"),
});

export const updateExpenseSchema = z.object({
  participante: z.string().min(1).optional(),
  valor: z.number().positive().optional(),
  local: z.string().optional(),
  forecast: z.boolean().optional(),
  data: z.string().optional().transform((v) => v ? new Date(v) : undefined),
  categoria: z.string().optional(),
  budgetId: z.number().int().positive().optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  participante: z.string().optional(),
  valor: z.number().positive("Valor must be positive").optional(),
  local: z.string().optional(),
  forecast: z.boolean().optional(),
  categoria: z.string().optional(),
  budgetId: z.number().int().positive().optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  participante: z.string().nullable().optional(),
  valor: z.number().positive().nullable().optional(),
  local: z.string().nullable().optional(),
  forecast: z.boolean().nullable().optional(),
  categoria: z.string().nullable().optional(),
  budgetId: z.number().int().positive().nullable().optional(),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.flatten().fieldErrors);
    }
    req.body = result.data;
    next();
  };
}
