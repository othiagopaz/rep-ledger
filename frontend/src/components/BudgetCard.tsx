import { useNavigate } from "react-router-dom";
import type { Budget } from "../hooks/useApi";

interface Props {
  budget: Budget;
  spent?: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function BudgetCard({ budget, spent = 0, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const investimento = Number(budget.investimento);
  const remaining = investimento - spent;
  const utilization = investimento > 0 ? (spent / investimento) * 100 : 0;

  const barColor =
    utilization > 90 ? "bg-red-500" : utilization > 70 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div
      onClick={() => navigate(`/expenses?budgetId=${budget.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{budget.franquia}</h3>
          <p className="text-sm text-gray-500">{budget.produto} &middot; {budget.tema}</p>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">Speaker: {budget.speaker1}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Utilização</span>
          <span className="font-medium">{utilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${Math.min(utilization, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Gasto: R$ {spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          <span>Restante: R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">
          R$ {investimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-xs text-gray-400">
          {budget._count?.expenses ?? 0} despesas
        </span>
      </div>
    </div>
  );
}
