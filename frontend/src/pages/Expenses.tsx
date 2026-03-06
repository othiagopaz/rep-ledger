import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useExpenses, useBudgets, useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useCreateExpense, useUpdateExpense, useDeleteExpense } from "../hooks/useApi";
import type { Expense, ExpenseInput, ExpenseTemplate } from "../hooks/useApi";
import ExpenseForm from "../components/ExpenseForm";
import TemplateManager from "../components/TemplateManager";

type ViewMode = "all" | "actual" | "forecast";

export default function Expenses() {
  const { data: expenses, isLoading } = useExpenses();
  const { data: budgets } = useBudgets();
  const { data: templates } = useTemplates();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [searchParams, setSearchParams] = useSearchParams();
  const budgetFilter = searchParams.get("budgetId") ? Number(searchParams.get("budgetId")) : null;

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [draftValues, setDraftValues] = useState<ExpenseInput | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

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
    createExpense.mutate(data, { onSuccess: () => { setShowForm(false); setDraftValues(undefined); } });
  };

  const handleSaveAndDuplicate = (data: ExpenseInput) => {
    const draft = { ...data };
    createExpense.mutate(data, {
      onSuccess: () => {
        setDraftValues(draft);
        setShowForm(true);
        setEditing(null);
      },
    });
  };

  const handleDuplicateFromTable = (exp: Expense) => {
    setDraftValues({
      participante: exp.participante,
      valor: Number(exp.valor),
      local: exp.local,
      forecast: exp.forecast,
      data: new Date(exp.data).toISOString().split("T")[0],
      categoria: exp.categoria || "",
      budgetId: exp.budgetId,
    });
    setEditing(null);
    setShowForm(true);
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

  const applyTemplate = (template: ExpenseTemplate) => {
    const draft: ExpenseInput = {
      participante: template.participante ?? "",
      valor: template.valor ? Number(template.valor) : 0,
      local: template.local ?? "",
      forecast: template.forecast ?? false,
      data: new Date().toISOString().split("T")[0],
      categoria: template.categoria ?? "",
      budgetId: template.budgetId ?? 0,
    };
    setDraftValues(draft);
    setEditing(null);
    setShowForm(true);
    setShowDropdown(false);
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
        <div className="relative">
          <div className="flex">
            <button
              onClick={() => { setShowForm(true); setEditing(null); setDraftValues(undefined); }}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-l-lg hover:bg-brand-700"
            >
              + Nova Despesa
            </button>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-2 py-2 text-white bg-brand-600 rounded-r-lg hover:bg-brand-700 border-l border-brand-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                {templates && templates.length > 0 && (
                  <>
                    <p className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase">Templates</p>
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                  </>
                )}
                <button
                  onClick={() => { setShowDropdown(false); setShowTemplateManager(true); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Gerenciar Templates
                </button>
              </div>
            </>
          )}
        </div>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-4 sm:p-6 mb-8 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editing ? "Editar Despesa" : "Nova Despesa"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditing(null); setDraftValues(undefined); }}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ExpenseForm
              key={draftValues ? JSON.stringify(draftValues) : editing?.id ?? "new"}
              budgets={budgets}
              onSubmit={editing ? handleUpdate : handleCreate}
              onSaveAndDuplicate={!editing ? handleSaveAndDuplicate : undefined}
              onCancel={() => { setShowForm(false); setEditing(null); setDraftValues(undefined); }}
              defaultValues={
                editing
                  ? {
                      participante: editing.participante,
                      valor: Number(editing.valor),
                      local: editing.local,
                      forecast: editing.forecast,
                      data: new Date(editing.data).toISOString().split("T")[0],
                      categoria: editing.categoria || "",
                      budgetId: editing.budgetId,
                    }
                  : draftValues
                    ? {
                        participante: draftValues.participante,
                        valor: draftValues.valor,
                        local: draftValues.local,
                        forecast: draftValues.forecast,
                        data: draftValues.data ?? "",
                        categoria: draftValues.categoria ?? "",
                        budgetId: draftValues.budgetId,
                      }
                    : undefined
              }
              isEditing={!!editing}
              isLoading={createExpense.isPending || updateExpense.isPending}
            />
          </div>
        </div>
      )}

      {/* Template Manager modal */}
      {showTemplateManager && budgets && (
        <TemplateManager
          templates={templates ?? []}
          budgets={budgets}
          onClose={() => setShowTemplateManager(false)}
          onCreate={(data) => createTemplate.mutate(data)}
          onUpdate={(data) => updateTemplate.mutate(data)}
          onDelete={(id) => deleteTemplate.mutate(id)}
          isLoading={createTemplate.isPending || updateTemplate.isPending}
        />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Data</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
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
                    {exp.categoria || "—"}
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
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDuplicateFromTable(exp)}
                        className="p-2 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                        title="Duplicar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        title="Excluir"
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
