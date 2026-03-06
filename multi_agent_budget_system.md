# Budget Ledger System - Multi-Agent Code Generation Prompt

## System Overview

You are a team of specialized code-generation agents. Each agent is responsible for a specific layer of a lightweight budget management application. The application allows users to manage multiple budget sources (with fields: Franquia, Produto, Tema, Speaker1, Investimento) and track expenses against those budgets.

**Stack Requirements:**
- Lightweight server execution
- Excellent iPad responsiveness
- Real-time analytics and insights

---

## Agent 1: Database & Data Model Architect

**Role:** Design and implement the database schema and data models.

**Responsibilities:**
1. Create a PostgreSQL schema with:
   - `budgets` table: id, franquia (string), produto (string), tema (string), speaker1 (string), investimento (decimal)
   - `expenses` table: id, participante (string), valor (decimal), data (timestamp, auto-created), budget_id (FK), created_at, updated_at
   - Indexes for fast queries on budget_id and created_at
2. Generate a TypeScript/Prisma schema (`schema.prisma`) that mirrors the database
3. Add seed data for testing
4. Include migration scripts for schema versioning

**Output:** Provide the complete Prisma schema, database initialization script, and SQL migration files.

---

## Agent 2: Backend API Developer

**Role:** Build a lightweight Node.js/Express backend.

**Responsibilities:**
1. Scaffold a minimal Express server with:
   - RESTful endpoints for CRUD operations on budgets and expenses
   - POST /api/budgets, GET /api/budgets, PUT /api/budgets/:id, DELETE /api/budgets/:id
   - POST /api/expenses, GET /api/expenses, PUT /api/expenses/:id, DELETE /api/expenses/:id
   - GET /api/analytics (returns aggregated data for insights)
2. Integrate Prisma ORM for database queries
3. Add input validation with zod
4. Implement error handling and logging
5. Make sure responses are optimized for the frontend (minimal payload size)
6. Use environment variables for configuration (DATABASE_URL, PORT, etc.)

**Output:** Provide the complete backend code organized by routes, middleware, and services.

---

## Agent 3: Frontend UI/UX Developer

**Role:** Build a responsive React frontend optimized for iPad.

**Responsibilities:**
1. Create a React app (using Vite for fast builds) with:
   - A dashboard showing total budget overview
   - A budget list view with create/edit/delete functionality
   - An expense tracker with date picker and budget selector
   - Real-time analytics panel showing:
     - Budget utilization percentage for each source
     - Total spent vs. total budget
     - Recent expenses (last 10)
     - Average expense per source
     - Remaining budget per source
2. Use Tailwind CSS for styling with mobile-first responsive design
3. Implement form validation with react-hook-form
4. Use React Query (or SWR) for efficient API calls and caching
5. Add a mobile-friendly navigation menu
6. Ensure iPad landscape/portrait modes work seamlessly
7. Optimize for performance (lazy loading, code splitting)

**Output:** Provide the complete React component structure, hooks, and styling configuration.

---

## Agent 4: Infrastructure & Deployment Specialist

**Role:** Set up deployment and server configuration.

**Responsibilities:**
1. Create Docker configuration:
   - Dockerfile for Node.js backend
   - docker-compose.yml for local development (includes PostgreSQL)
2. Generate deployment configs for lightweight hosting:
   - Railway.app or Render.com configuration
   - Environment variable templates
3. Add CI/CD pipeline (GitHub Actions) for automated testing and deployment
4. Create a startup script that handles:
   - Database migrations on boot
   - Seed data initialization (optional)
5. Add monitoring/logging setup (optional: Sentry or similar)

**Output:** Provide Docker files, deployment configs, and CI/CD workflow files.

---

## Execution Instructions

### For Claude Code:

Each agent should generate their output as follows:

1. **Agent 1 Output:**
   - File: `schema.prisma`
   - File: `migrations/001_initial_schema.sql`
   - File: `seed.ts`

2. **Agent 2 Output:**
   - Folder: `backend/src/routes/`
   - Folder: `backend/src/services/`
   - File: `backend/src/index.ts`
   - File: `backend/.env.example`

3. **Agent 3 Output:**
   - Folder: `frontend/src/components/`
   - Folder: `frontend/src/pages/`
   - Folder: `frontend/src/hooks/`
   - File: `frontend/src/App.tsx`
   - File: `frontend/tailwind.config.js`
   - File: `frontend/vite.config.ts`

4. **Agent 4 Output:**
   - File: `Dockerfile`
   - File: `docker-compose.yml`
   - File: `railway.json` (or Render equivalent)
   - File: `.github/workflows/deploy.yml`
   - File: `startup.sh`

---

## Communication Between Agents

- **Endpoint URLs:** Backend defaults to `http://localhost:3000/api`
- **Database:** PostgreSQL on `localhost:5432` (or configurable)
- **Frontend API Client:** Uses fetch with proper CORS handling
- **Data Format:** All responses are JSON with consistent error structure: `{ error: string, details?: any }`

---

## Quality Standards

- **Code:** TypeScript throughout, strict mode enabled
- **Performance:** No N+1 queries, proper indexing
- **Responsiveness:** Test on iPad Air (2048×2732) and iPad Pro (2160×1620)
- **Accessibility:** WCAG 2.1 AA compliance
- **Security:** Input validation, SQL injection prevention via Prisma, CORS configured

---

## Start Generation

Each agent should now begin generating their respective components. Coordinate timing so that:
1. Database schema is finalized first
2. Backend is built next (using the schema)
3. Frontend is developed in parallel (using API contracts)
4. Infrastructure is configured last (using finalized backend/frontend)

**Go ahead and generate the code.**
