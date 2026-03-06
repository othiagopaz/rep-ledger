import { useForm } from "react-hook-form";
import type { ExpenseInput, Budget } from "../hooks/useApi";

interface Props {
  budgets: Budget[];
  onSubmit: (data: ExpenseInput) => void;
  onCancel: () => void;
  onSaveAndDuplicate?: (data: ExpenseInput) => void;
  defaultValues?: {
    participante: string;
    valor: number;
    local: string;
    forecast: boolean;
    data: string;
    categoria: string;
    budgetId: number;
  };
  isLoading?: boolean;
  isEditing?: boolean;
}

const todayISO = () => new Date().toISOString().split("T")[0];

export default function ExpenseForm({
  budgets,
  onSubmit,
  onCancel,
  onSaveAndDuplicate,
  defaultValues,
  isLoading,
  isEditing,
}: Props) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ExpenseInput>({
    defaultValues: defaultValues ?? { forecast: false, data: todayISO() },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Participante
        </label>
        <input
          {...register("participante", { required: "Obrigatório" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="ex: João Mendes"
        />
        {errors.participante && (
          <p className="text-red-500 text-xs mt-1">
            {errors.participante.message}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor (R$)
        </label>
        <input
          type="number"
          step="0.01"
          {...register("valor", {
            required: "Obrigatório",
            valueAsNumber: true,
            min: { value: 0.01, message: "Deve ser positivo" },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="1500.00"
        />
        {errors.valor && (
          <p className="text-red-500 text-xs mt-1">{errors.valor.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Local
        </label>
        <input
          {...register("local")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="ex: São Paulo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <input
          type="date"
          {...register("data", { required: "Obrigatório" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        {errors.data && (
          <p className="text-red-500 text-xs mt-1">{errors.data.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <input
          {...register("categoria")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="ex: Hospedagem, Transporte, Alimentação"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Budget
        </label>
        <select
          {...register("budgetId", {
            required: "Obrigatório",
            valueAsNumber: true,
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">Selecione um budget...</option>
          {budgets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.franquia} - {b.produto} ({b.tema})
            </option>
          ))}
        </select>
        {errors.budgetId && (
          <p className="text-red-500 text-xs mt-1">{errors.budgetId.message}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            {...register("forecast")}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
        <span className="text-sm font-medium text-gray-700">Previsão</span>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        {!isEditing && onSaveAndDuplicate && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit((data) => onSaveAndDuplicate(data))}
            className="px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Salvar e Duplicar"}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          {isLoading
            ? "Salvando..."
            : isEditing
              ? "Atualizar"
              : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
