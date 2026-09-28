import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const normalizeRotation = (angle) => {
  let value = angle % 360;

  if (value > 180) {
    value -= 360;
  }

  if (value < -180) {
    value += 360;
  }

  return value;
};

const FORMATS = {
  "Square post": "aspect-square",
  "Story / Reel": "aspect-[9/16]",
  "Landscape post": "aspect-[1200/628]",
  "LinkedIn banner": "aspect-[1584/396]",
};

const MIN_ELEMENT_SIZE = 3;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 300;

const DRAG_THRESHOLD = 4;

/* ========================================================================= */
/* DESIGN CANVAS                                                             */
/* ========================================================================= */

export default function DesignCanvas({
  format = "Square post",
  background = "#f5efff",
  backgroundType = "solid",
  backgroundSecond = "#ffffff",
  elements = [],
  selectedId,
  onSelect,
  onUpdate,
  preview = false,
}) {
  const canvasRef = useRef(null);

  const pendingRef = useRef(null);
  const activeRef = useRef(null);
  const frameRef = useRef(null);

  const [interaction, setInteraction] =
    useState(null);

  const [editingTextId, setEditingTextId] =
    useState(null);

  const selected = elements.find(
    (item) => item.id === selectedId,
  );

  const backgroundStyle =
    backgroundType === "gradient"
      ? {
          background: `linear-gradient(135deg, ${background}, ${backgroundSecond})`,
        }
      : {
          background,
        };

  /* ----------------------------------------------------------------------- */
  /* GET CANVAS POINT                                                        */
  /* ----------------------------------------------------------------------- */

  const getPoint = useCallback((event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return {
        x: 0,
        y: 0,
      };
    }

    return {
      x:
        ((event.clientX - rect.left) /
          rect.width) *
        100,

      y:
        ((event.clientY - rect.top) /
          rect.height) *
        100,
    };
  }, []);

  /* ----------------------------------------------------------------------- */
  /* START NORMAL ELEMENT INTERACTION                                       */
  /* ----------------------------------------------------------------------- */

  const startElementPointer = useCallback(
    (event, element) => {
      if (
        preview ||
        element.locked ||
        editingTextId === element.id
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      /*
       * Single click ALWAYS selects the element.
       */
      onSelect(element.id);

      const point = getPoint(event);

      pendingRef.current = {
        mode: "pending-drag",

        id: element.id,

        pointerId:
          event.pointerId,

        startClientX:
          event.clientX,

        startClientY:
          event.clientY,

        startX:
          point.x,

        startY:
          point.y,

        originalX:
          toNumber(element.x),

        originalY:
          toNumber(element.y),

        originalWidth:
          toNumber(
            element.width,
            10,
          ),

        originalHeight:
          toNumber(
            element.height,
            10,
          ),

        originalFontSize:
          toNumber(
            element.fontSize,
            40,
          ),
      };

      try {
        event.currentTarget?.setPointerCapture?.(
          event.pointerId,
        );
      } catch {}
    },
    [
      editingTextId,
      getPoint,
      onSelect,
      preview,
    ],
  );

  /* ----------------------------------------------------------------------- */
  /* ACTIVATE DRAG                                                           */
  /* ----------------------------------------------------------------------- */

  const activateDrag = useCallback(
    (event) => {
      const pending =
        pendingRef.current;

      if (!pending) {
        return;
      }

      if (
        event.pointerId !==
        pending.pointerId
      ) {
        return;
      }

      const dx =
        event.clientX -
        pending.startClientX;

      const dy =
        event.clientY -
        pending.startClientY;

      const distance = Math.sqrt(
        dx * dx + dy * dy,
      );

      if (
        distance <
        DRAG_THRESHOLD
      ) {
        return;
      }

      activeRef.current = {
        ...pending,

        mode: "drag",
      };

      pendingRef.current =
        null;

      setInteraction({
        mode: "drag",
        id: pending.id,
      });
    },
    [],
  );

  /* ----------------------------------------------------------------------- */
  /* START RESIZE                                                           */
  /* ----------------------------------------------------------------------- */

  const startResize = useCallback(
    (event, element, handle) => {
      if (
        preview ||
        element.locked
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      onSelect(element.id);

      pendingRef.current =
        null;

      const point =
        getPoint(event);

      const width =
        toNumber(
          element.width,
          10,
        );

      const height =
        toNumber(
          element.height,
          10,
        );

      const fontSize =
        toNumber(
          element.fontSize,
          40,
        );

      activeRef.current = {
        mode: "resize",

        id: element.id,

        pointerId:
          event.pointerId,

        handle,

        startX:
          point.x,

        startY:
          point.y,

        originalX:
          toNumber(element.x),

        originalY:
          toNumber(element.y),

        originalWidth:
          width,

        originalHeight:
          height,

        originalFontSize:
          fontSize,

        originalRatio:
          width /
          Math.max(
            height,
            0.001,
          ),
      };

      try {
        event.currentTarget?.setPointerCapture?.(
          event.pointerId,
        );
      } catch {}

      setInteraction({
        mode: "resize",
        id: element.id,
        handle,
      });
    },
    [
      getPoint,
      onSelect,
      preview,
    ],
  );

  /* ----------------------------------------------------------------------- */
  /* START ROTATE                                                            */
  /* ----------------------------------------------------------------------- */

  const startRotate = useCallback(
    (event, element) => {
      if (
        preview ||
        element.locked
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      onSelect(element.id);

      pendingRef.current =
        null;

      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      const x =
        toNumber(element.x);

      const y =
        toNumber(element.y);

      const width =
        toNumber(
          element.width,
          10,
        );

      const height =
        toNumber(
          element.height,
          10,
        );

      const centerX =
        rect.left +
        ((x + width / 2) /
          100) *
          rect.width;

      const centerY =
        rect.top +
        ((y + height / 2) /
          100) *
          rect.height;

      const startAngle =
        Math.atan2(
          event.clientY -
            centerY,
          event.clientX -
            centerX,
        ) *
        (180 / Math.PI);

      activeRef.current = {
        mode: "rotate",

        id: element.id,

        pointerId:
          event.pointerId,

        startAngle,

        originalRotation:
          toNumber(
            element.rotation,
          ),
      };

      try {
        event.currentTarget?.setPointerCapture?.(
          event.pointerId,
        );
      } catch {}

      setInteraction({
        mode: "rotate",
        id: element.id,
      });
    },
    [
      onSelect,
      preview,
    ],
  );

  /* ----------------------------------------------------------------------- */
  /* POINTER MOVE                                                            */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    const handleMove = (event) => {
      if (
        pendingRef.current &&
        !activeRef.current
      ) {
        activateDrag(event);
      }

      const data =
        activeRef.current;

      if (!data) {
        return;
      }

      if (
        event.pointerId !==
        data.pointerId
      ) {
        return;
      }

      if (
        frameRef.current
      ) {
        cancelAnimationFrame(
          frameRef.current,
        );
      }

      frameRef.current =
        requestAnimationFrame(() => {
          const element =
            elements.find(
              (item) =>
                item.id ===
                data.id,
            );

          if (!element) {
            return;
          }

          const point =
            getPoint(event);

          /* ============================================================= */
          /* DRAG                                                          */
          /* ============================================================= */

          if (
            data.mode ===
            "drag"
          ) {
            event.preventDefault();

            const dx =
              point.x -
              data.startX;

            const dy =
              point.y -
              data.startY;

            const width =
              data.originalWidth;

            const height =
              data.originalHeight;

            const x = clamp(
              data.originalX +
                dx,

              0,

              Math.max(
                0,
                100 - width,
              ),
            );

            const y = clamp(
              data.originalY +
                dy,

              0,

              Math.max(
                0,
                100 - height,
              ),
            );

            /*
             * IMPORTANT:
             * Drag changes ONLY x/y.
             *
             * Font size remains untouched.
             */
            onUpdate(
              element.id,
              {
                x,
                y,
              },
            );

            return;
          }

          /* ============================================================= */
          /* RESIZE                                                        */
          /* ============================================================= */

          if (
            data.mode ===
            "resize"
          ) {
            event.preventDefault();

            resizeElement(
              element,
              point,
              data,
              {
                shift:
                  event.shiftKey,

                alt:
                  event.altKey,
              },
              onUpdate,
            );

            return;
          }

          /* ============================================================= */
          /* ROTATE                                                        */
          /* ============================================================= */

          if (
            data.mode ===
            "rotate"
          ) {
            event.preventDefault();

            const canvas =
              canvasRef.current;

            if (!canvas) {
              return;
            }

            const rect =
              canvas.getBoundingClientRect();

            const x =
              toNumber(element.x);

            const y =
              toNumber(element.y);

            const width =
              toNumber(
                element.width,
                10,
              );

            const height =
              toNumber(
                element.height,
                10,
              );

            const centerX =
              rect.left +
              ((x + width / 2) /
                100) *
                rect.width;

            const centerY =
              rect.top +
              ((y + height / 2) /
                100) *
                rect.height;

            let angle =
              Math.atan2(
                event.clientY -
                  centerY,

                event.clientX -
                  centerX,
              ) *
              (180 / Math.PI);

            let rotation =
              data.originalRotation +
              angle -
              data.startAngle;

            /*
             * SHIFT = 15° snapping.
             */
            if (
              event.shiftKey
            ) {
              rotation =
                Math.round(
                  rotation / 15,
                ) * 15;
            }

            rotation =
              normalizeRotation(
                rotation,
              );

            onUpdate(
              element.id,
              {
                rotation,
              },
            );
          }
        });
    };

    const stop = () => {
      if (
        frameRef.current
      ) {
        cancelAnimationFrame(
          frameRef.current,
        );

        frameRef.current =
          null;
      }

      pendingRef.current =
        null;

      activeRef.current =
        null;

      setInteraction(null);
    };

    window.addEventListener(
      "pointermove",
      handleMove,
      {
        passive: false,
      },
    );

    window.addEventListener(
      "pointerup",
      stop,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "pointercancel",
      stop,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handleMove,
      );

      window.removeEventListener(
        "pointerup",
        stop,
      );

      window.removeEventListener(
        "pointercancel",
        stop,
      );

      if (
        frameRef.current
      ) {
        cancelAnimationFrame(
          frameRef.current,
        );

        frameRef.current =
          null;
      }
    };
  }, [
    activateDrag,
    elements,
    getPoint,
    onUpdate,
  ]);

  /* ----------------------------------------------------------------------- */
  /* KEYBOARD MOVE                                                           */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    const handleKeyDown = (
      event,
    ) => {
      if (
        preview ||
        !selectedId ||
        editingTextId !== null
      ) {
        return;
      }

      const target =
        event.target;

      if (
        target?.isContentEditable ||
        target?.tagName ===
          "INPUT" ||
        target?.tagName ===
          "TEXTAREA" ||
        target?.tagName ===
          "SELECT"
      ) {
        return;
      }

      const element =
        elements.find(
          (item) =>
            item.id ===
            selectedId,
        );

      if (
        !element ||
        element.locked
      ) {
        return;
      }

      let x =
        toNumber(element.x);

      let y =
        toNumber(element.y);

      const step =
        event.shiftKey
          ? 2
          : 0.5;

      let handled = true;

      if (
        event.key ===
        "ArrowLeft"
      ) {
        x -= step;
      } else if (
        event.key ===
        "ArrowRight"
      ) {
        x += step;
      } else if (
        event.key ===
        "ArrowUp"
      ) {
        y -= step;
      } else if (
        event.key ===
        "ArrowDown"
      ) {
        y += step;
      } else {
        handled = false;
      }

      if (!handled) {
        return;
      }

      event.preventDefault();

      const width =
        toNumber(
          element.width,
          10,
        );

      const height =
        toNumber(
          element.height,
          10,
        );

      onUpdate(
        element.id,
        {
          x: clamp(
            x,
            0,
            Math.max(
              0,
              100 - width,
            ),
          ),

          y: clamp(
            y,
            0,
            Math.max(
              0,
              100 - height,
            ),
          ),
        },
      );
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    editingTextId,
    elements,
    onUpdate,
    preview,
    selectedId,
  ]);

  /* ----------------------------------------------------------------------- */
  /* CANVAS POINTER                                                          */
  /* ----------------------------------------------------------------------- */

  const handleCanvasPointerDown = (
    event,
  ) => {
    if (
      event.target !==
      event.currentTarget
    ) {
      return;
    }

    if (
      editingTextId !== null
    ) {
      setEditingTextId(
        null,
      );
    }

    onSelect(null);
  };

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */

  return (
    <div
      ref={canvasRef}
      data-design-canvas
      onPointerDown={
        handleCanvasPointerDown
      }
      className={`relative w-full overflow-hidden rounded-xl shadow-2xl ${
        FORMATS[format] ||
        "aspect-square"
      }`}
      style={{
        ...backgroundStyle,

        touchAction:
          "none",

        userSelect:
          "none",

        WebkitUserSelect:
          "none",
      }}
    >
      {/* GRID */}

      {!preview && (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            opacity-[0.035]
            [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)]
            [background-size:24px_24px]
          "
        />
      )}

      {/* ELEMENTS */}

      {elements.map(
        (element) => {
          if (
            element.visible ===
            false
          ) {
            return null;
          }

          return (
            <CanvasElement
              key={element.id}
              element={element}
              selected={
                !preview &&
                element.id ===
                  selectedId
              }
              editing={
                editingTextId ===
                element.id
              }
              preview={
                preview
              }
              onBeginDrag={
                startElementPointer
              }
              onResize={
                startResize
              }
              onRotate={
                startRotate
              }
              onStartEditing={() =>
                setEditingTextId(
                  element.id,
                )
              }
              onStopEditing={() =>
                setEditingTextId(
                  null,
                )
              }
              onSelect={onSelect}
              onUpdate={onUpdate}
            />
          );
        },
      )}

      {/* INFO */}

      {selected &&
        !preview &&
        editingTextId ===
          null && (
          <SelectionInfo
            element={
              selected
            }
            interaction={
              interaction
            }
          />
        )}
    </div>
  );
}

/* ========================================================================= */
/* CANVAS ELEMENT                                                            */
/* ========================================================================= */

function CanvasElement({
  element,
  selected,
  editing,
  preview,
  onBeginDrag,
  onResize,
  onRotate,
  onStartEditing,
  onStopEditing,
  onSelect,
  onUpdate,
}) {
  const baseStyle = {
    position:
      "absolute",

    left: `${toNumber(
      element.x,
    )}%`,

    top: `${toNumber(
      element.y,
    )}%`,

    width: `${Math.max(
      MIN_ELEMENT_SIZE,
      toNumber(
        element.width,
        10,
      ),
    )}%`,

    height: `${Math.max(
      MIN_ELEMENT_SIZE,
      toNumber(
        element.height,
        10,
      ),
    )}%`,

    transform: `rotate(${toNumber(
      element.rotation,
    )}deg)`,

    opacity:
      element.opacity ??
      1,

    touchAction:
      editing
        ? "auto"
        : "none",

    userSelect:
      editing
        ? "text"
        : "none",

    WebkitUserSelect:
      editing
        ? "text"
        : "none",
  };

  const shadow =
    element.shadow
      ? `${toNumber(
          element.shadowX,
          0,
        )}px ${toNumber(
          element.shadowY,
          5,
        )}px ${toNumber(
          element.shadowBlur,
          15,
        )}px ${
          element.shadowColor ||
          "#000000"
        }55`
      : "none";

  /* ----------------------------------------------------------------------- */
  /* TEXT                                                                    */
  /* ----------------------------------------------------------------------- */

  if (
    element.type ===
    "text"
  ) {
    return (
      <TextElement
        element={element}
        selected={selected}
        editing={editing}
        preview={preview}
        baseStyle={
          baseStyle
        }
        shadow={shadow}
        onBeginDrag={
          onBeginDrag
        }
        onResize={onResize}
        onRotate={onRotate}
        onStartEditing={
          onStartEditing
        }
        onStopEditing={
          onStopEditing
        }
        onSelect={onSelect}
        onUpdate={onUpdate}
      />
    );
  }

  /* ----------------------------------------------------------------------- */
  /* IMAGE                                                                   */
  /* ----------------------------------------------------------------------- */

  if (
    element.type ===
    "image"
  ) {
    return (
      <div
        style={{
          ...baseStyle,

          zIndex:
            toNumber(
              element.zIndex,
              15,
            ),

          overflow:
            "hidden",

          borderRadius: `${toNumber(
            element.radius,
          )}px`,

          boxShadow: shadow,

          border: `${toNumber(
            element.borderWidth,
          )}px solid ${
            element.borderColor ||
            "#ffffff"
          }`,

          cursor:
            preview
              ? "default"
              : element.locked
                ? "not-allowed"
                : "move",
        }}
        onPointerDown={(
          event,
        ) => {
          if (
            preview ||
            element.locked
          ) {
            return;
          }

          onBeginDrag(
            event,
            element,
          );
        }}
      >
        <img
          src={element.src}
          alt={
            element.name ||
            "Design"
          }
          draggable={false}
          onDragStart={(event) =>
            event.preventDefault()
          }
          className="
            pointer-events-none
            block
            h-full
            w-full
            select-none
          "
          style={{
            objectFit:
              element.objectFit ||
              "cover",

            objectPosition:
              element.objectPosition ||
              "center",

            filter:
              element.filter ||
              "none",
          }}
        />

        {selected &&
          !editing && (
            <ResizeHandles
              element={
                element
              }
              onResize={
                onResize
              }
              onRotate={
                onRotate
              }
            />
          )}
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* SHAPE                                                                   */
  /* ----------------------------------------------------------------------- */

  if (
    element.type ===
    "shape"
  ) {
    return (
      <div
        style={{
          ...baseStyle,

          zIndex:
            toNumber(
              element.zIndex,
              10,
            ),

          boxShadow: shadow,

          cursor:
            preview
              ? "default"
              : element.locked
                ? "not-allowed"
                : "move",
        }}
        onPointerDown={(
          event,
        ) => {
          if (
            preview ||
            element.locked
          ) {
            return;
          }

          onBeginDrag(
            event,
            element,
          );
        }}
      >
        <ShapeVisual
          element={
            element
          }
        />

        {selected &&
          !editing && (
            <ResizeHandles
              element={
                element
              }
              onResize={
                onResize
              }
              onRotate={
                onRotate
              }
            />
          )}
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* STICKER                                                                 */
  /* ----------------------------------------------------------------------- */

  if (
    element.type ===
    "sticker"
  ) {
    return (
      <div
        style={{
          ...baseStyle,

          zIndex:
            toNumber(
              element.zIndex,
              25,
            ),

          display:
            "grid",

          placeItems:
            "center",

          fontSize: `${
            toNumber(
              element.fontSize,
              70,
            )
          }px`,

          cursor:
            preview
              ? "default"
              : element.locked
                ? "not-allowed"
                : "move",
        }}
        onPointerDown={(
          event,
        ) => {
          if (
            preview ||
            element.locked
          ) {
            return;
          }

          onBeginDrag(
            event,
            element,
          );
        }}
      >
        <span className="pointer-events-none select-none">
          {element.text ||
            "✨"}
        </span>

        {selected &&
          !editing && (
            <ResizeHandles
              element={
                element
              }
              onResize={
                onResize
              }
              onRotate={
                onRotate
              }
            />
          )}
      </div>
    );
  }

  return null;
}

/* ========================================================================= */
/* TEXT ELEMENT                                                              */
/* ========================================================================= */

function TextElement({
  element,
  selected,
  editing,
  preview,
  baseStyle,
  shadow,
  onBeginDrag,
  onResize,
  onRotate,
  onStartEditing,
  onStopEditing,
  onSelect,
  onUpdate,
}) {
  const editorRef =
    useRef(null);

  const [draft, setDraft] =
    useState(
      element.text || "",
    );

  useEffect(() => {
    if (!editing) {
      setDraft(
        element.text || "",
      );
    }
  }, [
    editing,
    element.text,
  ]);

  useEffect(() => {
    if (
      !editing ||
      !editorRef.current
    ) {
      return;
    }

    const textarea =
      editorRef.current;

    textarea.focus();

    const length =
      textarea.value.length;

    try {
      textarea.setSelectionRange(
        length,
        length,
      );
    } catch {}
  }, [editing]);

  const save = useCallback(() => {
    const next =
      draft.replace(
        /\r/g,
        "",
      );

    if (
      next !==
      (element.text || "")
    ) {
      onUpdate(
        element.id,
        {
          text: next,
        },
      );
    }

    /*
     * Very important:
     * selection is NOT cleared.
     *
     * So after edit closes:
     * selected === true
     * handles appear again.
     */
    onStopEditing();
    onSelect(element.id);
  }, [
    draft,
    element.id,
    element.text,
    onSelect,
    onStopEditing,
    onUpdate,
  ]);

  const cancel = useCallback(() => {
    setDraft(
      element.text || "",
    );

    /*
     * Keep the element selected.
     */
    onStopEditing();
    onSelect(element.id);
  }, [
    element.id,
    element.text,
    onSelect,
    onStopEditing,
  ]);

  /* ----------------------------------------------------------------------- */
  /* DOUBLE CLICK = EDIT                                                     */
  /* ----------------------------------------------------------------------- */

  const handleDoubleClick = (
    event,
  ) => {
    if (
      preview ||
      element.locked
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    /*
     * Select first.
     */
    onSelect(element.id);

    /*
     * Then enter edit mode.
     */
    onStartEditing();
  };

  /* ----------------------------------------------------------------------- */
  /* EDIT MODE                                                               */
  /* ----------------------------------------------------------------------- */

  if (editing) {
    return (
      <div
        style={{
          ...baseStyle,

          zIndex: 999,

          display:
            "block",

          padding: 0,

          margin: 0,

          overflow:
            "visible",

          boxSizing:
            "border-box",

          background:
            element.backgroundColor &&
            element.backgroundColor !==
              "transparent"
              ? element.backgroundColor
              : "transparent",

          borderRadius: `${toNumber(
            element.radius,
          )}px`,

          boxShadow: shadow,

          userSelect:
            "text",

          WebkitUserSelect:
            "text",

          touchAction:
            "auto",
        }}
        onPointerDown={(
          event,
        ) => {
          /*
           * While editing, NEVER drag.
           */
          event.stopPropagation();
        }}
      >
        <textarea
          ref={editorRef}
          autoFocus
          value={draft}
          onChange={(event) =>
            setDraft(
              event.target.value,
            )
          }
          onPointerDown={(
            event,
          ) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
          }}
          onBlur={save}
          onKeyDown={(event) => {
            if (
              event.key ===
              "Escape"
            ) {
              event.preventDefault();

              cancel();

              return;
            }

            if (
              event.key ===
                "Enter" &&
              (event.ctrlKey ||
                event.metaKey)
            ) {
              event.preventDefault();

              save();
            }
          }}
          spellCheck={false}
          className="
            absolute
            inset-0
            m-0
            block
            h-full
            w-full
            min-h-0
            min-w-0
            resize-none
            overflow-auto
            rounded-[inherit]
            border-2
            border-dashed
            border-violet-500
            bg-transparent
            outline-none
          "
          style={{
            boxSizing:
              "border-box",

            fontFamily:
              element.fontFamily ||
              "Inter, sans-serif",

            /*
             * Current font size.
             */
            fontSize: `${
              Math.max(
                MIN_FONT_SIZE,
                toNumber(
                  element.fontSize,
                  40,
                ),
              )
            }px`,

            fontWeight:
              element.fontWeight ||
              700,

            fontStyle:
              element.fontStyle ||
              "normal",

            textDecoration:
              element.textDecoration ||
              "none",

            textTransform:
              element.textTransform ||
              "none",

            color:
              element.color ||
              "#1c1917",

            letterSpacing: `${
              toNumber(
                element.letterSpacing,
              )
            }px`,

            lineHeight:
              toNumber(
                element.lineHeight,
                1.1,
              ),

            textAlign:
              element.textAlign ||
              "center",

            padding: `${Math.min(
              toNumber(
                element.padding,
                2,
              ),
              8,
            )}%`,

            whiteSpace:
              "pre-wrap",

            wordBreak:
              "break-word",

            overflowWrap:
              "anywhere",

            userSelect:
              "text",

            WebkitUserSelect:
              "text",

            touchAction:
              "auto",
          }}
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-9
            left-1/2
            z-[1000]
            -translate-x-1/2
            whitespace-nowrap
            rounded-lg
            bg-slate-950/90
            px-2.5
            py-1.5
            text-[9px]
            font-semibold
            text-white
            shadow-xl
          "
        >
          Ctrl/Cmd + Enter save · Esc cancel
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* NORMAL TEXT                                                             */
  /* ----------------------------------------------------------------------- */

  return (
    <div
      style={{
        ...baseStyle,

        zIndex:
          toNumber(
            element.zIndex,
            20,
          ),

        display:
          "block",

        padding: `${Math.min(
          toNumber(
            element.padding,
            2,
          ),
          8,
        )}%`,

        overflow:
          "hidden",

        boxSizing:
          "border-box",

        background:
          element.backgroundColor &&
          element.backgroundColor !==
            "transparent"
            ? element.backgroundColor
            : "transparent",

        borderRadius: `${toNumber(
          element.radius,
        )}px`,

        boxShadow: shadow,

        cursor:
          preview
            ? "default"
            : element.locked
              ? "not-allowed"
              : "move",

        userSelect:
          "none",

        WebkitUserSelect:
          "none",

        touchAction:
          "none",
      }}
      onPointerDown={(
        event,
      ) => {
        if (
          preview ||
          element.locked
        ) {
          return;
        }

        /*
         * SINGLE CLICK:
         * select + possible drag.
         *
         * It NEVER starts edit mode.
         */
        onBeginDrag(
          event,
          element,
        );
      }}
      onDoubleClick={
        handleDoubleClick
      }
    >
      <div
        className="
          pointer-events-none
          block
          w-full
          min-w-0
          whitespace-pre-wrap
          break-words
        "
        style={{
          fontFamily:
            element.fontFamily ||
            "Inter, sans-serif",

          /*
           * Font size comes directly from
           * element.fontSize.
           */
          fontSize: `${
            Math.max(
              MIN_FONT_SIZE,
              toNumber(
                element.fontSize,
                40,
              ),
            )
          }px`,

          fontWeight:
            element.fontWeight ||
            700,

          fontStyle:
            element.fontStyle ||
            "normal",

          textDecoration:
            element.textDecoration ||
            "none",

          textTransform:
            element.textTransform ||
            "none",

          color:
            element.color ||
            "#1c1917",

          letterSpacing: `${
            toNumber(
              element.letterSpacing,
            )
          }px`,

          lineHeight:
            toNumber(
              element.lineHeight,
              1.1,
            ),

          textAlign:
            element.textAlign ||
            "center",

          whiteSpace:
            "pre-wrap",

          wordBreak:
            "break-word",

          overflowWrap:
            "anywhere",

          boxSizing:
            "border-box",
        }}
      >
        {element.text || ""}
      </div>

      {selected && (
        <ResizeHandles
          element={element}
          onResize={
            onResize
          }
          onRotate={
            onRotate
          }
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* SHAPE VISUAL                                                              */
/* ========================================================================= */

function ShapeVisual({
  element,
}) {
  const {
    shape,
    fill = "#111827",
    stroke = "#111827",
    strokeWidth = 0,
    radius = 0,
    image,
    text,
    textColor = "#ffffff",
    textSize = 28,
  } = element;

  const common = {
    width: "100%",
    height: "100%",

    background: image
      ? `url(${image}) center/cover`
      : fill,

    border: `${toNumber(
      strokeWidth,
    )}px solid ${stroke}`,

    boxSizing:
      "border-box",

    position:
      "relative",

    overflow:
      "hidden",

    pointerEvents:
      "none",
  };

  const textNode = text ? (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        grid
        place-items-center
        p-3
        text-center
        font-bold
      "
      style={{
        color: textColor,

        fontSize: `${
          toNumber(
            textSize,
            28,
          )
        }px`,
      }}
    >
      {text}
    </div>
  ) : null;

  if (
    shape === "circle"
  ) {
    return (
      <div
        style={{
          ...common,
          borderRadius:
            "50%",
        }}
      >
        {textNode}
      </div>
    );
  }

  if (
    shape === "triangle"
  ) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",

          background: image
            ? `url(${image}) center/cover`
            : fill,

          clipPath:
            "polygon(50% 0%, 100% 100%, 0% 100%)",

          pointerEvents:
            "none",
        }}
      >
        {textNode}
      </div>
    );
  }

  if (
    shape === "diamond"
  ) {
    return (
      <div
        className="
          grid
          h-full
          w-full
          place-items-center
          pointer-events-none
        "
      >
        <div
          style={{
            width: "70%",
            height: "70%",

            transform:
              "rotate(45deg)",

            background: image
              ? `url(${image}) center/cover`
              : fill,

            border: `${toNumber(
              strokeWidth,
            )}px solid ${stroke}`,

            pointerEvents:
              "none",
          }}
        />
      </div>
    );
  }

  if (
    shape === "star"
  ) {
    return (
      <div
        className="
          relative
          h-full
          w-full
          pointer-events-none
        "
        style={{
          clipPath:
            "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",

          background: image
            ? `url(${image}) center/cover`
            : fill,
        }}
      >
        {textNode}
      </div>
    );
  }

  if (
    shape ===
    "heart"
  ) {
    return (
      <div
        className="
          relative
          h-full
          w-full
          pointer-events-none
        "
        style={{
          background: image
            ? `url(${image}) center/cover`
            : fill,

          clipPath:
            "polygon(50% 100%,0% 35%,10% 15%,30% 10%,50% 28%,70% 10%,90% 15%,100% 35%)",
        }}
      >
        {textNode}
      </div>
    );
  }

  if (
    shape === "pill"
  ) {
    return (
      <div
        style={{
          ...common,
          borderRadius:
            "999px",
        }}
      >
        {textNode}
      </div>
    );
  }

  if (
    shape === "line"
  ) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",

          display:
            "flex",

          alignItems:
            "center",

          pointerEvents:
            "none",
        }}
      >
        <div
          style={{
            width: "100%",

            height: `${Math.max(
              1,
              toNumber(
                strokeWidth,
                4,
              ),
            )}px`,

            background:
              fill,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...common,

        borderRadius:
          shape === "rounded"
            ? `${toNumber(
                radius,
                18,
              )}px`
            : `${toNumber(
                radius,
              )}px`,
      }}
    >
      {textNode}
    </div>
  );
}

/* ========================================================================= */
/* RESIZE HANDLES                                                            */
/* ========================================================================= */

function ResizeHandles({
  element,
  onResize,
  onRotate,
}) {
  const handles = [
    "nw",
    "n",
    "ne",
    "e",
    "se",
    "s",
    "sw",
    "w",
  ];

  return (
    <>
      {/* ROTATE STEM */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          z-[70]
          h-8
          w-px
          -translate-x-1/2
          -translate-y-full
          bg-slate-900
        "
      />

      {/* ROTATE */}

      <button
        type="button"
        aria-label="Rotate element"
        title="Rotate"
        className="
          absolute
          left-1/2
          top-0
          z-[80]
          flex
          h-6
          w-6
          -translate-x-1/2
          -translate-y-[32px]
          items-center
          justify-center
          rounded-full
          border-2
          border-slate-900
          bg-white
          shadow-lg
        "
        style={{
          cursor:
            "crosshair",

          touchAction:
            "none",
        }}
        onPointerDown={(
          event,
        ) => {
          event.preventDefault();
          event.stopPropagation();

          onRotate(
            event,
            element,
          );
        }}
      >
        <span
          className="
            h-2
            w-2
            rounded-full
            bg-slate-900
          "
        />
      </button>

      {/* SELECTION BORDER */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[60]
          border-2
          border-slate-900
        "
      />

      {/* HANDLES */}

      {handles.map(
        (handle) => (
          <button
            key={handle}
            type="button"
            aria-label={`Resize ${handle}`}
            title={`Resize ${handle}`}
            className={`
              absolute
              z-[90]
              h-4
              w-4
              touch-none
              rounded-full
              border-2
              border-slate-900
              bg-white
              shadow-md
              ${handlePosition(
                handle,
              )}
            `}
            style={{
              cursor:
                handleCursor(
                  handle,
                ),

              touchAction:
                "none",
            }}
            onPointerDown={(
              event,
            ) => {
              event.preventDefault();
              event.stopPropagation();

              onResize(
                event,
                element,
                handle,
              );
            }}
          />
        ),
      )}
    </>
  );
}

/* ========================================================================= */
/* HANDLE POSITION                                                           */
/* ========================================================================= */

function handlePosition(handle) {
  const positions = {
    nw:
      "left-0 top-0 -translate-x-1/2 -translate-y-1/2",

    n:
      "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",

    ne:
      "right-0 top-0 translate-x-1/2 -translate-y-1/2",

    e:
      "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",

    se:
      "right-0 bottom-0 translate-x-1/2 translate-y-1/2",

    s:
      "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",

    sw:
      "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",

    w:
      "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    positions[handle] ||
    ""
  );
}

/* ========================================================================= */
/* HANDLE CURSOR                                                             */
/* ========================================================================= */

function handleCursor(
  handle,
) {
  const cursors = {
    nw: "nwse-resize",
    se: "nwse-resize",

    ne: "nesw-resize",
    sw: "nesw-resize",

    n: "ns-resize",
    s: "ns-resize",

    e: "ew-resize",
    w: "ew-resize",
  };

  return (
    cursors[handle] ||
    "default"
  );
}

/* ========================================================================= */
/* RESIZE                                                                    */
/* ========================================================================= */

function resizeElement(
  element,
  point,
  interaction,
  modifiers,
  onUpdate,
) {
  const dx =
    point.x -
    interaction.startX;

  const dy =
    point.y -
    interaction.startY;

  const originalX =
    interaction.originalX;

  const originalY =
    interaction.originalY;

  const originalWidth =
    interaction.originalWidth;

  const originalHeight =
    interaction.originalHeight;

  const originalFontSize =
    interaction.originalFontSize;

  const ratio =
    interaction.originalRatio ||
    originalWidth /
      Math.max(
        originalHeight,
        0.001,
      );

  const handle =
    interaction.handle;

  const keepRatio =
    modifiers.shift;

  const centered =
    modifiers.alt;

  let x =
    originalX;

  let y =
    originalY;

  let width =
    originalWidth;

  let height =
    originalHeight;

  /* ====================================================================== */
  /* FREE RESIZE                                                            */
  /* ====================================================================== */

  if (!keepRatio) {
    if (
      handle.includes("e")
    ) {
      width =
        originalWidth +
        dx;
    }

    if (
      handle.includes("s")
    ) {
      height =
        originalHeight +
        dy;
    }

    if (
      handle.includes("w")
    ) {
      width =
        originalWidth -
        dx;

      x =
        originalX +
        dx;
    }

    if (
      handle.includes("n")
    ) {
      height =
        originalHeight -
        dy;

      y =
        originalY +
        dy;
    }

    /* ------------------------------------------------------------------ */
    /* CENTERED                                                            */
    /* ------------------------------------------------------------------ */

    if (centered) {
      if (
        handle.includes("e")
      ) {
        width =
          originalWidth +
          dx * 2;

        x =
          originalX -
          dx;
      }

      if (
        handle.includes("w")
      ) {
        width =
          originalWidth -
          dx * 2;

        x =
          originalX +
          dx;
      }

      if (
        handle.includes("s")
      ) {
        height =
          originalHeight +
          dy * 2;

        y =
          originalY -
          dy;
      }

      if (
        handle.includes("n")
      ) {
        height =
          originalHeight -
          dy * 2;

        y =
          originalY +
          dy;
      }
    }
  }

  /* ====================================================================== */
  /* KEEP RATIO                                                             */
  /* ====================================================================== */

  if (keepRatio) {
    let targetWidth =
      originalWidth;

    let targetHeight =
      originalHeight;

    const horizontal =
      handle.includes("e") ||
      handle.includes("w");

    const vertical =
      handle.includes("n") ||
      handle.includes("s");

    if (
      horizontal &&
      !vertical
    ) {
      const delta =
        handle.includes("w")
          ? -dx
          : dx;

      targetWidth =
        originalWidth +
        delta;

      targetHeight =
        targetWidth /
        ratio;
    } else if (
      vertical &&
      !horizontal
    ) {
      const delta =
        handle.includes("n")
          ? -dy
          : dy;

      targetHeight =
        originalHeight +
        delta;

      targetWidth =
        targetHeight *
        ratio;
    } else {
      const widthDelta =
        handle.includes("w")
          ? -dx
          : dx;

      const heightDelta =
        handle.includes("n")
          ? -dy
          : dy;

      if (
        Math.abs(
          widthDelta,
        ) >=
        Math.abs(
          heightDelta,
        )
      ) {
        targetWidth =
          originalWidth +
          widthDelta;

        targetHeight =
          targetWidth /
          ratio;
      } else {
        targetHeight =
          originalHeight +
          heightDelta;

        targetWidth =
          targetHeight *
          ratio;
      }
    }

    width =
      targetWidth;

    height =
      targetHeight;

    if (centered) {
      x =
        originalX +
        (originalWidth -
          width) /
          2;

      y =
        originalY +
        (originalHeight -
          height) /
          2;
    } else {
      if (
        handle.includes("w")
      ) {
        x =
          originalX +
          originalWidth -
          width;
      }

      if (
        handle.includes("n")
      ) {
        y =
          originalY +
          originalHeight -
          height;
      }
    }
  }

  /* ====================================================================== */
  /* MIN SIZE                                                               */
  /* ====================================================================== */

  width = Math.max(
    MIN_ELEMENT_SIZE,
    width,
  );

  height = Math.max(
    MIN_ELEMENT_SIZE,
    height,
  );

  /* ====================================================================== */
  /* MAX SIZE                                                               */
  /* ====================================================================== */

  width =
    Math.min(
      100,
      width,
    );

  height =
    Math.min(
      100,
      height,
    );

  /* ====================================================================== */
  /* BOUNDARY                                                               */
  /* ====================================================================== */

  x = clamp(
    x,
    0,
    Math.max(
      0,
      100 - width,
    ),
  );

  y = clamp(
    y,
    0,
    Math.max(
      0,
      100 - height,
    ),
  );

  width =
    Math.min(
      width,
      100 - x,
    );

  height =
    Math.min(
      height,
      100 - y,
    );

  /* ====================================================================== */
  /* TEXT FONT SCALING                                                       */
  /* ====================================================================== */

  const updates = {
    x,
    y,
    width,
    height,
  };

  /*
   * IMPORTANT:
   *
   * For TEXT elements, resizing the box also
   * changes the font size.
   *
   * This is the behavior you asked for.
   */
  if (
    element.type ===
    "text"
  ) {
    let scale;

    const horizontal =
      handle.includes("e") ||
      handle.includes("w");

    const vertical =
      handle.includes("n") ||
      handle.includes("s");

    const widthScale =
      width /
      Math.max(
        originalWidth,
        0.001,
      );

    const heightScale =
      height /
      Math.max(
        originalHeight,
        0.001,
      );

    if (
      keepRatio ||
      (horizontal &&
        vertical)
    ) {
      /*
       * Corner / proportional resize.
       *
       * Use the smaller scale so text
       * remains inside the resized box.
       */
      scale =
        Math.min(
          widthScale,
          heightScale,
        );
    } else if (
      horizontal
    ) {
      scale =
        widthScale;
    } else if (
      vertical
    ) {
      scale =
        heightScale;
    } else {
      scale = 1;
    }

    const newFontSize =
      clamp(
        originalFontSize *
          scale,
        MIN_FONT_SIZE,
        MAX_FONT_SIZE,
      );

    updates.fontSize =
      Math.round(
        newFontSize * 100,
      ) / 100;
  }

  onUpdate(
    element.id,
    updates,
  );
}

/* ========================================================================= */
/* SELECTION INFO                                                            */
/* ========================================================================= */

function SelectionInfo({
  element,
  interaction,
}) {
  return (
    <div
      className="
        pointer-events-none
        absolute
        bottom-2
        left-2
        z-[200]
        max-w-[calc(100%-16px)]
        truncate
        rounded-lg
        bg-slate-950/85
        px-2.5
        py-1.5
        text-[9px]
        font-semibold
        text-white
        shadow-xl
        backdrop-blur
      "
    >
      {element.type}
      {" · "}
      {Math.round(
        toNumber(
          element.width,
        ),
      )}
      %
      {" × "}
      {Math.round(
        toNumber(
          element.height,
        ),
      )}
      %
      {interaction?.mode ===
        "drag" &&
        " · dragging"}
    </div>
  );
}