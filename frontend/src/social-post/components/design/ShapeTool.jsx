import {
  Circle,
  Diamond,
  Minus,
  Pentagon,
  RectangleHorizontal,
  Star,
  Triangle,
} from "lucide-react";

const SHAPES = [
  ["rectangle", "Rectangle", RectangleHorizontal],
  ["rounded", "Rounded", RectangleHorizontal],
  ["circle", "Circle", Circle],
  ["triangle", "Triangle", Triangle],
  ["diamond", "Diamond", Diamond],
  ["star", "Star", Star],
  ["pill", "Pill", RectangleHorizontal],
  ["line", "Line", Minus],
];

export default function ShapeTool({
  element,
  onAddShape,
  onChange,
}) {
  return (
    <section className="space-y-3 rounded-xl border border-stone-100 p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        Shapes
      </p>

      <div className="grid grid-cols-4 gap-1.5">
        {SHAPES.map(
          ([type, label, Icon]) => (
            <button
              key={type}
              onClick={() =>
                onAddShape(type)
              }
              className="flex min-h-[55px] flex-col items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 text-[9px] font-bold hover:bg-stone-100"
            >
              <Icon size={16} />
              {label}
            </button>
          ),
        )}
      </div>

      {!element ? (
        <p className="text-[10px] leading-4 text-stone-400">
          Select a shape to change its color,
          border, shadow or image.
        </p>
      ) : (
        <>
          <ColorInput
            label="Fill"
            value={element.fill}
            onChange={(fill) =>
              onChange({ fill })
            }
          />

          <ColorInput
            label="Border"
            value={element.stroke}
            onChange={(stroke) =>
              onChange({ stroke })
            }
          />

          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Border"
              value={
                element.strokeWidth || 0
              }
              onChange={(strokeWidth) =>
                onChange({ strokeWidth })
              }
            />

            <NumberInput
              label="Radius"
              value={element.radius || 0}
              onChange={(radius) =>
                onChange({ radius })
              }
            />
          </div>

          <label className="flex items-center justify-between rounded-lg bg-stone-50 p-2 text-xs font-semibold">
            Shadow
            <input
              type="checkbox"
              checked={!!element.shadow}
              onChange={(e) =>
                onChange({
                  shadow: e.target.checked,
                })
              }
            />
          </label>

          <div className="border-t border-stone-100 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Shape text
            </p>

            <input
              value={element.text || ""}
              onChange={(e) =>
                onChange({
                  text: e.target.value,
                })
              }
              placeholder="Write inside shape"
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
            />

            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumberInput
                label="Text size"
                value={
                  element.textSize || 28
                }
                onChange={(textSize) =>
                  onChange({ textSize })
                }
              />

              <ColorInput
                label="Text color"
                value={
                  element.textColor ||
                  "#ffffff"
                }
                onChange={(textColor) =>
                  onChange({ textColor })
                }
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Image inside shape
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (!file) return;

                const reader =
                  new FileReader();

                reader.onload = () => {
                  onChange({
                    image:
                      reader.result,
                  });
                };

                reader.readAsDataURL(file);
              }}
              className="w-full text-[10px]"
            />

            {element.image && (
              <button
                onClick={() =>
                  onChange({
                    image: null,
                  })
                }
                className="mt-2 w-full rounded-lg border border-red-200 px-2 py-2 text-xs font-bold text-red-500"
              >
                Remove shape image
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-stone-200 p-2">
      <span className="text-[9px] font-bold text-stone-400">
        {label}
      </span>

      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-7 w-8"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}) {
  return (
    <label className="text-[9px] font-bold text-stone-400">
      {label}

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) =>
          onChange(
            Number(e.target.value),
          )
        }
        className="mt-1 w-full rounded-lg border border-stone-200 p-2 text-xs text-stone-800"
      />
    </label>
  );
}