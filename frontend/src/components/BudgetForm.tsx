import { useForm } from "react-hook-form";
import type { BudgetInput, Budget } from "../hooks/useApi";

interface Props {
  onSubmit: (data: BudgetInput) => void;
  onCancel: () => void;
  defaultValues?: Budget;
  isLoading?: boolean;
}

export default function BudgetForm({ onSubmit, onCancel, defaultValues, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<BudgetInput>({
    defaultValues: defaultValues
      ? {
          franquia: defaultValues.franquia,
          produto: defaultValues.produto,
          tema: defaultValues.tema,
          speaker1: defaultValues.speaker1,
          investimento: Number(defaultValues.investimento),
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Franquia</label>
          <input
            {...register("franquia", { required: "Obrigatório" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="ex: Franquia SP"
          />
          {errors.franquia && <p className="text-red-500 text-xs mt-1">{errors.franquia.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
          <input
            {...register("produto")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="ex: Seguro Auto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
          <input
            {...register("tema")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="ex: Campanha Verão"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
          <input
            {...register("speaker1")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="ex: Carlos Silva"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Investimento (R$)</label>
        <input
          type="number"
          step="0.01"
          {...register("investimento", { required: "Obrigatório", valueAsNumber: true, min: { value: 0.01, message: "Deve ser positivo" } })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="50000.00"
        />
        {errors.investimento && <p className="text-red-500 text-xs mt-1">{errors.investimento.message}</p>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50">
          {isLoading ? "Salvando..." : defaultValues ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
