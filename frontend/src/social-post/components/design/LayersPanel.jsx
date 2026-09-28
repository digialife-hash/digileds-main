import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  LockOpen,
  Trash2,
} from "lucide-react";

export default function LayersPanel({
  elements = [],
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-stone-900">
            Layers
          </h2>

          <p className="text-[10px] text-stone-400">
            {elements.length} elements
          </p>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {elements.length === 0 ? (
          <div className="rounded-xl bg-stone-50 p-6 text-center text-xs text-stone-400">
            No elements yet
          </div>
        ) : (
          [...elements]
            .reverse()
            .map((element) => {
              const actualIndex =
                elements.findIndex(
                  (item) =>
                    item.id === element.id,
                );

              const selected =
                selectedId === element.id;

              return (
                <div
                  key={element.id}
                  className={`mb-1 flex items-center gap-1 rounded-xl border p-1 transition ${
                    selected
                      ? "border-stone-900 bg-stone-50"
                      : "border-transparent hover:border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelect(element.id)
                    }
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left"
                  >
                    <GripVertical
                      size={13}
                      className="shrink-0 text-stone-300"
                    />

                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold shadow-sm">
                      {element.type === "text"
                        ? "T"
                        : element.type === "image"
                          ? "▧"
                          : element.type === "shape"
                            ? "◆"
                            : "✨"}
                    </div>

                    <span className="min-w-0 truncate text-xs font-semibold text-stone-700">
                      {element.name ||
                        element.text ||
                        element.type}
                    </span>
                  </button>

                  <button
                    type="button"
                    title={
                      element.visible === false
                        ? "Show"
                        : "Hide"
                    }
                    onClick={() =>
                      onUpdate(element.id, {
                        visible:
                          element.visible ===
                          false,
                      })
                    }
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-white hover:text-stone-900"
                  >
                    {element.visible ===
                    false ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>

                  <button
                    type="button"
                    title={
                      element.locked
                        ? "Unlock"
                        : "Lock"
                    }
                    onClick={() =>
                      onUpdate(element.id, {
                        locked:
                          !element.locked,
                      })
                    }
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-white hover:text-stone-900"
                  >
                    {element.locked ? (
                      <Lock size={14} />
                    ) : (
                      <LockOpen size={14} />
                    )}
                  </button>

                  {selected && (
                    <>
                      <button
                        type="button"
                        title="Move up"
                        disabled={
                          actualIndex ===
                          elements.length - 1
                        }
                        onClick={() =>
                          onMoveUp(element.id)
                        }
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-white disabled:opacity-20"
                      >
                        <ChevronUp size={14} />
                      </button>

                      <button
                        type="button"
                        title="Move down"
                        disabled={
                          actualIndex === 0
                        }
                        onClick={() =>
                          onMoveDown(element.id)
                        }
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-white disabled:opacity-20"
                      >
                        <ChevronDown size={14} />
                      </button>

                      <button
                        type="button"
                        title="Duplicate"
                        onClick={() =>
                          onDuplicate(element.id)
                        }
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-white hover:text-stone-900"
                      >
                        <Copy size={14} />
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        onClick={() =>
                          onDelete(element.id)
                        }
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-white hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              );
            })
        )}
      </div>
    </section>
  );
}