import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
const SelectDropdown = ({
  name,
  value,
  options,
  onChange,
  disabled = false,
  multiple = false,
  placeholder = "Select",
  className = "",
  menuClassName = "",
  wrapperClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find(([optionValue]) => String(optionValue) === String(value));
  const selectedValues = Array.isArray(value) ? value.map(String) : [];
  const selectedLabels = multiple
    ? options
        .filter(([optionValue]) => selectedValues.includes(String(optionValue)))
        .map(([, label]) => label)
    : [];
  const buttonLabel = multiple
    ? selectedLabels.length
      ? `${selectedLabels.length} selected`
      : placeholder
    : selectedOption?.[1] || placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (nextValue) => {
    if (multiple) {
      const nextValueString = String(nextValue);
      const nextValues = selectedValues.includes(nextValueString)
        ? selectedValues.filter((currentValue) => currentValue !== nextValueString)
        : [...selectedValues, nextValueString];

      onChange({
        target: {
          name,
          value: nextValues,
          selectedOptions: nextValues.map((optionValue) => ({ value: optionValue })),
        },
      });
      return;
    }

    onChange({
      target: {
        name,
        value: nextValue,
      },
    });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative min-w-0 ${wrapperClassName}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex min-w-0 items-center justify-between gap-2 ${className}`}
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-0 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl ${menuClassName}`}
        >
          {options.map(([optionValue, label]) => {
            const isSelected = multiple
              ? selectedValues.includes(String(optionValue))
              : String(optionValue) === String(value);

            return (
            <button
              key={optionValue}
              type="button"
              onClick={() => selectOption(optionValue)}
              className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-700 ${
                isSelected
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700"
              }`}
            >
              {multiple && (
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <Check size={12} />
                </span>
              )}
              <span className="block truncate">{label}</span>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
