# Budget Ledger System - Quick Start with Claude Code

## Option 1: Interactive Agent Generation (Recommended)

Copy and paste **each** of these prompts into Claude Code one at a time. Each will generate complete code for its layer.

### Prompt 1: Database Schema
```
You are a database architect building a budget ledger system.

Create a complete PostgreSQL + Prisma setup:

1. **schema.prisma** file with:
   - budgets: id, franquia (String), produto (String), tema (String), speaker1 (String), investimento (Decimal @db.Decimal(10,2))
   - expenses: id, participante (String), valor (Decimal @db.Decimal(10,2)), data (DateTime @default(now())), budget (relation), createdAt, updatedAt
   - Proper indexes on budget_id and createdAt
   - Cascade delete relationships

2. **Initial migration SQL** for PostgreSQL (001_initial.sql)

3. **seed.ts** with 3 sample budgets and 10 sample expenses

Use TypeScript. Make it production-ready. Output just the code, no explanations.
```

### Prompt 2: Backend API
```
You are a backend developer building a lightweight Node.js/Express API for a budget ledger.

Create the complete backend with:

1. **src/index.ts**: Express server with CORS, middleware, routes setup
2. **src/routes/budgets.ts**: CRUD endpoints for budgets
3. **src/routes/expenses.ts**: CRUD endpoints for expenses
4. **src/routes/analytics.ts**: GET /api/analytics with aggregated data
5. **src/services/budget.service.ts**: Business logic for budgets
6. **src/services/expense.service.ts**: Business logic for expenses
7. **src/middleware/validation.ts**: zod validators for requests
8. **src/utils/errors.ts**: Error handling
9. **package.json** with all dependencies
10. **.env.example** with required variables

Use TypeScript strict mode. Integrate Prisma. No N+1 queries. Handle errors gracefully.
Return only code, no explanations. Make it production-ready and lightweight.
```

### Prompt 3: Frontend React App
```
You are a frontend developer building a React app for a budget ledger, optimized for iPad.

Create a complete Vite + React + Tailwind app:

1. **src/App.tsx**: Main app router
2. **src/pages/Dashboard.tsx**: Overview page
3. **src/pages/Budgets.tsx**: Budget list and CRUD
4. **src/pages/Expenses.tsx**: Expense tracker
5. **src/pages/Analytics.tsx**: Charts and insights
6. **src/components/BudgetCard.tsx**: Budget display component
7. **src/components/ExpenseForm.tsx**: Add/edit expense form
8. **src/components/BudgetForm.tsx**: Add/edit budget form
9. **src/hooks/useApi.ts**: React Query wrapper for API calls
10. **src/hooks/useAnalytics.ts**: Custom hook for analytics data
11. **tailwind.config.js**: Tailwind config with iPad responsive breakpoints
12. **vite.config.ts**: Vite configuration
13. **package.json** with React, React Query, Tailwind, react-hook-form, etc.
14. **.env.example**: VITE_API_URL=http://localhost:3000

Make it beautiful. iPad-optimized (landscape + portrait). Mobile-first responsive.
Use TypeScript. Form validation with react-hook-form.
Return only code, no explanations.
```

### Prompt 4: Docker & Deployment
```
You are an infrastructure engineer setting up deployment for a budget ledger system.

Create deployment configuration:

1. **Dockerfile**: Multi-stage build for Node.js backend, alpine base
2. **docker-compose.yml**: Backend + PostgreSQL for local development
3. **railway.json**: Configuration for Railway.app deployment (or Render config)
4. **startup.sh**: Script to run migrations and start the server
5. **.dockerignore**: Proper file exclusions
6. **.env.example**: Template for production variables

Include:
- Health checks
- Automatic database migrations on startup
- Proper signal handling
- Lightweight images

Return only code files, no explanations. Production-ready.
```

---

## Option 2: Batch Generation (Advanced)

If you want to generate everything at once, use this single mega-prompt:

```
You are a team of 4 expert engineers: database architect, backend developer, frontend developer, and devops engineer.

Generate a complete budget ledger system in TypeScript/Node.js/React:

REQUIREMENTS:
- Stack: Node.js + Express backend, React frontend (Vite), PostgreSQL, Docker
- Budgets CRUD: fields are franquia, produto, tema, speaker1, investimento (decimal)
- Expenses CRUD: participante, valor, data (auto), budget_id (relation)
- iPad-responsive UI (Tailwind CSS)
- Real-time analytics dashboard
- Lightweight and performant

DELIVERABLES (output each file with filename as header):

DATABASE:
- schema.prisma
- migrations/001_initial.sql
- seed.ts

BACKEND:
- backend/src/index.ts
- backend/src/routes/budgets.ts
- backend/src/routes/expenses.ts
- backend/src/routes/analytics.ts
- backend/src/services/budget.service.ts
- backend/src/services/expense.service.ts
- backend/package.json
- backend/.env.example

FRONTEND:
- frontend/src/App.tsx
- frontend/src/pages/Dashboard.tsx
- frontend/src/pages/Budgets.tsx
- frontend/src/pages/Expenses.tsx
- frontend/src/pages/Analytics.tsx
- frontend/src/components/BudgetCard.tsx
- frontend/src/components/ExpenseForm.tsx
- frontend/src/hooks/useApi.ts
- frontend/tailwind.config.js
- frontend/vite.config.ts
- frontend/package.json

INFRASTRUCTURE:
- Dockerfile
- docker-compose.yml
- railway.json
- startup.sh

Use TypeScript everywhere. Production-ready. No explanations, just code.
```

---

## Setup Instructions

### 1. Create Project Structure
```bash
mkdir -p budget-ledger/{backend,frontend,database,infrastructure}
cd budget-ledger
```

### 2. Generate Code
Use **Option 1** (recommended) to get complete, debugged code with explanations if needed.

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run prisma:migrate
npm run seed
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

### 5. Local Deployment with Docker
```bash
cd ..
docker-compose up
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

---

## Features Generated

✅ **Budget Management**
- Create/edit/delete budgets with 5 custom fields
- Real-time balance tracking
- Category organization

✅ **Expense Tracking**
- Log expenses against budgets
- Date tracking (auto-populated)
- Quick filtering and search

✅ **Analytics Dashboard**
- Budget utilization % per source
- Total spent vs. budget
- Recent transactions
- Remaining budget by source
- Visual charts

✅ **iPad Optimized**
- Responsive Tailwind design
- Touch-friendly forms
- Landscape/portrait support
- Fast load times

✅ **Lightweight Server**
- Node.js + Express (minimal overhead)
- PostgreSQL for data persistence
- Docker containerization
- <100MB total footprint

---

## Troubleshooting

**Port 3000 already in use?**
```bash
# Backend: Change PORT in .env
# Or kill existing process: lsof -i :3000 | kill -9 <PID>
```

**Database connection error?**
```bash
# Make sure PostgreSQL is running
docker-compose up postgres
# Check DATABASE_URL in .env
```

**Frontend not connecting to API?**
```bash
# Check VITE_API_URL in frontend/.env
# Backend must be running on http://localhost:3000
```

---

## Deployment

### To Railway.app:
```bash
railway link
railway up
```

### To Render:
```bash
# Use Render dashboard + connect your GitHub repo
# Render will auto-deploy from railway.json config
```

---

**That's it! You have a production-ready budget ledger system in minutes. 🚀**
