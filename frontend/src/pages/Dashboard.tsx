import { useState } from "react";
import { Link } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type ViewMode = "all" | "actual" | "forecast";

export default function Dashboard() {
  const { data, isLoading, error } = useAnalytics();
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-center py-20 text-red-500">Falha ao carregar painel</div>;
  if (!data) return null;

  const { overview, budgets, recentExpenses, dailyChart } = data;

  const filteredRecent = recentExpenses.filter((e) => {
    if (viewMode === "actual") return !e.forecast;
    if (viewMode === "forecast") return e.forecast;
    return true;
  });

  const moneyCards = [
    { label: "Orçamento Total", value: `R$ ${overview.totalBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "bg-brand-500" },
    { label: "Total Realizado", value: `R$ ${overview.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "bg-amber-500" },
    { label: "Total Previsto", value: `R$ ${overview.totalForecast.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "bg-blue-500" },
    { label: "Restante", value: `R$ ${overview.totalRemaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "bg-green-500" },
  ];

  const countCards = [
    { label: "Budgets", value: overview.budgetCount },
    { label: "Realizadas", value: overview.expenseCount },
    { label: "Previstas", value: overview.forecastCount, textColor: "text-blue-600" },
    { label: "Utilização Geral", value: `${overview.overallUtilization.toFixed(1)}%` },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/budgets" className="px-3 sm:px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 min-h-[44px] flex items-center">
            Gerenciar Budgets
          </Link>
          <Link to="/expenses" className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 min-h-[44px] flex items-center">
            Nova Despesa
          </Link>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm w-full sm:w-auto sm:inline-flex">
        {(["all", "actual", "forecast"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 sm:flex-none px-3 py-2 font-medium transition-colors min-h-[44px] ${
              viewMode === mode ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {mode === "all" ? "Todos" : mode === "actual" ? "Realizados" : "Previstos"}
          </button>
        ))}
      </div>

      {/* Monetary stat cards */}
      <div className="grid grid-cols-2 ipad-pro:grid-cols-4 gap-2 sm:gap-4">
        {moneyCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3`}>
              <span className="text-white text-sm sm:text-lg font-bold">{stat.label[0]}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mt-1 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Count stat cards */}
      <div className="grid grid-cols-2 ipad-pro:grid-cols-4 gap-2 sm:gap-4">
        {countCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            <p className={`text-lg sm:text-2xl font-bold mt-1 ${stat.textColor ?? "text-gray-900"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Budget utilization bars */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilização por Budget</h2>
        <div className="space-y-4">
          {budgets.map((b) => {
            const actualBar = b.utilization > 90 ? "bg-red-500" : b.utilization > 70 ? "bg-yellow-500" : "bg-green-500";
            return (
              <Link key={b.budgetId} to={`/expenses?budgetId=${b.budgetId}`} className="block hover:bg-gray-50 rounded-lg -mx-2 px-2 py-2 min-h-[44px]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{b.franquia}</span>
                  <span className="text-gray-500">
                    {b.utilization.toFixed(1)}%
                    {b.totalForecast > 0 && (
                      <span className="text-blue-500 ml-1">({b.forecastUtilization.toFixed(1)}% c/ prev.)</span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 relative overflow-hidden">
                  {b.totalForecast > 0 && (
                    <div className="bg-blue-300 h-2.5 rounded-full absolute top-0 left-0" style={{ width: `${Math.min(b.forecastUtilization, 100)}%` }} />
                  )}
                  <div className={`${actualBar} h-2.5 rounded-full relative`} style={{ width: `${Math.min(b.utilization, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>R$ {b.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  <span>R$ {b.investimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Budget breakdown table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detalhamento por Budget</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origem</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orçamento</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Realizado</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Previsto</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Restante</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.map((b) => {
                const utilColor = b.utilization > 90 ? "text-red-600" : b.utilization > 70 ? "text-yellow-600" : "text-green-600";
                return (
                  <tr key={b.budgetId} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3">
                      <Link to={`/expenses?budgetId=${b.budgetId}`} className="hover:text-brand-600">
                        <p className="text-sm font-medium text-gray-900">{b.franquia}</p>
                        <p className="text-xs text-gray-500">{b.produto} &middot; {b.tema}</p>
                      </Link>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900">
                      R$ {b.investimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-right font-medium text-gray-900">
                      R$ {b.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-right text-blue-600">
                      R$ {b.totalForecast.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-600">
                      R$ {b.remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${utilColor}`}>{b.utilization.toFixed(1)}%</span>
                      {b.totalForecast > 0 && (
                        <p className="text-xs text-blue-500">{b.forecastUtilization.toFixed(1)}% c/ prev.</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 sm:px-4 py-3 text-sm text-gray-900">Total</td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900">
                  R$ {overview.totalBudget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900">
                  R$ {overview.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-blue-600">
                  R$ {overview.totalForecast.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900">
                  R$ {overview.totalRemaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-right text-gray-900">{overview.overallUtilization.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Daily chart + Recent expenses */}
      <div className="grid grid-cols-1 ipad-pro:grid-cols-2 gap-4 sm:gap-6">
        {dailyChart.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Despesas Diárias (últimos 30 dias)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    String(name) === "actual" ? "Realizado" : "Previsto",
                  ]}
                  labelFormatter={(label: unknown) => new Date(String(label) + "T12:00:00").toLocaleDateString("pt-BR")}
                />
                <Legend formatter={(value: string) => (value === "actual" ? "Realizado" : "Previsto")} />
                <Bar dataKey="actual" fill="#10b981" name="actual" radius={[2, 2, 0, 0]} />
                <Bar dataKey="forecast" fill="#3b82f6" name="forecast" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Despesas Recentes</h2>
            <Link to="/expenses" className="text-sm text-brand-600 hover:text-brand-700">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {filteredRecent.length === 0 && <p className="text-gray-400 text-sm">Nenhuma despesa encontrada</p>}
            {filteredRecent.map((exp) => (
              <div key={exp.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {exp.participante}
                    {exp.forecast && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Previsto</span>}
                  </p>
                  <p className="text-xs text-gray-500">{exp.budget.franquia} &middot; {new Date(exp.data).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className={`text-sm font-semibold ${exp.forecast ? "text-blue-600" : "text-gray-900"}`}>
                  R$ {exp.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
