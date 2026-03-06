import { Router, Request, Response, NextFunction } from "express";
import * as templateService from "../services/template.service";
import { validate, createTemplateSchema, updateTemplateSchema } from "../middleware/validation";

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const templates = await templateService.getAllTemplates();
    res.json(templates);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const template = await templateService.getTemplateById(Number(req.params.id));
    res.json(template);
  })
);

router.post(
  "/",
  validate(createTemplateSchema),
  asyncHandler(async (req, res) => {
    const template = await templateService.createTemplate(req.body);
    res.status(201).json(template);
  })
);

router.put(
  "/:id",
  validate(updateTemplateSchema),
  asyncHandler(async (req, res) => {
    const template = await templateService.updateTemplate(Number(req.params.id), req.body);
    res.json(template);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await templateService.deleteTemplate(Number(req.params.id));
    res.status(204).send();
  })
);

export default router;
