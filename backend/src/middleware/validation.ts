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
  budgetId: z.number().int().positive("Budget ID is required"),
});

export const updateExpenseSchema = z.object({
  participante: z.string().min(1).optional(),
  valor: z.number().positive().optional(),
  local: z.string().optional(),
  forecast: z.boolean().optional(),
  budgetId: z.number().int().positive().optional(),
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
