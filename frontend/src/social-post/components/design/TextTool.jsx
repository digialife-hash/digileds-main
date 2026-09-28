import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";

const FONTS = [
  "Inter, sans-serif",
  "Arial, sans-serif",
  "Georgia, serif",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
  "Courier New, monospace",
];

export default function TextTool({ element, onChange }) {
  if (!element) {
    return (
      <div className="rounded-xl bg-stone-50 p-3 sm:p-4">
        <p className="text-xs font-semibold leading-5 text-stone-500">
          Select a text layer to edit it.
        </p>
      </div>
    );
  }

  const update = (changes) => onChange(changes);

  return (
    <section className="w-full min-w-0 space-y-3 rounded-xl border border-stone-100 bg-white p-3 sm:p-4">
      {/* TITLE */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        Text
      </p>

      {/* TEXT INPUT */}
      <div className="w-full">
        <textarea
          value={element.text || ""}
          onChange={(e) =>
            update({
              text: e.target.value,
            })
          }
          rows={3}
          placeholder="Write something..."
          className="block min-h-[82px] w-full resize-none rounded-lg border border-stone-200 bg-stone-50 p-3 text-[16px] leading-5 text-stone-900 outline-none transition focus:border-stone-500 focus:bg-white sm:text-sm"
        />
      </div>

      {/* FONT */}
      <div className="w-full min-w-0">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-stone-400">
          Font
        </label>

        <select
          value={element.fontFamily || "Inter, sans-serif"}
          onChange={(e) =>
            update({
              fontFamily: e.target.value,
            })
          }
          className="block h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-[16px] font-semibold text-stone-800 outline-none focus:border-stone-500 sm:h-10 sm:text-xs"
        >
          {FONTS.map((font) => (
            <option key={font} value={font}>
              {font.split(",")[0]}
            </option>
          ))}
        </select>
      </div>

      {/* FONT SIZE + LETTER SPACING */}
      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0 text-[10px] font-bold text-stone-400">
          Font size
          <input
            type="number"
            min="8"
            max="300"
            inputMode="numeric"
            value={element.fontSize || 40}
            onChange={(e) =>
              update({
                fontSize: Number(e.target.value) || 8,
              })
            }
            className="mt-1 block h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-[16px] font-semibold text-stone-800 outline-none focus:border-stone-500 sm:h-10 sm:text-xs"
          />
        </label>

        <label className="min-w-0 text-[10px] font-bold text-stone-400">
          Letter spacing
          <input
            type="number"
            inputMode="decimal"
            value={element.letterSpacing || 0}
            onChange={(e) =>
              update({
                letterSpacing: Number(e.target.value) || 0,
              })
            }
            className="mt-1 block h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-[16px] font-semibold text-stone-800 outline-none focus:border-stone-500 sm:h-10 sm:text-xs"
          />
        </label>
      </div>

      {/* STYLE BUTTONS */}
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">
          Style
        </p>

        <div className="grid grid-cols-3 gap-1.5">
          <IconButton
            active={Number(element.fontWeight) >= 700}
            onClick={() =>
              update({
                fontWeight: Number(element.fontWeight) >= 700 ? 400 : 700,
              })
            }
            label="Bold"
          >
            <Bold size={16} />
          </IconButton>

          <IconButton
            active={element.fontStyle === "italic"}
            onClick={() =>
              update({
                fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
              })
            }
            label="Italic"
          >
            <Italic size={16} />
          </IconButton>

          <IconButton
            active={element.textDecoration === "underline"}
            onClick={() =>
              update({
                textDecoration:
                  element.textDecoration === "underline" ? "none" : "underline",
              })
            }
            label="Underline"
          >
            <Underline size={16} />
          </IconButton>
        </div>
      </div>

      {/* ALIGNMENT */}
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">
          Alignment
        </p>

        <div className="grid grid-cols-3 gap-1.5">
          <IconButton
            active={element.textAlign === "left"}
            onClick={() =>
              update({
                textAlign: "left",
              })
            }
            label="Align left"
          >
            <AlignLeft size={16} />
          </IconButton>

          <IconButton
            active={!element.textAlign || element.textAlign === "center"}
            onClick={() =>
              update({
                textAlign: "center",
              })
            }
            label="Align center"
          >
            <AlignCenter size={16} />
          </IconButton>

          <IconButton
            active={element.textAlign === "right"}
            onClick={() =>
              update({
                textAlign: "right",
              })
            }
            label="Align right"
          >
            <AlignRight size={16} />
          </IconButton>
        </div>
      </div>

      {/* COLORS */}
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">
          Colors
        </p>

        <div className="grid grid-cols-2 gap-2">
          <ColorInput
            label="Text color"
            value={element.color || "#1c1917"}
            onChange={(color) => update({ color })}
          />

          <ColorInput
            label="Background"
            value={
              element.backgroundColor === "transparent" ||
              !element.backgroundColor
                ? "#ffffff"
                : element.backgroundColor
            }
            onChange={(backgroundColor) =>
              update({
                backgroundColor,
              })
            }
          />
        </div>
      </div>

      {/* OPTIONS */}
      <div className="space-y-2">
        <ToggleRow
          label="Auto fit text"
          checked={element.autoFit !== false}
          onChange={(checked) =>
            update({
              autoFit: checked,
            })
          }
        />

        <ToggleRow
          label="Text shadow"
          checked={!!element.shadow}
          onChange={(checked) =>
            update({
              shadow: checked,
            })
          }
        />
      </div>
    </section>
  );
}

/* -------------------------------- */
/* ICON BUTTON */
/* -------------------------------- */

function IconButton({ children, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`
        flex
        h-11
        min-w-0
        touch-manipulation
        items-center
        justify-center
        rounded-lg
        border
        transition
        active:scale-[0.97]
        sm:h-9
        ${
          active
            ? "border-stone-900 bg-stone-900 text-white"
            : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
        }
      `}
    >
      {children}
    </button>
  );
}

/* -------------------------------- */
/* COLOR INPUT */
/* -------------------------------- */

function ColorInput({ label, value, onChange }) {
  return (
    <label className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-2.5">
      <span className="min-w-0 truncate text-[9px] font-bold uppercase tracking-wide text-stone-400">
        {label}
      </span>

      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-9 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0 sm:h-7 sm:w-8"
      />
    </label>
  );
}

/* -------------------------------- */
/* TOGGLE */
/* -------------------------------- */

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex min-h-11 touch-manipulation cursor-pointer items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-700">
      <span className="min-w-0">{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 cursor-pointer accent-stone-900"
      />
    </label>
  );
}
