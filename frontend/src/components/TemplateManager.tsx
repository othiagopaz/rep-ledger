import { useState } from "react";
import type { ExpenseTemplate, Budget } from "../hooks/useApi";
import TemplateForm from "./TemplateForm";

interface Props {
  templates: ExpenseTemplate[];
  budgets: Budget[];
  onClose: () => void;
  onCreate: (data: {
    name: string;
    participante?: string;
    valor?: number;
    local?: string;
    forecast?: boolean;
    categoria?: string;
    budgetId?: number;
  }) => void;
  onUpdate: (data: {
    id: number;
    name?: string;
    participante?: string;
    valor?: number;
    local?: string;
    forecast?: boolean;
    categoria?: string;
    budgetId?: number;
  }) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function TemplateManager({
  templates,
  budgets,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  isLoading,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExpenseTemplate | null>(null);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Excluir template "${name}"?`)) {
      onDelete(id);
    }
  };

  const summaryText = (t: ExpenseTemplate) => {
    const parts: string[] = [];
    if (t.participante) parts.push(t.participante);
    if (t.valor) parts.push(`R$ ${Number(t.valor).toFixed(2)}`);
    if (t.categoria) parts.push(t.categoria);
    if (t.local) parts.push(t.local);
    if (t.budget) parts.push(t.budget.franquia);
    if (t.forecast) parts.push("Previsão");
    return parts.join(" · ") || "Nenhum campo definido";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {showForm || editing ? (editing ? "Editar Template" : "Novo Template") : "Gerenciar Templates"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {showForm || editing ? (
            <TemplateForm
              budgets={budgets}
              isEditing={!!editing}
              isLoading={isLoading}
              defaultValues={
                editing
                  ? {
                      name: editing.name,
                      participante: editing.participante,
                      valor: editing.valor,
                      local: editing.local,
                      forecast: editing.forecast,
                      categoria: editing.categoria,
                      budgetId: editing.budgetId,
                    }
                  : undefined
              }
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSubmit={(data) => {
                if (editing) {
                  onUpdate({ id: editing.id, ...data });
                } else {
                  onCreate(data);
                }
                setShowForm(false);
                setEditing(null);
              }}
            />
          ) : (
            <div className="space-y-2">
              {templates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  Nenhum template criado ainda.
                </p>
              ) : (
                templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {summaryText(t)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button
                        onClick={() => setEditing(t)}
                        className="p-1.5 text-gray-400 hover:text-brand-600 rounded hover:bg-gray-100"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={() => setShowForm(true)}
                className="w-full mt-3 px-4 py-2.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
              >
                + Novo Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
