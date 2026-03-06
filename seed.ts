import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();

  // Create budgets
  const budget1 = await prisma.budget.create({
    data: {
      franquia: "Franquia SP",
      produto: "Seguro Auto",
      tema: "Campanha Verão",
      speaker1: "Carlos Silva",
      investimento: 50000.0,
    },
  });

  const budget2 = await prisma.budget.create({
    data: {
      franquia: "Franquia RJ",
      produto: "Seguro Vida",
      tema: "Workshop Técnico",
      speaker1: "Ana Souza",
      investimento: 30000.0,
    },
  });

  const budget3 = await prisma.budget.create({
    data: {
      franquia: "Franquia MG",
      produto: "Previdência",
      tema: "Evento Corporativo",
      speaker1: "Roberto Lima",
      investimento: 75000.0,
    },
  });

  // Create expenses
  const expenses = [
    { participante: "João Mendes", valor: 1500.0, budgetId: budget1.id },
    { participante: "Maria Clara", valor: 2300.0, budgetId: budget1.id },
    { participante: "Pedro Alves", valor: 800.0, budgetId: budget1.id },
    { participante: "Lucia Ferreira", valor: 4500.0, budgetId: budget2.id },
    { participante: "Fernando Costa", valor: 1200.0, budgetId: budget2.id },
    { participante: "Beatriz Santos", valor: 3100.0, budgetId: budget2.id },
    { participante: "Ricardo Oliveira", valor: 6700.0, budgetId: budget3.id },
    { participante: "Camila Rocha", valor: 2800.0, budgetId: budget3.id },
    { participante: "André Martins", valor: 5400.0, budgetId: budget3.id },
    { participante: "Juliana Pereira", valor: 1900.0, budgetId: budget3.id },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense });
  }

  console.log("Seed data created successfully");
  console.log(`  - 3 budgets created`);
  console.log(`  - ${expenses.length} expenses created`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
