import { useState } from "react";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from "../hooks/useApi";
import { useAnalytics } from "../hooks/useAnalytics";
import type { Budget, BudgetInput } from "../hooks/useApi";
import BudgetForm from "../components/BudgetForm";
import BudgetCard from "../components/BudgetCard";

export default function Budgets() {
  const { data: budgets, isLoading } = useBudgets();
  const { data: analytics } = useAnalytics();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const handleCreate = (data: BudgetInput) => {
    createBudget.mutate(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleUpdate = (data: BudgetInput) => {
    if (!editing) return;
    updateBudget.mutate({ id: editing.id, ...data }, {
      onSuccess: () => setEditing(null),
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este budget? Todas as despesas associadas também serão excluídas.")) {
      deleteBudget.mutate(id);
    }
  };

  const getSpent = (budgetId: number) => {
    return analytics?.budgets.find((b) => b.budgetId === budgetId)?.totalSpent ?? 0;
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
        >
          + Novo Budget
        </button>
      </div>

      {/* Form modal */}
      {(showForm || editing) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Editar Budget" : "Criar Budget"}</h2>
            <BudgetForm
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditing(null); }}
              defaultValues={editing ?? undefined}
              isLoading={createBudget.isPending || updateBudget.isPending}
            />
          </div>
        </div>
      )}

      {/* Budget grid */}
      {budgets && budgets.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nenhum budget ainda</p>
          <p className="text-sm mt-1">Crie seu primeiro budget para começar</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 ipad-pro:grid-cols-3 gap-4">
        {budgets?.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            spent={getSpent(budget.id)}
            onEdit={() => setEditing(budget)}
            onDelete={() => handleDelete(budget.id)}
          />
        ))}
      </div>
    </div>
  );
}
