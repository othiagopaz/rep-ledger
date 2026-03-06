import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { ExpenseInput, Budget } from "../hooks/useApi";
import { useExpenseSuggestions } from "../hooks/useApi";
import ComboboxField from "./ComboboxField";

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

const STEPS = [
  { fields: ["participante", "valor"] as const, label: "Participante e Valor" },
  { fields: ["local", "categoria"] as const, label: "Local e Categoria" },
  { fields: ["budgetId", "data"] as const, label: "Budget e Data" },
  { fields: ["forecast"] as const, label: "Confirmar" },
];

export default function ExpenseForm({
  budgets,
  onSubmit,
  onCancel,
  onSaveAndDuplicate,
  defaultValues,
  isLoading,
  isEditing,
}: Props) {
  const [step, setStep] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    trigger,
  } = useForm<ExpenseInput>({
    defaultValues: defaultValues ?? { forecast: false, data: todayISO() },
  });

  const { data: participanteSuggestions = [] } = useExpenseSuggestions("participante");
  const { data: localSuggestions = [] } = useExpenseSuggestions("local");
  const { data: categoriaSuggestions = [] } = useExpenseSuggestions("categoria");

  const totalSteps = STEPS.length;

  // Focus first input of current step
  useEffect(() => {
    const firstField = STEPS[step].fields[0];
    setTimeout(() => {
      inputRefs.current[firstField]?.focus();
    }, 100);
  }, [step]);

  const goNext = useCallback(async () => {
    // Validate current step fields before advancing
    const currentFields = STEPS[step].fields as unknown as (keyof ExpenseInput)[];
    const valid = await trigger(currentFields);
    if (!valid) return;

    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  }, [step, totalSteps, trigger]);

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Handle Enter/Return key on inputs to advance
  const handleKeyDown = (e: React.KeyboardEvent, fieldIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentStepFields = STEPS[step].fields;
      if (fieldIndex < currentStepFields.length - 1) {
        // Focus next field in same step
        const nextField = currentStepFields[fieldIndex + 1];
        inputRefs.current[nextField]?.focus();
      } else {
        // Last field in step → advance
        goNext();
      }
    }
  };

  // Helper to combine react-hook-form register with our ref
  const registerWithRef = (name: keyof ExpenseInput, options?: Parameters<typeof register>[1]) => {
    const { ref, ...rest } = register(name, options);
    return {
      ...rest,
      ref: (el: HTMLInputElement | HTMLSelectElement | null) => {
        ref(el);
        inputRefs.current[name] = el;
      },
    };
  };

  // Auto-advance when select changes (budget)
  const watchBudgetId = watch("budgetId");
  const prevBudgetRef = useRef(watchBudgetId);
  useEffect(() => {
    if (step === 2 && watchBudgetId && watchBudgetId !== prevBudgetRef.current) {
      prevBudgetRef.current = watchBudgetId;
      // Focus the date field (second field in step 2)
      setTimeout(() => {
        inputRefs.current["data"]?.focus();
      }, 50);
    }
  }, [watchBudgetId, step]);

  const inputClass =
    "w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col"
    >
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-brand-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Step indicator */}
      <p className="text-xs text-gray-400 mb-3">
        Passo {step + 1} de {totalSteps} &middot; {STEPS[step].label}
      </p>

      {/* Step 0: Participante + Valor */}
      {step === 0 && (
        <div className="space-y-4">
          <ComboboxField
            name="participante"
            control={control}
            rules={{ required: "Obrigatório" }}
            suggestions={participanteSuggestions}
            label="Participante"
            placeholder="ex: João Mendes"
            error={errors.participante}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            inputRef={(el) => { inputRefs.current["participante"] = el; }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              {...registerWithRef("valor", {
                required: "Obrigatório",
                valueAsNumber: true,
                min: { value: 0.01, message: "Deve ser positivo" },
              })}
              className={inputClass}
              placeholder="1500.00"
              onKeyDown={(e) => handleKeyDown(e, 1)}
            />
            {errors.valor && (
              <p className={errorClass}>{errors.valor.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Local + Categoria */}
      {step === 1 && (
        <div className="space-y-4">
          <ComboboxField
            name="local"
            control={control}
            suggestions={localSuggestions}
            label="Local"
            placeholder="ex: São Paulo"
            error={errors.local}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            inputRef={(el) => { inputRefs.current["local"] = el; }}
          />
          <ComboboxField
            name="categoria"
            control={control}
            suggestions={categoriaSuggestions}
            label="Categoria"
            placeholder="ex: Hospedagem, Transporte, Alimentação"
            error={errors.categoria}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            inputRef={(el) => { inputRefs.current["categoria"] = el; }}
          />
        </div>
      )}

      {/* Step 2: Budget + Data */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget
            </label>
            <select
              {...registerWithRef("budgetId", {
                required: "Obrigatório",
                valueAsNumber: true,
              })}
              className={inputClass}
            >
              <option value="">Selecione um budget...</option>
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
            {errors.budgetId && (
              <p className={errorClass}>{errors.budgetId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              {...registerWithRef("data", { required: "Obrigatório" })}
              className={`${inputClass} appearance-none bg-white`}
              style={{ WebkitAppearance: "none", minHeight: "48px", colorScheme: "light" }}
              onKeyDown={(e) => handleKeyDown(e, 1)}
            />
            {errors.data && (
              <p className={errorClass}>{errors.data.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Forecast toggle + Summary */}
      {step === 3 && (
        <div className="space-y-4">
          <label className="flex items-center gap-4 py-3 px-3 rounded-lg border border-gray-200 cursor-pointer active:bg-gray-50">
            <span className="relative inline-flex items-center flex-shrink-0">
              <input
                type="checkbox"
                {...register("forecast")}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[26px] after:w-[26px] after:transition-all peer-checked:bg-blue-500"></div>
            </span>
            <span className="text-base font-medium text-gray-700">
              Previsão (despesa prevista)
            </span>
          </label>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Resumo</p>
            <SummaryRow label="Participante" value={watch("participante")} />
            <SummaryRow
              label="Valor"
              value={
                watch("valor")
                  ? `R$ ${Number(watch("valor")).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : ""
              }
            />
            <SummaryRow label="Local" value={watch("local")} />
            <SummaryRow label="Categoria" value={watch("categoria")} />
            <SummaryRow
              label="Budget"
              value={
                (() => {
                  const b = budgets.find((b) => b.id === Number(watch("budgetId")));
                  if (!b) return "";
                  return [b.franquia, b.produto].filter(Boolean).join(" - ") || `Budget #${b.id}`;
                })()
              }
            />
            <SummaryRow
              label="Data"
              value={
                watch("data")
                  ? new Date(watch("data") + "T12:00:00").toLocaleDateString("pt-BR")
                  : ""
              }
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-5 mt-2 border-t border-gray-100">
        {step === 0 ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Voltar
          </button>
        )}

        <div className="flex-1" />

        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
          >
            Próximo
          </button>
        ) : (
          <div className="flex gap-2">
            {!isEditing && onSaveAndDuplicate && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSubmit((data) => onSaveAndDuplicate(data))}
                className="px-4 py-2.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 disabled:opacity-50"
              >
                {isLoading ? "..." : "Salvar e Duplicar"}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {isLoading
                ? "Salvando..."
                : isEditing
                  ? "Atualizar"
                  : "Adicionar"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value || "—"}</span>
    </div>
  );
}
