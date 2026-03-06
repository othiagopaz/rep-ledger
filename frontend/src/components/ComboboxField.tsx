import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Controller, type Control, type RegisterOptions, type FieldError } from "react-hook-form";
import type { ExpenseInput } from "../hooks/useApi";

interface ComboboxFieldProps {
  name: keyof ExpenseInput;
  control: Control<ExpenseInput>;
  rules?: RegisterOptions<ExpenseInput>;
  suggestions: string[];
  label: string;
  placeholder?: string;
  error?: FieldError;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}

const inputClass =
  "w-full px-3 py-3 pr-9 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

export default function ComboboxField({
  name,
  control,
  rules,
  suggestions,
  label,
  placeholder,
  error,
  onKeyDown: parentKeyDown,
  inputRef: parentInputRef,
}: ComboboxFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={rules as RegisterOptions<ExpenseInput, typeof name>}
        render={({ field }) => (
          <ComboboxInput
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            fieldRef={field.ref}
            suggestions={suggestions}
            placeholder={placeholder}
            parentKeyDown={parentKeyDown}
            parentInputRef={parentInputRef}
          />
        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

interface ComboboxInputProps {
  value: string;
  onChange: (value: string) => void;
  fieldRef: React.Ref<HTMLInputElement>;
  suggestions: string[];
  placeholder?: string;
  parentKeyDown?: (e: React.KeyboardEvent) => void;
  parentInputRef?: (el: HTMLInputElement | null) => void;
}

function ComboboxInput({
  value,
  onChange,
  fieldRef,
  suggestions,
  placeholder,
  parentKeyDown,
  parentInputRef,
}: ComboboxInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync with external value changes (edit mode, template, etc.)
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const filtered = useMemo(() => {
    if (!inputValue.trim()) return suggestions;
    const q = inputValue.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(q));
  }, [inputValue, suggestions]);

  const commit = useCallback(
    (val: string) => {
      setInputValue(val);
      onChange(val);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const selectItem = useCallback(
    (item: string) => {
      commit(item);
      // Re-focus the input after selection so keyboard nav still works
      setTimeout(() => localInputRef.current?.focus(), 10);
    },
    [commit]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    clearTimeout(blurTimeoutRef.current);
    setIsOpen(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      commit(inputValue);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) {
      // Dropdown closed — let parent handle Enter for step navigation
      if (e.key === "Escape") return;
      parentKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          selectItem(filtered[highlightedIndex]);
        } else {
          // Commit typed value and let parent handle step advance
          commit(inputValue);
          parentKeyDown?.(e);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        // For other keys, don't propagate (user is typing)
        break;
    }
  };

  // Click-outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0) return;
    const container = containerRef.current?.querySelector("[data-dropdown]");
    const item = container?.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  // Merge refs
  const setRef = useCallback(
    (el: HTMLInputElement | null) => {
      localInputRef.current = el;
      parentInputRef?.(el);
      if (typeof fieldRef === "function") fieldRef(el);
    },
    [parentInputRef, fieldRef]
  );

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={setRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClass}
        placeholder={placeholder}
        autoComplete="off"
      />
      {/* Chevron indicator */}
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>

      {isOpen && filtered.length > 0 && (
        <div
          data-dropdown
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filtered.map((item, i) => (
            <button
              key={item}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(item);
              }}
              className={`w-full text-left px-4 py-3 text-base transition-colors ${
                i === highlightedIndex
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-700 active:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
