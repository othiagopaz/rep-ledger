import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useExpenses, useBudgets, useCreateExpense, useUpdateExpense, useDeleteExpense } from "../hooks/useApi";
import type { Expense, ExpenseInput } from "../hooks/useApi";
import ExpenseForm from "../components/ExpenseForm";

type ViewMode = "all" | "actual" | "forecast";

export default function Expenses() {
  const { data: expenses, isLoading } = useExpenses();
  const { data: budgets } = useBudgets();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [searchParams, setSearchParams] = useSearchParams();
  const budgetFilter = searchParams.get("budgetId") ? Number(searchParams.get("budgetId")) : null;

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const filtered = useMemo(() => {
    if (!expenses) return [];
    let result = expenses;

    // Budget filter (from URL param or dropdown)
    if (budgetFilter) {
      result = result.filter((e) => e.budgetId === budgetFilter);
    }

    // Forecast filter
    if (viewMode === "actual") result = result.filter((e) => !e.forecast);
    else if (viewMode === "forecast") result = result.filter((e) => e.forecast);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.participante.toLowerCase().includes(q) ||
          e.local.toLowerCase().includes(q) ||
          e.budget?.franquia.toLowerCase().includes(q) ||
          e.budget?.produto.toLowerCase().includes(q)
      );
    }

    return result;
  }, [expenses, budgetFilter, viewMode, search]);

  const handleCreate = (data: ExpenseInput) => {
    createExpense.mutate(data, { onSuccess: () => setShowForm(false) });
  };

  const handleUpdate = (data: ExpenseInput) => {
    if (!editing) return;
    updateExpense.mutate({ id: editing.id, ...data }, { onSuccess: () => setEditing(null) });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Excluir esta despesa?")) deleteExpense.mutate(id);
  };

  const toggleForecast = (exp: Expense) => {
    updateExpense.mutate({ id: exp.id, forecast: !exp.forecast });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );

  const budgetName = budgetFilter
    ? budgets?.find((b) => b.id === budgetFilter)?.franquia
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          {budgetName && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-brand-600 font-medium">Filtrado: {budgetName}</span>
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
        >
          + Nova Despesa
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar participante, local, franquia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <select
          value={budgetFilter ?? ""}
          onChange={(e) => {
            if (e.target.value) setSearchParams({ budgetId: e.target.value });
            else setSearchParams({});
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">Todos os budgets</option>
          {budgets?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.franquia}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          {(["all", "actual", "forecast"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-2 font-medium transition-colors ${
                viewMode === mode
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {mode === "all" ? "Todos" : mode === "actual" ? "Realizados" : "Previstos"}
            </button>
          ))}
        </div>
      </div>

      {/* Form modal */}
      {(showForm || editing) && budgets && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Editar Despesa" : "Nova Despesa"}
            </h2>
            <ExpenseForm
              budgets={budgets}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditing(null); }}
              defaultValues={
                editing
                  ? {
                      participante: editing.participante,
                      valor: Number(editing.valor),
                      local: editing.local,
                      forecast: editing.forecast,
                      data: new Date(editing.data).toISOString().split("T")[0],
                      budgetId: editing.budgetId,
                    }
                  : undefined
              }
              isLoading={createExpense.isPending || updateExpense.isPending}
            />
          </div>
        </div>
      )}

      {/* Expenses table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Local</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Data</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Nenhuma despesa encontrada
                  </td>
                </tr>
              )}
              {filtered.map((exp) => (
                <tr key={exp.id} className={`hover:bg-gray-50 ${exp.forecast ? "bg-blue-50/40" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{exp.participante}</p>
                    <p className="text-xs text-gray-500 sm:hidden">
                      {exp.budget?.franquia} &middot;{" "}
                      {new Date(exp.data).toLocaleDateString("pt-BR")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    R$ {Number(exp.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleForecast(exp)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        exp.forecast
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title="Clique para alternar"
                    >
                      {exp.forecast ? "Previsto" : "Realizado"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                    {exp.local || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                    {exp.budget?.franquia} - {exp.budget?.produto}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                    {new Date(exp.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(exp)}
                        className="p-2 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
            {filtered.length} despesa{filtered.length !== 1 ? "s" : ""} &middot; Total: R${" "}
            {filtered
              .reduce((s, e) => s + Number(e.valor), 0)
              .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </div>
  );
}
