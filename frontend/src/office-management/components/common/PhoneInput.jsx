import { useState } from "react";
import SelectDropdown from "./SelectDropdown";

const countryCodes = [
  { code: "+91", label: "IN" },
  { code: "+1", label: "US" },
  { code: "+44", label: "UK" },
  { code: "+971", label: "AE" },
];

const onlyDigits = (value = "") => value.replace(/\D/g, "").slice(0, 10);

const PhoneInput = ({
  name,
  value,
  onChange,
  className = "",
  countryCode = "+91",
  onCountryCodeChange,
  error,
  placeholder = "Phone number",
  required = false,
}) => {
  const [localCountryCode, setLocalCountryCode] = useState(countryCode);
  const selectedCountryCode = onCountryCodeChange ? countryCode : localCountryCode;

  const handleCountryChange = (value) => {
    if (onCountryCodeChange) {
      onCountryCodeChange(value);
      return;
    }

    setLocalCountryCode(value);
  };

  const handlePhoneChange = (event) => {
    const nextValue = onlyDigits(event.target.value);

    onChange({
      target: {
        name: name || "phone",
        value: nextValue,
      },
    });
  };

  const handleKeyDown = (event) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(event.key) || String(value || "").length >= 10) {
      event.preventDefault();
    }
  };

  return (
    <div
      className={`mt-2 flex h-11 overflow-hidden rounded-lg border bg-white transition focus-within:ring-2 ${
        error
          ? "border-red-300 focus-within:border-red-300 focus-within:ring-red-100"
          : "border-slate-200 focus-within:border-blue-300 focus-within:ring-blue-100"
      } ${className}`}
    >
      <SelectDropdown
        name="countryCode"
        value={selectedCountryCode}
        onChange={(event) => handleCountryChange(event.target.value)}
        options={countryCodes.map((country) => [
          country.code,
          `${country.label} ${country.code}`,
        ])}
        wrapperClassName="w-24 shrink-0"
        className="h-full w-full border-r border-slate-200 bg-slate-50 px-2 text-sm font-bold text-slate-700 outline-none"
      />
      <input
        type="tel"
        inputMode="numeric"
        name={name}
        value={value}
        onChange={handlePhoneChange}
        onKeyDown={handleKeyDown}
        maxLength={10}
        required={required}
        placeholder={placeholder}
        className="min-w-0 flex-1 px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  );
};

export default PhoneInput;
