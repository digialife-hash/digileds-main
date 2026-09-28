export default function BackgroundTool({
  color,
  backgroundType = "solid",
  secondColor,
  onChange,
  onTypeChange,
  onSecondColorChange,
}) {
  return (
    <section className="space-y-3 rounded-xl border border-stone-100 p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        Background
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() =>
            onTypeChange("solid")
          }
          className={`rounded-lg border px-2 py-2 text-xs font-bold ${
            backgroundType === "solid"
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200"
          }`}
        >
          Solid
        </button>

        <button
          onClick={() =>
            onTypeChange("gradient")
          }
          className={`rounded-lg border px-2 py-2 text-xs font-bold ${
            backgroundType === "gradient"
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200"
          }`}
        >
          Gradient
        </button>
      </div>

      <ColorRow
        label="Color"
        value={color}
        onChange={onChange}
      />

      {backgroundType === "gradient" && (
        <ColorRow
          label="Second color"
          value={secondColor}
          onChange={onSecondColorChange}
        />
      )}
    </section>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-stone-200 p-2">
      <span className="text-[10px] font-bold text-stone-500">
        {label}
      </span>

      <input
        type="color"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-8 w-10 cursor-pointer"
      />
    </label>
  );
}