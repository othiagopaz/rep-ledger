-- AlterTable: add data and categoria to expenses
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "categoria" TEXT NOT NULL DEFAULT '';

-- CreateTable: expense_templates
CREATE TABLE IF NOT EXISTS "expense_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "participante" TEXT,
    "valor" DECIMAL(10,2),
    "local" TEXT,
    "forecast" BOOLEAN,
    "categoria" TEXT,
    "budget_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expense_templates_budget_id_fkey'
  ) THEN
    ALTER TABLE "expense_templates" ADD CONSTRAINT "expense_templates_budget_id_fkey"
      FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
