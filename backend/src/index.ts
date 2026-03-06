import express from "express";
import cors from "cors";
import budgetRoutes from "./routes/budgets";
import expenseRoutes from "./routes/expenses";
import analyticsRoutes from "./routes/analytics";
import templateRoutes from "./routes/templates";
import { errorHandler } from "./utils/errors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/templates", templateRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Export app for Vercel serverless
export default app;

// Only start listening in dev (not in Vercel serverless)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Rep Ledger API running on http://localhost:${PORT}`);
  });
}
