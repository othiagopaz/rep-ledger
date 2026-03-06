import { useForm } from "react-hook-form";
import type { Budget } from "../hooks/useApi";

interface TemplateFormData {
  name: string;
  participante: string;
  valor: string;
  local: string;
  forecast: boolean;
  categoria: string;
  budgetId: string;
}

interface Props {
  budgets: Budget[];
  onSubmit: (data: {
    name: string;
    participante?: string;
    valor?: number;
    local?: string;
    forecast?: boolean;
    categoria?: string;
    budgetId?: number;
  }) => void;
  onCancel: () => void;
  defaultValues?: {
    name: string;
    participante?: string | null;
    valor?: string | number | null;
    local?: string | null;
    forecast?: boolean | null;
    categoria?: string | null;
    budgetId?: number | null;
  };
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function TemplateForm({
  budgets,
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
  isEditing,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      participante: defaultValues?.participante ?? "",
      valor: defaultValues?.valor != null ? String(defaultValues.valor) : "",
      local: defaultValues?.local ?? "",
      forecast: defaultValues?.forecast ?? false,
      categoria: defaultValues?.categoria ?? "",
      budgetId: defaultValues?.budgetId != null ? String(defaultValues.budgetId) : "",
    },
  });

  const onFormSubmit = (data: TemplateFormData) => {
    onSubmit({
      name: data.name,
      participante: data.participante || undefined,
      valor: data.valor ? Number(data.valor) : undefined,
      local: data.local || undefined,
      forecast: data.forecast || undefined,
      categoria: data.categoria || undefined,
      budgetId: data.budgetId ? Number(data.budgetId) : undefined,
    });
  };

  const inputClass =
    "w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Template *
        </label>
        <input
          {...register("name", { required: "Obrigatório" })}
          className={inputClass}
          placeholder="ex: Hospedagem padrão"
          autoFocus
          autoComplete="off"
        />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <p className="text-xs text-gray-400 pt-1">
        Preencha apenas os campos que deseja pré-definir:
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Participante
          </label>
          <input
            {...register("participante")}
            className={inputClass}
            placeholder="Opcional"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("valor")}
            className={inputClass}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Local
          </label>
          <input
            {...register("local")}
            className={inputClass}
            placeholder="Opcional"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Categoria
          </label>
          <input
            {...register("categoria")}
            className={inputClass}
            placeholder="Opcional"
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Budget
        </label>
        <select {...register("budgetId")} className={inputClass}>
          <option value="">Nenhum (opcional)</option>
          {budgets.map((b) => {
            const parts = [b.franquia, b.produto].filter(Boolean);
            const label = parts.join(" - ") + (b.tema ? ` (${b.tema})` : "");
            return (
              <option key={b.id} value={b.id}>
                {label || `Budget #${b.id}`}
              </option>
            );
          })}
        </select>
      </div>

      <label className="flex items-center gap-3 py-2 cursor-pointer">
        <input
          type="checkbox"
          {...register("forecast")}
          className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        <span className="text-sm text-gray-700">Previsão (forecast)</span>
      </label>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar Template"}
        </button>
      </div>
    </form>
  );
}
