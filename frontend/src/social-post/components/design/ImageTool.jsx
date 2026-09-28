import { useRef } from "react";

export default function ImageTool({
  element,
  onAdd,
  onChange,
}) {
  const inputRef = useRef(null);

  const upload = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onAdd({
        name: file.name,
        type: file.type,
        src: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  if (!element) {
    return (
      <section className="space-y-2 rounded-xl border border-stone-100 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          Image
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg bg-stone-900 px-3 py-2.5 text-xs font-bold text-white"
        >
          Upload image
        </button>

        <input
          ref={inputRef}
          id="design-image-input"
          hidden
          type="file"
          accept="image/*"
          onChange={(e) =>
            upload(e.target.files?.[0])
          }
        />
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-stone-100 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          Image
        </p>

        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-stone-200 px-2 py-1 text-[10px] font-bold"
        >
          Replace
        </button>
      </div>

      <input
        ref={inputRef}
        id="design-image-input"
        hidden
        type="file"
        accept="image/*"
        onChange={(e) =>
          upload(e.target.files?.[0])
        }
      />

      <label className="block text-[10px] font-bold text-stone-400">
        Fit
        <select
          value={element.objectFit || "cover"}
          onChange={(e) =>
            onChange({
              objectFit: e.target.value,
            })
          }
          className="mt-1 w-full rounded-lg border border-stone-200 p-2 text-xs"
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Radius"
          value={element.radius || 0}
          onChange={(radius) =>
            onChange({ radius })
          }
        />

        <NumberInput
          label="Border"
          value={element.borderWidth || 0}
          onChange={(borderWidth) =>
            onChange({ borderWidth })
          }
        />
      </div>

      <label className="block text-[10px] font-bold text-stone-400">
        Opacity
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={element.opacity ?? 1}
          onChange={(e) =>
            onChange({
              opacity: Number(
                e.target.value,
              ),
            })
          }
          className="mt-2 w-full"
        />
      </label>

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
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}) {
  return (
    <label className="text-[10px] font-bold text-stone-400">
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