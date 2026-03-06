import { Router, Request, Response, NextFunction } from "express";
import * as expenseService from "../services/expense.service";
import { validate, createExpenseSchema, updateExpenseSchema } from "../middleware/validation";

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const expenses = await expenseService.getAllExpenses();
    res.json(expenses);
  })
);

router.get(
  "/suggestions/:field",
  asyncHandler(async (req, res) => {
    const field = req.params.field as string;
    const allowed = ["participante", "local", "categoria"];
    if (!allowed.includes(field)) {
      res.status(400).json({ error: "Invalid field. Must be one of: participante, local, categoria" });
      return;
    }
    const suggestions = await expenseService.getUniqueSuggestions(
      field as "participante" | "local" | "categoria"
    );
    res.json(suggestions);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpenseById(Number(req.params.id));
    res.json(expense);
  })
);

router.post(
  "/",
  validate(createExpenseSchema),
  asyncHandler(async (req, res) => {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  })
);

router.put(
  "/:id",
  validate(updateExpenseSchema),
  asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(Number(req.params.id), req.body);
    res.json(expense);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await expenseService.deleteExpense(Number(req.params.id));
    res.status(204).send();
  })
);

export default router;
