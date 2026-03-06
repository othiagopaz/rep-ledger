import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Types
export interface Budget {
  id: number;
  franquia: string;
  produto: string;
  tema: string;
  speaker1: string;
  investimento: string | number;
  createdAt: string;
  updatedAt: string;
  _count?: { expenses: number };
  expenses?: Expense[];
}

export interface Expense {
  id: number;
  participante: string;
  valor: string | number;
  local: string;
  forecast: boolean;
  data: string;
  categoria: string;
  budgetId: number;
  createdAt: string;
  updatedAt: string;
  budget?: { id: number; franquia: string; produto: string; tema: string };
}

export interface BudgetInput {
  franquia: string;
  produto: string;
  tema: string;
  speaker1: string;
  investimento: number;
}

export interface ExpenseInput {
  participante: string;
  valor: number;
  local: string;
  forecast: boolean;
  data: string;
  categoria: string;
  budgetId: number;
}

export interface ExpenseTemplate {
  id: number;
  name: string;
  participante: string | null;
  valor: string | number | null;
  local: string | null;
  forecast: boolean | null;
  categoria: string | null;
  budgetId: number | null;
  createdAt: string;
  updatedAt: string;
  budget?: { id: number; franquia: string; produto: string; tema: string } | null;
}

export interface TemplateInput {
  name: string;
  participante?: string;
  valor?: number;
  local?: string;
  forecast?: boolean;
  categoria?: string;
  budgetId?: number;
}

// Budget hooks
export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: () => apiFetch("/api/budgets"),
  });
}

export function useBudget(id: number) {
  return useQuery<Budget>({
    queryKey: ["budgets", id],
    queryFn: () => apiFetch(`/api/budgets/${id}`),
    enabled: id > 0,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetInput) =>
      apiFetch<Budget>("/api/budgets", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<BudgetInput> & { id: number }) =>
      apiFetch<Budget>(`/api/budgets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/budgets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// Expense suggestions
export function useExpenseSuggestions(field: "participante" | "local" | "categoria") {
  return useQuery<string[]>({
    queryKey: ["expense-suggestions", field],
    queryFn: () => apiFetch(`/api/expenses/suggestions/${field}`),
    staleTime: 5 * 60 * 1000,
  });
}

// Expense hooks
export function useExpenses() {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: () => apiFetch("/api/expenses"),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseInput) =>
      apiFetch<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<ExpenseInput> & { id: number }) =>
      apiFetch<Expense>(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// Template hooks
export function useTemplates() {
  return useQuery<ExpenseTemplate[]>({
    queryKey: ["templates"],
    queryFn: () => apiFetch("/api/templates"),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplateInput) =>
      apiFetch<ExpenseTemplate>("/api/templates", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<TemplateInput> & { id: number }) =>
      apiFetch<ExpenseTemplate>(`/api/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
