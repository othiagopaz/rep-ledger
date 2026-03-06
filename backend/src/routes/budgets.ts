import { Router, Request, Response, NextFunction } from "express";
import * as budgetService from "../services/budget.service";
import { validate, createBudgetSchema, updateBudgetSchema } from "../middleware/validation";

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const budgets = await budgetService.getAllBudgets();
    res.json(budgets);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const budget = await budgetService.getBudgetById(Number(req.params.id));
    res.json(budget);
  })
);

router.post(
  "/",
  validate(createBudgetSchema),
  asyncHandler(async (req, res) => {
    const budget = await budgetService.createBudget(req.body);
    res.status(201).json(budget);
  })
);

router.put(
  "/:id",
  validate(updateBudgetSchema),
  asyncHandler(async (req, res) => {
    const budget = await budgetService.updateBudget(Number(req.params.id), req.body);
    res.json(budget);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await budgetService.deleteBudget(Number(req.params.id));
    res.status(204).send();
  })
);

export default router;
