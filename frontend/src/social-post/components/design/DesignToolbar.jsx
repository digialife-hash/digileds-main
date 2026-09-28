import {
  Circle,
  Image as ImageIcon,
  Minus,
  Square,
  Type,
  Undo2,
  Redo2,
} from "lucide-react";

export default function DesignToolbar({
  background,
  setBackground,
  onAddText,
  onAddImage,
  onAddShape,
  onUndo,
  onRedo,
}) {
  const colors = [
    ["#f5efff", "Lavender"],
    ["#fff1e8", "Peach"],
    ["#e8f5f1", "Mint"],
    ["#eaf0ff", "Sky"],
    ["#ffffff", "White"],
    ["#171717", "Black"],
  ];

  return (
    <div
      className="
        w-full
        overflow-x-auto
        border-b border-stone-200
        bg-white
        px-2
        py-2
        overscroll-x-contain
        [scrollbar-width:none]
        [-ms-overflow-style:none]
      "
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="flex min-w-max items-center gap-1.5 sm:gap-2">
        {/* UNDO */}
        <IconToolButton
          onClick={onUndo}
          title="Undo"
          ariaLabel="Undo"
        >
          <Undo2 size={16} strokeWidth={2} />
        </IconToolButton>

        {/* REDO */}
        <IconToolButton
          onClick={onRedo}
          title="Redo"
          ariaLabel="Redo"
        >
          <Redo2 size={16} strokeWidth={2} />
        </IconToolButton>

        <Divider />

        {/* TEXT */}
        <ToolButton
          icon={<Type size={15} />}
          label="Text"
          onClick={onAddText}
        />

        {/* IMAGE */}
        <ToolButton
          icon={<ImageIcon size={15} />}
          label="Image"
          onClick={onAddImage}
        />

        {/* RECTANGLE */}
        <ToolButton
          icon={<Square size={15} />}
          label="Shape"
          onClick={() => onAddShape("rectangle")}
        />

        {/* CIRCLE */}
        <ToolButton
          icon={<Circle size={15} />}
          label="Circle"
          onClick={() => onAddShape("circle")}
        />

        {/* LINE */}
        <ToolButton
          icon={<Minus size={15} />}
          label="Line"
          onClick={() => onAddShape("line")}
        />

        <Divider />

        {/* COLORS */}
        <div className="flex items-center gap-2 px-0.5">
          {colors.map(([color, label]) => {
            const active = background === color;

            return (
              <button
                key={color}
                type="button"
                onClick={() => setBackground(color)}
                title={label}
                aria-label={`Set background to ${label}`}
                aria-pressed={active}
                className={`
                  relative
                  h-8
                  w-8
                  shrink-0
                  touch-manipulation
                  rounded-full
                  border-2
                  transition-transform
                  active:scale-90
                  sm:h-7
                  sm:w-7
                  ${
                    active
                      ? "border-stone-900 scale-105"
                      : "border-white ring-1 ring-stone-200"
                  }
                `}
                style={{
                  backgroundColor: color,
                }}
              >
                {active && (
                  <span
                    className="
                      absolute
                      inset-0
                      rounded-full
                      ring-1
                      ring-stone-900/20
                    "
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------
   ICON BUTTON
-------------------------------- */

function IconToolButton({
  children,
  onClick,
  title,
  ariaLabel,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className="
        grid
        h-10
        w-10
        shrink-0
        touch-manipulation
        select-none
        place-items-center
        rounded-lg
        border
        border-transparent
        text-stone-600
        transition
        hover:border-stone-200
        hover:bg-stone-100
        hover:text-stone-900
        active:scale-95
        active:bg-stone-100
        sm:h-9
        sm:w-9
      "
    >
      {children}
    </button>
  );
}

/* --------------------------------
   TOOL BUTTON
-------------------------------- */

function ToolButton({
  icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        min-h-10
        shrink-0
        touch-manipulation
        select-none
        items-center
        justify-center
        gap-1.5
        rounded-lg
        border
        border-stone-200
        bg-white
        px-3
        py-2
        text-xs
        font-bold
        text-stone-600
        transition
        hover:bg-stone-50
        hover:text-stone-900
        active:scale-95
        active:bg-stone-100
        sm:min-h-9
      "
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* --------------------------------
   DIVIDER
-------------------------------- */

function Divider() {
  return (
    <div
      aria-hidden="true"
      className="
        mx-1
        h-7
        w-px
        shrink-0
        bg-stone-200
      "
    />
  );
}