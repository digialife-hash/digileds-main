import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Type, Image as ImageIcon, Square, Circle, Minus, Undo2, Redo2,
  Layers as LayersIcon, Palette, Sparkles, Star, Triangle, Diamond,
  RectangleHorizontal, Heart, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, ChevronUp, ChevronDown, Copy, Eye, EyeOff,
  GripVertical, Lock, LockOpen, Trash2, X, Plus, ImagePlus, Upload,
  ChevronsUp, ChevronsDown, ZoomIn, ZoomOut, Maximize2, RotateCcw,
  Grid3X3, Download, FileImage, FileText, Move, Crop, SlidersHorizontal,
  FlipHorizontal2, FlipVertical2, RotateCw, Palette as PaletteIcon,
  AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter, LayoutTemplate,
  Save, MousePointer2, MinusCircle, PlusCircle, Undo, Redo, Check, Sparkles as SparkleIcon
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/*
  DESIGN STUDIO PRO / NEXT
  Install:
    npm i html2canvas jspdf lucide-react

  Important architecture:
  - Zoom is viewport-only. It NEVER changes design x/y/width/height.
  - Export renders an isolated clone at the real design resolution, so
    zoom, selection borders, editor UI and transforms do not affect downloads.
  - Pointer interactions use the actual canvas coordinates, so drag/resize
    remains accurate at every zoom level.
*/

const DRAG_THRESHOLD = 4;
const SAVED_DESIGNS_KEY = "social-posting-design-studio-saved";
const uid = () => Math.random().toString(36).slice(2, 11);
const clamp = (v, min, max) => Math.min(Math.max(Number(v) || 0, min), max);
const n = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;

const FORMATS = {
  "Square Post": { ratio: 1, w: 1080, h: 1080 },
  "Instagram Portrait": { ratio: 4 / 5, w: 1080, h: 1350 },
  "Story / Reel": { ratio: 9 / 16, w: 1080, h: 1920 },
  "Landscape Post": { ratio: 1200 / 628, w: 1200, h: 628 },
  "YouTube Thumbnail": { ratio: 16 / 9, w: 1280, h: 720 },
  "YouTube Banner": { ratio: 2560 / 1440, w: 2560, h: 1440 },
  "LinkedIn Post": { ratio: 1200 / 627, w: 1200, h: 627 },
  "LinkedIn Banner": { ratio: 1584 / 396, w: 1584, h: 396 },
  "Facebook Cover": { ratio: 1640 / 624, w: 1640, h: 624 },
  "Facebook Post": { ratio: 1200 / 630, w: 1200, h: 630 },
  "X Header": { ratio: 1500 / 500, w: 1500, h: 500 },
  "Pinterest Pin": { ratio: 2 / 3, w: 1000, h: 1500 },
  "A4 Portrait": { ratio: 210 / 297, w: 1240, h: 1754 },
  "A4 Landscape": { ratio: 297 / 210, w: 1754, h: 1240 },
};

const FONTS = [
  ["Inter, sans-serif", "Inter"],
  ["Arial, sans-serif", "Arial"],
  ["Helvetica, sans-serif", "Helvetica"],
  ["Georgia, serif", "Georgia"],
  ["Times New Roman, serif", "Times New Roman"],
  ["Verdana, sans-serif", "Verdana"],
  ["Trebuchet MS, sans-serif", "Trebuchet"],
  ["Courier New, monospace", "Courier New"],
  ["Impact, sans-serif", "Impact"],
  ["Noto Sans Devanagari, Mangal, sans-serif", "Hindi / Devanagari"],
  ["Noto Nastaliq Urdu, Noto Naskh Arabic, serif", "Urdu"],
];

const FILTERS = [
  ["none", "None"],
  ["grayscale(1)", "Grayscale"],
  ["sepia(.7)", "Sepia"],
  ["brightness(1.15)", "Bright"],
  ["brightness(.85)", "Dark"],
  ["contrast(1.25)", "Contrast"],
  ["saturate(1.6)", "Vivid"],
  ["blur(2px)", "Soft Blur"],
];

const SHAPES = [
  ["rectangle", "Rectangle", RectangleHorizontal],
  ["rounded", "Rounded", RectangleHorizontal],
  ["circle", "Circle", Circle],
  ["triangle", "Triangle", Triangle],
  ["diamond", "Diamond", Diamond],
  ["star", "Star", Star],
  ["heart", "Heart", Heart],
  ["pill", "Pill", RectangleHorizontal],
  ["line", "Line", Minus],
];

const COLORS = [
  "#ffffff", "#000000", "#171717", "#f5efff", "#fff1e8", "#e8f5f1",
  "#eaf0ff", "#fde68a", "#fecdd3", "#bfdbfe", "#bbf7d0", "#ddd6fe",
  "#fca5a5", "#fdba74", "#67e8f9", "#86efac"
];

const TEXT_PRESETS = [
  ["Hero", { text: "Your headline", fontSize: 72, fontWeight: 900, color: "#171717", width: 82, height: 22 }],
  ["Heading", { text: "Make it memorable", fontSize: 52, fontWeight: 800, color: "#171717", width: 78, height: 16 }],
  ["Subtitle", { text: "A clear supporting message", fontSize: 28, fontWeight: 500, color: "#555555", width: 70, height: 12 }],
  ["Price", { text: "$99.00", fontSize: 64, fontWeight: 900, color: "#dc2626", width: 60, height: 16 }],
  ["CTA", { text: "SHOP NOW", fontSize: 26, fontWeight: 800, color: "#ffffff", backgroundColor: "#171717", radius: 12, width: 42, height: 11 }],
  ["Quote", { text: "“Your quote here”", fontSize: 38, fontWeight: 700, fontStyle: "italic", color: "#171717", width: 76, height: 20 }],
  ["Label", { text: "NEW • LIMITED", fontSize: 20, fontWeight: 800, color: "#7e22ce", letterSpacing: 2, width: 55, height: 8 }],
  ["Caption", { text: "Add a short caption", fontSize: 20, fontWeight: 400, color: "#555555", width: 70, height: 10 }],
  ["नमस्ते", { text: "नमस्ते!", fontSize: 64, fontWeight: 900, color: "#be123c", width: 70, height: 18, fontFamily: "Noto Sans Devanagari, Mangal, sans-serif", script: "hi" }],
  ["शुभकामना", { text: "आपको हार्दिक शुभकामनाएं", fontSize: 34, fontWeight: 800, color: "#92400e", width: 82, height: 14, fontFamily: "Noto Sans Devanagari, Mangal, sans-serif", script: "hi" }],
  ["हिंदी हेडलाइन", { text: "आपका संदेश यहां लिखें", fontSize: 48, fontWeight: 900, color: "#171717", width: 82, height: 20, fontFamily: "Noto Sans Devanagari, Mangal, sans-serif", script: "hi" }],
  ["ऑफर", { text: "आज का खास ऑफर", fontSize: 40, fontWeight: 900, color: "#dc2626", width: 76, height: 14, fontFamily: "Noto Sans Devanagari, Mangal, sans-serif", script: "hi" }],
  ["कॉल टू एक्शन", { text: "अभी ऑर्डर करें", fontSize: 27, fontWeight: 800, color: "#ffffff", backgroundColor: "#166534", radius: 12, width: 48, height: 11, fontFamily: "Noto Sans Devanagari, Mangal, sans-serif", script: "hi" }],
  ["प्रेरणा", { text: "सपने देखिए,\nउन्हें सच कीजिए।", fontSize: 39, fontWeight: 800, color: "#1d4ed8", width: 78, height: 22, fontFamily: "Noto Sans Devanagari, Mangal, sans-serif", script: "hi" }],
  ["त्योहार", { text: "त्योहार की ढेरों शुभकामनाएं", fontSize: 31, fontWeight: 800, color: "#7e22ce", width: 84, height: 14, fontFamily: "Noto Sans Devanagari, Mangal, sans-serif", script: "hi" }],
  ["3D हेडलाइन", { text: "MAKE IT POP", fontSize: 62, fontWeight: 900, color: "#f97316", text3d: true, text3dDepth: 5, text3dColor: "#9a3412", width: 82, height: 18 }],
  ["خوش آمدید", { text: "خوش آمدید", fontSize: 56, fontWeight: 800, color: "#166534", width: 76, height: 17, fontFamily: "Noto Nastaliq Urdu, Noto Naskh Arabic, serif", direction: "rtl", script: "ur" }],
  ["اردو عنوان", { text: "اپنا پیغام یہاں لکھیں", fontSize: 40, fontWeight: 700, color: "#1d4ed8", width: 82, height: 20, fontFamily: "Noto Nastaliq Urdu, Noto Naskh Arabic, serif", direction: "rtl", script: "ur" }],
  ["اردو آفر", { text: "آج کی خاص پیشکش", fontSize: 38, fontWeight: 800, color: "#dc2626", width: 78, height: 14, fontFamily: "Noto Nastaliq Urdu, Noto Naskh Arabic, serif", direction: "rtl", script: "ur" }],
  ["کال ٹو ایکشن", { text: "ابھی آرڈر کریں", fontSize: 27, fontWeight: 800, color: "#ffffff", backgroundColor: "#7e22ce", radius: 12, width: 48, height: 11, fontFamily: "Noto Nastaliq Urdu, Noto Naskh Arabic, serif", direction: "rtl", script: "ur" }],
  ["Neon 3D", { text: "NEON NIGHT", fontSize: 58, fontWeight: 900, color: "#22d3ee", text3d: true, text3dDepth: 3, text3dColor: "#7e22ce", textShadow: true, width: 82, height: 18 }],
  ["Gold 3D", { text: "GOLD EDITION", fontSize: 52, fontWeight: 900, color: "#fde68a", text3d: true, text3dDepth: 7, text3dColor: "#92400e", width: 84, height: 16 }],
  ["Pop 3D", { text: "POP IT UP", fontSize: 64, fontWeight: 900, color: "#f43f5e", text3d: true, text3dDepth: 5, text3dColor: "#701a75", width: 82, height: 18 }],
  ["Soft 3D", { text: "SOFT SHADOW", fontSize: 46, fontWeight: 800, color: "#4f46e5", text3d: true, text3dDepth: 2, text3dColor: "#c7d2fe", width: 84, height: 16 }],
];

const TEXT_PRESET_GROUPS = {
  English: TEXT_PRESETS.slice(0, 8),
  "हिंदी": TEXT_PRESETS.slice(8, 15),
  "اردو": TEXT_PRESETS.slice(16, 20),
  "3D": TEXT_PRESETS.slice(20, 24),
};

function makeText(text = "Add your text", extra = {}) {
  return {
    id: uid(), type: "text", name: "Text",
    x: 15, y: 40, width: 70, height: 18, rotation: 0,
    opacity: 1, visible: true, locked: false,
    text,
    fontFamily: "Inter, sans-serif", fontSize: 44, fontWeight: 700,
    fontStyle: "normal", textDecoration: "none", textAlign: "center",
    verticalAlign: "center", color: "#171717", backgroundColor: "transparent",
    letterSpacing: 0, lineHeight: 1.1, textCurve: 0, padding: 2,
    radius: 0, textShadow: false, textTransform: "none",
    textStroke: "#000000", textStrokeWidth: 0,
    text3d: false, text3dDepth: 4, text3dColor: "#7c2d12",
    direction: "ltr", script: "en",
    textGradient: false, textGradientSecond: "#f43f5e", textGradientAngle: 90,
    textImage: null,
    highlight: false, highlightColor: "#fde68a",
    ...extra,
  };
}

function safeTextHtml(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html || "";
  wrapper.querySelectorAll("*").forEach(node => {
    const color = node.getAttribute("color") || node.style.color;
    [...node.attributes].forEach(attribute => {
      if (attribute.name !== "color" && attribute.name !== "style") node.removeAttribute(attribute.name);
    });
    node.removeAttribute("style");
    if (color && /^(#[0-9a-f]{3,8}|rgb\(|rgba\()/i.test(color)) node.setAttribute("style", `color:${color}`);
  });
  return wrapper.innerHTML;
}

function CurvedText({ element }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const lines = String(element.text || "").split("\n");
  const curve = clamp(n(element.textCurve), -359, 359);
  const span = Math.min(359, Math.abs(curve));
  const baseFontSize = n(element.fontSize, 44);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const longestLine = lines.reduce(
    (longest, line) => Math.max(longest, Array.from(line).length),
    1,
  );
  const desiredLength = Math.max(
    baseFontSize,
    longestLine * Math.max(baseFontSize * 0.58 + n(element.letterSpacing), baseFontSize * 0.35),
  );
   const boxWidth = size.width || 500;
  const boxHeight = size.height || 300;
  const centerX = boxWidth / 2;
  const centerY = boxHeight / 2;
  const spanRadians = Math.max((span * Math.PI) / 250, 0.02);
  // Font size ab seedha user ke diye gaye value se hi render hoga — koi auto-shrink nahi.
  const fontSize = Math.max(8, baseFontSize);
  // Radius ab fontSize ke hisaab se grow hoga (curve box ke bahar bhi ja sakta hai, jo curved text ke liye normal hai).
  const requiredRadius = desiredLength / spanRadians;
  const radius = Math.max(18, requiredRadius);
   const arcCenterY =
  span >= 300
    ? centerY - 150
    : centerY - 150 + (curve >= 50 ? radius - 20 : 550-radius);
  const textStyle = {
    fontFamily: element.fontFamily || "Inter, sans-serif",
    fontSize: `${fontSize}px`,
    fontWeight: n(element.fontWeight, 700),
    fontStyle: element.fontStyle || "normal",
    textDecoration: element.textDecoration || "none",
    textTransform: element.textTransform || "none",
    color: element.color || "#171717",
    letterSpacing: `${n(element.letterSpacing)}px`,
    textShadow: element.text3d
      ? Array.from({ length: clamp(element.text3dDepth, 1, 12) }, (_, index) => `${index + 1}px ${index + 1}px 0 ${element.text3dColor || "#7c2d12"}`).join(", ")
      : element.textShadow ? "0 3px 12px #0006" : "none",
    WebkitTextStroke: `${n(element.textStrokeWidth)}px ${element.textStroke || "#000000"}`,
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-visible">
      {lines.map((line, lineIndex) => {
        const characters = Array.from(line || " ");
        const count = Math.max(characters.length, 1);
        const lineRadius = Math.max(18, radius - lineIndex * fontSize * 1.35);

        return (
          <div key={`${lineIndex}-${line}`} className="absolute inset-0">
            {characters.map((character, index) => {
              const progress = count === 1 ? 0 : index / (count - 1) - 0.5;
              const angle = (curve >= 0 ? 270 : 90) + progress * span;
              const radians = angle * (Math.PI / 180);
              const x = centerX + lineRadius * Math.cos(radians);
              const y = arcCenterY + lineRadius * Math.sin(radians);
              const tangent = angle + (curve >= 0 ? 90 : -90);

              return (
                <span
                  key={`${index}-${character}`}
                  className="pointer-events-none absolute inline-block whitespace-pre"
                  style={{
                    ...textStyle,
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: `translate(-50%, -50%) rotate(${tangent}deg)`,
                    transformOrigin: "center",
                    lineHeight: 1,
                    zIndex: 2,
                  }}
                >
                  {character === " " ? "\u00a0" : character}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function textHtmlWithBreaks(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = safeTextHtml(html);

  wrapper.querySelectorAll("div, p, li").forEach(node => {
    node.insertAdjacentText("afterend", "\n");
  });

  wrapper.querySelectorAll("br").forEach(node => {
    node.replaceWith("\n");
  });

  return wrapper.innerHTML;
}

function makeImage(src, name = "Image", extra = {}) {
  return {
    id: uid(), type: "image", name,
    x: 20, y: 20, width: 60, height: 60, rotation: 0,
    opacity: 1, visible: true, locked: false, src,
    objectFit: "cover", objectPosition: "center", imageScale: 1,
    filter: "none", radius: 0, borderWidth: 0, borderColor: "#ffffff",
    shadow: false, shadowX: 0, shadowY: 5, shadowBlur: 18, shadowColor: "#000000",
    flipX: false, flipY: false, ...extra,
  };
}

function normalizeElement(element) {
  if (!element || !["text", "image", "shape"].includes(element.type)) return null;
  const base = element.type === "text"
    ? makeText(element.text || "Add your text")
    : element.type === "image"
      ? makeImage(element.src || "", element.name || "Image")
      : makeShape(element.shape || "rectangle");
  return {
    ...base,
    ...element,
    id: typeof element.id === "string" && element.id ? element.id : uid(),
    visible: element.visible !== false,
    locked: element.locked === true,
  };
}

function makeShape(shape = "rectangle", extra = {}) {
  return {
    id: uid(), type: "shape", name: shape,
    x: 25, y: 30, width: 40, height: 35, rotation: 0,
    opacity: 1, visible: true, locked: false, shape,
    fill: "#171717", fill2: "#171717", fillType: "solid",
    gradientAngle: 135, stroke: "#171717", strokeWidth: 0, radius: 12,
    image: null, imageFit: "cover", imagePosition: "center",
    text: "", textColor: "#ffffff", textSize: 26, textFontFamily: "Inter, sans-serif",
    textFontWeight: 700, textAlign: "center", shadow: false, shadowX: 0, shadowY: 5,
    shadowBlur: 18, shadowColor: "#000000", flipX: false, flipY: false,
    ...extra,
  };
}

function shadowStyle(el) {
  return el.shadow
    ? `${n(el.shadowX)}px ${n(el.shadowY, 5)}px ${n(el.shadowBlur, 18)}px ${el.shadowColor || "#000000"}66`
    : "none";
}

function shapeBackground(el) {
  if (el.image) return `url(${el.image}) ${el.imagePosition || "center"}/${el.imageFit || "cover"}`;
  if (el.fillType === "gradient") {
    return `linear-gradient(${n(el.gradientAngle, 135)}deg, ${el.fill}, ${el.fill2 || el.fill})`;
  }
  return el.fill;
}

function ShapeVisual({ element }) {
  const el = element;
  const bg = shapeBackground(el);
  const textNode = el.text ? (
    <div className="pointer-events-none absolute inset-0 grid place-items-center break-words p-2 text-center font-bold"
    style={{ color: el.textColor, fontSize: `${n(el.textSize, 26)}px`, fontFamily: el.textFontFamily || "Inter, sans-serif", fontWeight: n(el.textFontWeight, 700), textAlign: el.textAlign || "center" }}>
      {el.text}
    </div>
  ) : null;

  const common = {
    width: "100%", height: "100%", background: bg,
    border: `${n(el.strokeWidth)}px solid ${el.stroke}`,
    boxSizing: "border-box", position: "relative", overflow: "hidden",
    pointerEvents: "none",
  };

  if (el.shape === "circle")
    return <div style={{ ...common, borderRadius: "50%" }}>{textNode}</div>;
  if (el.shape === "triangle")
    return <div style={{ ...common, border: 0, clipPath: "polygon(50% 0%,100% 100%,0% 100%)" }}>{textNode}</div>;
  if (el.shape === "diamond")
    return <div className="relative h-full w-full grid place-items-center pointer-events-none overflow-hidden">
      <div style={{ width: "70%", height: "70%", transform: "rotate(45deg)", background: bg, border: `${n(el.strokeWidth)}px solid ${el.stroke}` }} />
      {textNode}
    </div>;
  if (el.shape === "star")
    return <div className="relative h-full w-full pointer-events-none" style={{
      clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", background: bg
    }}>{textNode}</div>;
  if (el.shape === "heart")
    return <div className="relative h-full w-full pointer-events-none" style={{
      clipPath: "polygon(50% 100%,0% 35%,10% 15%,30% 10%,50% 28%,70% 10%,90% 15%,100% 35%)", background: bg
    }}>{textNode}</div>;
  if (el.shape === "pill")
    return <div style={{ ...common, borderRadius: 999 }}>{textNode}</div>;
  if (el.shape === "line")
    return <div className="flex h-full w-full items-center pointer-events-none">
      <div style={{ width: "100%", height: `${Math.max(1, n(el.strokeWidth, 4))}px`, background: el.fill }} />
    </div>;
  return <div style={{ ...common, borderRadius: `${n(el.radius)}px` }}>{textNode}</div>;
}

const HANDLE_POS = {
  nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  n: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  e: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  se: "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
  s: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  sw: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  w: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

const CURSORS = {
  nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize",
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize"
};

function ResizeHandles({ element, onResize, onRotate }) {
  return <>
    <button type="button" title="Rotate"
      aria-label="Rotate selected element"
      className="absolute left-1/2 top-0 z-[200] grid h-8 w-8 -translate-x-1/2 -translate-y-[44px] place-items-center rounded-full border-2 border-stone-900 bg-white shadow-lg cursor-crosshair"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRotate(e, element);
      }}>
      <RotateCw size={15} />
    </button>
    <div className="pointer-events-none absolute inset-0 z-[70] border-2 border-stone-900" />
    {Object.keys(HANDLE_POS).map(h => (
      <button key={h} type="button" aria-label={`Resize ${h}`}
        className={`absolute z-[90] grid h-7 w-7 touch-none place-items-center ${HANDLE_POS[h]}`}
        style={{ cursor: CURSORS[h], touchAction: "none" }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onResize(e, element, h);
        }}>
        <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-900 bg-white shadow" />
      </button>
    ))}
  </>;
}

function CanvasElement({ element, layerIndex, selected, preview, onPointerDown, onResize, onRotate, onEditText }) {
  const [editing, setEditing] = useState(false);
  const textRef = useRef(null);
  const selectionRef = useRef(null);
  const captureSelection = () => {
    const save = () => {
      const selection = window.getSelection();
      if (selection?.rangeCount && textRef.current?.contains(selection.anchorNode) && textRef.current.contains(selection.focusNode)) {
        selectionRef.current = selection.getRangeAt(0).cloneRange();
      }
    };
    save();
    window.requestAnimationFrame(save);
  };
  const applySelectedColor = color => {
    const currentSelection = window.getSelection();
    const range = selectionRef.current || (
      currentSelection?.rangeCount ? currentSelection.getRangeAt(0).cloneRange() : null
    );
    if (!range || range.collapsed || !textRef.current?.contains(range.commonAncestorContainer)) return;
    textRef.current.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand("foreColor", false, color);
    onEditText(element.id, textRef.current.innerText, safeTextHtml(textRef.current.innerHTML));
    selectionRef.current = null;
  };
  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editing]);
  const base = {
    position: "absolute",
    left: `${n(element.x)}%`, top: `${n(element.y)}%`,
    width: `${n(element.width)}%`, height: `${n(element.height)}%`,
    transform: `rotate(${n(element.rotation)}deg) ${element.flipX ? "scaleX(-1)" : ""} ${element.flipY ? "scaleY(-1)" : ""}`,
    opacity: element.opacity ?? 1,
    touchAction: "none", userSelect: "none", WebkitUserSelect: "none",
    cursor: preview ? "default" : element.locked ? "not-allowed" : "move",
    boxShadow: shadowStyle(element),
    zIndex: layerIndex + 1,
  };

  const grab = e => {
    if (!preview && !element.locked) onPointerDown(e, element);
  };

  if (element.type === "text") {
    const vertical = element.verticalAlign === "top" ? "flex-start" : element.verticalAlign === "bottom" ? "flex-end" : "center";
    return <div style={{
      ...base, display: "flex", alignItems: vertical,
      justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
      textAlign: element.textAlign || "center",
      padding: `${clamp(element.padding, 0, 8)}%`,
      overflow: selected || editing || n(element.textCurve) !== 0 ? "visible" : "hidden",
      background: element.highlight
        ? (element.highlightColor || "#fde68a")
        : (element.backgroundColor === "transparent" ? "transparent" : element.backgroundColor),
      borderRadius: `${n(element.radius)}px`,
    }} onPointerDown={grab}
      onDoubleClick={(event) => {
        if (preview || element.locked) return;
        event.preventDefault();
        event.stopPropagation();
        setEditing(true);
      }}>
      <span ref={textRef} contentEditable={!preview && !element.locked && editing} suppressContentEditableWarning
        onPointerDown={(e) => {
          if (editing) e.stopPropagation();
        }}
        onMouseUp={captureSelection}
        onPointerUp={captureSelection}
        onKeyUp={captureSelection}
        onSelect={captureSelection}
        onBlur={(e) => {
          const value = e.currentTarget.innerText;
          const html = safeTextHtml(e.currentTarget.innerHTML);
          if (!preview && !element.locked && (value !== element.text || html !== element.html)) onEditText(element.id, value, html);
          setEditing(false);
        }}
        style={{
          width: "100%", minWidth: 0,
          fontFamily: element.fontFamily || "Inter, sans-serif",
          fontSize: `${n(element.fontSize, 44)}px`, fontWeight: n(element.fontWeight, 700),
          fontStyle: element.fontStyle || "normal",
          textDecoration: element.textDecoration || "none",
          textTransform: element.textTransform || "none",
          color: element.color || "#171717",
          backgroundImage: element.textImage
            ? `url(${element.textImage})`
            : element.textGradient
              ? `linear-gradient(${n(element.textGradientAngle, 90)}deg, ${element.color || "#171717"}, ${element.textGradientSecond || "#f43f5e"})`
              : "none",
          backgroundSize: element.textImage ? "cover" : undefined,
          backgroundPosition: element.textImage ? "center" : undefined,
          WebkitBackgroundClip: element.textImage || element.textGradient ? "text" : "border-box",
          WebkitTextFillColor: element.textImage || element.textGradient ? "transparent" : undefined,
          letterSpacing: `${n(element.letterSpacing)}px`,
          lineHeight: n(element.lineHeight, 1.1),
          outline: "none", wordBreak: "break-word", overflowWrap: "anywhere",
          whiteSpace: "pre-wrap", cursor: preview ? "default" : "text",
          textShadow: element.text3d
            ? Array.from({ length: clamp(element.text3dDepth, 1, 12) }, (_, index) => `${index + 1}px ${index + 1}px 0 ${element.text3dColor || "#7c2d12"}`).join(", ")
            : element.textShadow ? "0 3px 12px #0006" : "none",
          WebkitTextStroke: `${n(element.textStrokeWidth)}px ${element.textStroke || "#000000"}`,
          direction: "ltr",
          unicodeBidi: "plaintext",
        }}>
        {!editing && n(element.textCurve) !== 0
          ? <CurvedText element={element} />
          : element.html
            ? <span dangerouslySetInnerHTML={{ __html: textHtmlWithBreaks(element.html) }} />
            : element.text}
      </span>
      {selected && <>
        {editing && <div data-editor-only className="absolute -top-10 left-0 z-[120] flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1 shadow-xl">
          {COLORS.slice(0, 8).map(color => <button key={color} type="button" title={`Apply ${color} to selection`}
            aria-label={`Apply ${color} to selected text`}
            className="h-5 w-5 rounded-full border border-stone-300 shadow-sm transition hover:scale-125 hover:ring-2 hover:ring-sky-400"
            style={{ background: color }}
            onPointerDown={event => { captureSelection(); event.preventDefault(); event.stopPropagation(); }}
            onMouseDown={event => { captureSelection(); event.preventDefault(); event.stopPropagation(); }}
            onClick={event => { event.preventDefault(); event.stopPropagation(); applySelectedColor(color); }} />)}
          <label title="Choose custom color" className="grid h-5 w-5 cursor-pointer place-items-center overflow-hidden rounded-full border border-stone-300 bg-[conic-gradient(#ef4444,#facc15,#22c55e,#3b82f6,#a855f7,#ef4444)] shadow-sm transition hover:scale-125 hover:ring-2 hover:ring-sky-400">
            <input type="color" defaultValue={element.color || "#171717"} className="h-7 w-7 cursor-pointer opacity-0"
              onPointerDown={event => { captureSelection(); event.preventDefault(); event.stopPropagation(); }}
              onMouseDown={event => { captureSelection(); event.preventDefault(); event.stopPropagation(); }}
              onChange={event => applySelectedColor(event.target.value)} />
          </label>
          <span className="px-1 text-[9px] font-bold text-stone-500">Select a word, then choose color</span>
        </div>}
        <ResizeHandles element={element} onResize={onResize} onRotate={onRotate} />
      </>}
    </div>;
  }

  if (element.type === "image") {
    return <div style={{
      ...base, overflow: "hidden",
      borderRadius: `${n(element.radius)}px`,
      border: `${n(element.borderWidth)}px solid ${element.borderColor || "#fff"}`,
    }} onPointerDown={grab}>
      <img src={element.src} alt={element.name || "Design"} draggable={false}
        className="block h-full w-full pointer-events-none select-none"
        style={{
          objectFit: element.objectFit || "cover",
          objectPosition: element.objectPosition || "center",
          filter: element.filter || "none",
          transform: `scale(${Math.max(1, n(element.imageScale, 1))})`,
          transformOrigin: "center",
        }} />
      {selected && <ResizeHandles element={element} onResize={onResize} onRotate={onRotate} />}
    </div>;
  }

  return <div style={base} onPointerDown={grab}>
    <ShapeVisual element={element} />
    {selected && <ResizeHandles element={element} onResize={onResize} onRotate={onRotate} />}
  </div>;
}

function DesignCanvas({
  format, background, backgroundType, backgroundSecond, backgroundAngle = 135, backgroundImage,
  backgroundImageFit = "cover", backgroundImagePosition = "center",
  elements, selectedId, onSelect, onUpdate, onEditText,
  preview = false, showGrid = false, snapGrid = 5, guideLines = true,
  canvasRefExternal,
}) {
  const canvasRef = useRef(null);
  const interactionRef = useRef(null);
  const frameRef = useRef(null);
  const [interaction, setInteraction] = useState(null);
  const rect = FORMATS[format] || FORMATS["Square Post"];

  useEffect(() => {
    if (canvasRefExternal) canvasRefExternal.current = canvasRef.current;
  }, [canvasRefExternal]);

  const point = useCallback((e) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r?.width || !r?.height) return { x: 0, y: 0 };
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  }, []);

  const snap = useCallback(v => snapGrid ? Math.round(v / snapGrid) * snapGrid : v, [snapGrid]);

  const startDrag = useCallback((e, el) => {
    if (preview || el.locked) return;
    onSelect(el.id);
    const p = point(e);
    interactionRef.current = {
      mode: "pending", id: el.id, pointerId: e.pointerId,
      startClientX: e.clientX, startClientY: e.clientY,
      startX: p.x, startY: p.y, originalX: n(el.x), originalY: n(el.y),
      originalWidth: n(el.width, 10), originalHeight: n(el.height, 10)
    };
    setInteraction({ mode: "pending", id: el.id });
  }, [onSelect, point, preview]);

  const startResize = useCallback((e, el, handle) => {
    if (preview || el.locked) return;
    e.preventDefault(); e.stopPropagation();
    onSelect(el.id);
    const p = point(e);
    interactionRef.current = {
      mode: "resize", id: el.id, pointerId: e.pointerId, handle,
      startX: p.x, startY: p.y, originalX: n(el.x), originalY: n(el.y),
      originalWidth: n(el.width, 10), originalHeight: n(el.height, 10),
      originalFontSize: n(el.fontSize, 44)
    };
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
    setInteraction({ mode: "resize", id: el.id });
  }, [onSelect, point, preview]);

  const startRotate = useCallback((e, el) => {
    if (preview || el.locked) return;
    e.preventDefault(); e.stopPropagation();
    onSelect(el.id);
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + ((n(el.x) + n(el.width) / 2) / 100) * r.width;
    const cy = r.top + ((n(el.y) + n(el.height) / 2) / 100) * r.height;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    interactionRef.current = {
      mode: "rotate", id: el.id, pointerId: e.pointerId,
      startAngle: angle, originalRotation: n(el.rotation)
    };
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
    setInteraction({ mode: "rotate", id: el.id });
  }, [onSelect, preview]);

  useEffect(() => {
    if (!interaction) return;
    const move = e => {
      const d = interactionRef.current;
      if (!d || (d.pointerId !== undefined && e.pointerId !== d.pointerId)) return;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const el = elements.find(x => x.id === d.id);
        if (!el) return;
        const p = point(e);

        if (d.mode === "pending") {
          const dist = Math.hypot(e.clientX - d.startClientX, e.clientY - d.startClientY);
          if (dist < DRAG_THRESHOLD) return;
          e.preventDefault();
          d.mode = "drag";
          setInteraction({ mode: "drag", id: d.id });
        }

        if (d.mode === "drag") {
          let nextX = snap(d.originalX + p.x - d.startX);
          let nextY = snap(d.originalY + p.y - d.startY);
          if (guideLines) {
            const vertical = [0, 50, 100];
            const horizontal = [0, 50, 100];
            elements.forEach(candidate => {
              if (candidate.id === el.id || candidate.visible === false) return;
              vertical.push(n(candidate.x), n(candidate.x) + n(candidate.width), n(candidate.x) + n(candidate.width) / 2);
              horizontal.push(n(candidate.y), n(candidate.y) + n(candidate.height), n(candidate.y) + n(candidate.height) / 2);
            });
            const align = (value, size, guides) => {
              const options = guides.flatMap(target => [target, target - size / 2, target - size]);
              const nearest = options.reduce((best, option) =>
                Math.abs(option - value) < Math.abs(best - value) ? option : best, value);
              return Math.abs(nearest - value) <= 1.25 ? nearest : value;
            };
            nextX = align(nextX, d.originalWidth, vertical);
            nextY = align(nextY, d.originalHeight, horizontal);
          }
          onUpdate(el.id, {
            x: clamp(nextX, 0, 100 - d.originalWidth),
            y: clamp(nextY, 0, 100 - d.originalHeight)
          });
        }

        if (d.mode === "resize") {
          const dx = p.x - d.startX, dy = p.y - d.startY;
          let x = d.originalX, y = d.originalY, w = d.originalWidth, h = d.originalHeight;
          const q = d.handle;
          if (q.includes("e")) w = d.originalWidth + dx;
          if (q.includes("s")) h = d.originalHeight + dy;
          if (q.includes("w")) { w = d.originalWidth - dx; x = d.originalX + dx; }
          if (q.includes("n")) { h = d.originalHeight - dy; y = d.originalY + dy; }
          w = clamp(snap(w), 3, 100);
          h = clamp(snap(h), 3, 100);
          x = clamp(x, 0, 100 - w); y = clamp(y, 0, 100 - h);
          const updates = { x, y, width: w, height: h };

          if (el.type === "text") {
            const horizontal = q.includes("e") || q.includes("w");
            const vertical = q.includes("n") || q.includes("s");
            const widthScale = w / Math.max(d.originalWidth, 0.001);
            const heightScale = h / Math.max(d.originalHeight, 0.001);
            const scale = horizontal && vertical
              ? Math.min(widthScale, heightScale)
              : horizontal
                ? widthScale
                : vertical
                  ? heightScale
                  : 1;

            updates.fontSize = clamp(
              Math.round(d.originalFontSize * scale * 100) / 100,
              6,
              500,
            );
          }

          onUpdate(el.id, updates);
        }

        if (d.mode === "rotate") {
          const r = canvasRef.current?.getBoundingClientRect();
          if (!r) return;
          const cx = r.left + ((n(el.x) + n(el.width) / 2) / 100) * r.width;
          const cy = r.top + ((n(el.y) + n(el.height) / 2) / 100) * r.height;
          const current = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
          onUpdate(el.id, { rotation: Math.round(d.originalRotation + current - d.startAngle) });
        }
      });
    };
    const stop = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null; interactionRef.current = null; setInteraction(null);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [interaction, elements, guideLines, onUpdate, point, snap]);

  const selectedElement = elements.find(element => element.id === selectedId);
  const guideMatches = useMemo(() => {
    if (!selectedElement || preview || !guideLines) return { vertical: [], horizontal: [] };
    const vertical = [0, 50, 100];
    const horizontal = [0, 50, 100];
    elements.forEach(element => {
      if (element.id === selectedElement.id || element.visible === false) return;
      vertical.push(n(element.x), n(element.x) + n(element.width), n(element.x) + n(element.width) / 2);
      horizontal.push(n(element.y), n(element.y) + n(element.height), n(element.y) + n(element.height) / 2);
    });
    const selectedX = [n(selectedElement.x), n(selectedElement.x) + n(selectedElement.width), n(selectedElement.x) + n(selectedElement.width) / 2];
    const selectedY = [n(selectedElement.y), n(selectedElement.y) + n(selectedElement.height), n(selectedElement.y) + n(selectedElement.height) / 2];
    return {
      vertical: vertical.filter(target => selectedX.some(value => Math.abs(value - target) <= 1.25)),
      horizontal: horizontal.filter(target => selectedY.some(value => Math.abs(value - target) <= 1.25)),
    };
  }, [elements, guideLines, preview, selectedElement]);

  const bg = backgroundType === "gradient"
    ? {
      background: `linear-gradient(${n(backgroundAngle, 135)}deg, ${background}, ${backgroundSecond})`,
      backgroundImage: backgroundImage ? `url(${backgroundImage}), linear-gradient(${n(backgroundAngle, 135)}deg, ${background}, ${backgroundSecond})` : undefined,
      backgroundSize: backgroundImage ? `${backgroundImageFit}, 100% 100%` : undefined,
      backgroundPosition: backgroundImage ? `${backgroundImagePosition}, center` : undefined,
    }
    : {
      background,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: backgroundImage ? backgroundImageFit : undefined,
      backgroundPosition: backgroundImage ? backgroundImagePosition : undefined,
    };

  return <div ref={canvasRef} data-design-canvas data-format-width={rect.w} data-format-height={rect.h}
    onPointerDown={e => { if (e.target === e.currentTarget) onSelect(null); }}
    className="relative w-full overflow-hidden"
    style={{ ...bg, aspectRatio: rect.ratio, touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}>
    {!preview && showGrid && <div className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        opacity: .08,
        backgroundImage: "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)",
        backgroundSize: `${snapGrid * 2}% ${snapGrid * 2}%`
      }} />}
    {!preview && selectedId && guideLines && <div data-editor-only>
      {guideMatches.vertical.map((value, index) => <div key={`v-${value}-${index}`}
        className="pointer-events-none absolute inset-y-0 z-[2] border-l border-dashed border-sky-500/70"
        style={{ left: `${value}%` }} />)}
      {guideMatches.horizontal.map((value, index) => <div key={`h-${value}-${index}`}
        className="pointer-events-none absolute inset-x-0 z-[2] border-t border-dashed border-sky-500/70"
        style={{ top: `${value}%` }} />)}
    </div>}
    {elements.map((el, index) => el.visible === false ? null : <CanvasElement key={el.id}
      element={el} layerIndex={index} selected={el.id === selectedId && !preview} preview={preview}
      onPointerDown={startDrag} onResize={startResize} onRotate={startRotate}
      onEditText={onEditText} />)}
    {selectedId && !preview && <div className="pointer-events-none absolute bottom-2 left-2 z-[200] rounded-lg bg-stone-900/80 px-2 py-1 text-[9px] font-bold text-white">
      {interaction?.mode === "drag" ? "Moving" : interaction?.mode === "resize" ? "Resizing" : "Selected"}
    </div>}
  </div>;
}

function ColorField({ label, value, onChange }) {
  return <label className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-2">
    <span className="text-[10px] font-bold text-stone-500">{label}</span>
    <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
      className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
  </label>;
}

function ColorPalette({ value, onChange }) {
  return <div className="flex flex-wrap gap-2">
    {COLORS.map(c => <button key={c} type="button" title={c} onClick={() => onChange(c)}
      style={{ background: c }} className={`h-7 w-7 rounded-full border-2 ${value === c ? "border-stone-900" : "border-white ring-1 ring-stone-200"}`} />)}
  </div>;
}

function NumberField({ label, value, onChange, min, max, step = 1 }) {
  return <label className="block min-w-0 text-[10px] font-bold text-stone-400">
    {label}
    <input type="number" value={value ?? 0} min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))}
      className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800 outline-none focus:border-stone-500" />
  </label>;
}

function RangeField({ label, value, onChange, min = 0, max = 1, step = .01 }) {
  return <label className="block text-[10px] font-bold text-stone-400">
    <span className="flex justify-between"><span>{label}</span><span>{Math.round((value ?? min) * 100)}%</span></span>
    <input type="range" value={value ?? min} min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))} className="mt-2 w-full accent-stone-900" />
  </label>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="flex min-h-10 items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 text-xs font-semibold">
    {label}<input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} className="h-5 w-5 accent-stone-900" />
  </label>;
}

function Button({ children, onClick, active = false, danger = false, title }) {
  return <button type="button" title={title} onClick={onClick}
    className={`flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2 text-[10px] font-bold active:scale-[.98] ${
      danger ? "border-red-200 text-red-500 hover:bg-red-50" :
      active ? "border-stone-900 bg-stone-900 text-white" :
      "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
    }`}>{children}</button>;
}

function ElementActions({ id, duplicate, remove, moveUp, moveDown }) {
  return <div className="grid grid-cols-4 gap-1.5">
    <Button onClick={() => duplicate(id)} title="Duplicate"><Copy size={13}/>Copy</Button>
    <Button onClick={() => moveUp(id)} title="Move one step up"><ChevronUp size={13}/>Up</Button>
    <Button onClick={() => moveDown(id)} title="Move one step down"><ChevronDown size={13}/>Down</Button>
    <Button danger onClick={() => remove(id)} title="Delete"><Trash2 size={13}/>Delete</Button>
  </div>;
}

function TextTool({ el, update, addText, actions }) {
  const imageRef = useRef(null);
  if (!el) return <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
    <p className="section-title">Text</p>
    <Button onClick={addText}><Plus size={14}/> Add text box</Button>
    <TextPresets onSelect={preset => addText(preset)} />
    <p className="text-[10px] leading-4 text-stone-400">Select a text layer on the canvas to unlock all text controls.</p>
  </div>;

  return <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
    <div className="flex items-center justify-between"><p className="section-title">Text</p><Button onClick={addText}><Plus size={12}/>New</Button></div>
    {actions}
    <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
      <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Presets & styles</summary>
      <div className="mt-2"><TextPresets onSelect={preset => update(preset)} /></div>
    </details>
    <textarea value={el.text || ""} dir="ltr" lang="en" rows={4} style={{ textAlign: el.textAlign || "right" }}
      onChange={e => {
        update({ text: e.target.value });
      }}
      onBlur={e => {
        const value = e.target.value;
        if (value !== el.text) update({ text: value });
      }}
      className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm outline-none focus:bg-white" />

    <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
      <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Typography & alignment</summary>
      <div className="mt-2 space-y-3">
    <label className="block text-[10px] font-bold text-stone-400">Font
      <select value={el.fontFamily} onChange={e => update({ fontFamily: e.target.value })}
        className="mt-1 h-10 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs">
        {FONTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>

    <div className="grid grid-cols-2 gap-2">
      <NumberField label="Font size" value={el.fontSize} min={6} max={500} onChange={v => update({ fontSize: clamp(v,6,500) })}/>
      <NumberField label="Letter spacing" value={el.letterSpacing} min={-20} max={100} step={.5} onChange={v => update({ letterSpacing:v })}/>
      <NumberField label="Line height" value={el.lineHeight} min={.5} max={3} step={.05} onChange={v => update({ lineHeight:v })}/>
      <NumberField label="Padding %" value={el.padding} min={0} max={8} step={.5} onChange={v => update({ padding:v })}/>
      <NumberField label="Corner radius" value={el.radius} min={0} max={200} onChange={v => update({ radius:v })}/>
    </div>
    <div className="grid grid-cols-4 gap-1.5">
      <Button active={!el.textCurve} onClick={() => update({ textCurve: 0 })}>Straight</Button>
      <Button active={n(el.textCurve) === 90} onClick={() => update({ textCurve: 90 })}>Top arc</Button>
      <Button active={n(el.textCurve) === -90} onClick={() => update({ textCurve: -90 })}>Bottom arc</Button>
      <Button active={Math.abs(n(el.textCurve)) >= 350} onClick={() => update({ textCurve: 359 })}>Circle</Button>
    </div>
    <label className="block text-[10px] font-bold text-stone-400">
      Round / curve
      <span className="mt-1 flex items-center justify-between text-[10px] font-semibold text-stone-600">
        <span>{Math.round(n(el.textCurve))}°</span>
        <button type="button" className="text-stone-500 underline" onClick={() => update({ textCurve: 0 })}>Reset</button>
      </span>
      <input
        type="range"
        min="-359"
        max="359"
        step="1"
        value={n(el.textCurve)}
        onChange={event => update({ textCurve: Number(event.target.value) })}
        className="mt-2 w-full accent-stone-900"
      />
    </label>

    <div className="grid grid-cols-3 gap-1.5">
      <Button active={el.fontWeight >= 700} onClick={() => update({fontWeight:el.fontWeight >= 700 ? 400 : 700})}><Bold size={15}/></Button>
      <Button active={el.fontStyle === "italic"} onClick={() => update({fontStyle:el.fontStyle === "italic" ? "normal" : "italic"})}><Italic size={15}/></Button>
      <Button active={el.textDecoration === "underline"} onClick={() => update({textDecoration:el.textDecoration === "underline" ? "none" : "underline"})}><Underline size={15}/></Button>
    </div>

    <div className="grid grid-cols-3 gap-1.5">
      <Button active={el.textAlign==="left"} onClick={() => update({textAlign:"left"})}><AlignLeft size={15}/></Button>
      <Button active={el.textAlign==="center"} onClick={() => update({textAlign:"center"})}><AlignCenter size={15}/></Button>
      <Button active={el.textAlign==="right"} onClick={() => update({textAlign:"right"})}><AlignRight size={15}/></Button>
    </div>

    <div className="grid grid-cols-3 gap-1.5">
      <Button active={el.verticalAlign==="top"} onClick={() => update({verticalAlign:"top"})}>Top</Button>
      <Button active={el.verticalAlign==="center"} onClick={() => update({verticalAlign:"center"})}>Middle</Button>
      <Button active={el.verticalAlign==="bottom"} onClick={() => update({verticalAlign:"bottom"})}>Bottom</Button>
    </div>
      </div>
    </details>

    <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
      <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Colors & effects</summary>
      <div className="mt-2 space-y-3">
    <label className="block text-[10px] font-bold text-stone-400">Text case
      <select value={el.textTransform} onChange={e => update({textTransform:e.target.value})}
        className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-2 text-xs">
        <option value="none">Normal</option><option value="uppercase">UPPERCASE</option>
        <option value="lowercase">lowercase</option><option value="capitalize">Capitalize</option>
      </select>
    </label>

    <ColorField label="Text color" value={el.color} onChange={v => update({color:v})}/>
    <ColorPalette value={el.color} onChange={v => update({color:v})}/>
    <Toggle label="Linear gradient text" checked={el.textGradient} onChange={v => update({textGradient:v})}/>
    {el.textGradient && <div className="grid grid-cols-2 gap-2">
      <ColorField label="Gradient color 2" value={el.textGradientSecond || "#f43f5e"} onChange={v => update({textGradientSecond:v})}/>
      <NumberField label="Gradient angle" value={el.textGradientAngle || 90} min={0} max={360} onChange={v => update({textGradientAngle:v})}/>
    </div>}
    <div className="border-t border-stone-100 pt-3">
      <p className="section-title mb-2">Image inside text</p>
      <Button onClick={() => imageRef.current?.click()}><ImagePlus size={13}/>Upload text image</Button>
      <input ref={imageRef} hidden type="file" accept="image/*" onChange={event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => update({ textImage: reader.result });
        reader.readAsDataURL(file);
      }} />
      {el.textImage && <Button danger onClick={() => update({ textImage: null })}><Trash2 size={13}/>Remove image</Button>}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <ColorField label="Outline color" value={el.textStroke || "#000000"} onChange={v => update({textStroke:v})}/>
      <NumberField label="Outline width" value={el.textStrokeWidth || 0} min={0} max={20} step={.5} onChange={v => update({textStrokeWidth:v})}/>
    </div>
    <Toggle label="3D text" checked={el.text3d} onChange={v => update({text3d:v})}/>
    {el.text3d && <div className="grid grid-cols-2 gap-2">
      <ColorField label="3D depth color" value={el.text3dColor || "#7c2d12"} onChange={v => update({text3dColor:v})}/>
      <NumberField label="3D depth" value={el.text3dDepth || 4} min={1} max={12} onChange={v => update({text3dDepth:clamp(v,1,12)})}/>
    </div>}
    <Toggle label="Highlight" checked={el.highlight} onChange={v => update({highlight:v})}/>
    {el.highlight && <ColorField label="Highlight color" value={el.highlightColor || "#fde68a"} onChange={v => update({highlightColor:v})}/>}
    <ColorField label="Background" value={el.backgroundColor==="transparent" ? "#ffffff" : el.backgroundColor} onChange={v => update({backgroundColor:v})}/>
    <RangeField label="Opacity" value={el.opacity} onChange={v => update({opacity:v})}/>
    <Toggle label="Text shadow" checked={el.textShadow} onChange={v => update({textShadow:v})}/>
    <Toggle label="Locked" checked={el.locked} onChange={v => update({locked:v})}/>
      </div>
    </details>
  </div>;
}

function TextPresets({ onSelect }) {
  const [group, setGroup] = useState("English");
  return <div>
    <p className="section-title mb-2">Pre-designed text</p>
    <div className="mb-2 grid grid-cols-4 gap-1">
      {Object.keys(TEXT_PRESET_GROUPS).map(name => (
        <button key={name} type="button" onClick={() => setGroup(name)}
          className={`rounded-lg border px-1 py-2 text-[9px] font-bold ${group === name ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"}`}>
          {name}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      {TEXT_PRESET_GROUPS[group].map(([label, preset]) => (
        <button key={label} type="button" onClick={() => onSelect({ ...preset })}
          className="min-h-10 rounded-lg border border-stone-200 bg-white px-2 text-left text-[10px] font-bold text-stone-700 hover:border-stone-900 hover:bg-stone-50">
          <span className="block truncate">{label}</span>
          <span className="block truncate text-[9px] font-normal text-stone-400">{preset.text}</span>
        </button>
      ))}
    </div>
  </div>;
}

/* ============================================================
   IMAGE TOOL — updated with collapsible sections so the panel
   only takes as much space as needed (esp. on mobile).
   Sections: "Fit & Crop" (open by default), "Border & Filter",
   "Flip, Opacity & Shadow".
============================================================ */
function ImageTool({ el, update, addImage, actions }) {
  const ref = useRef(null);
  const read = file => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => addImage({src:reader.result,name:file.name});
    reader.readAsDataURL(file);
  };

  if (!el) return <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
    <p className="section-title">Image</p>
    <Button onClick={() => ref.current?.click()}><ImagePlus size={14}/> Upload image</Button>
    <input ref={ref} hidden type="file" accept="image/*" onChange={e => read(e.target.files?.[0])}/>
    <p className="text-[10px] text-stone-400">PNG, JPG, WEBP and transparent PNG work best.</p>
  </div>;

  return <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
    <div className="flex items-center justify-between"><p className="section-title">Image</p><Button onClick={() => ref.current?.click()}><Upload size={12}/>Replace</Button></div>
    <input ref={ref} hidden type="file" accept="image/*" onChange={e => {
      const file=e.target.files?.[0]; if(!file)return;
      const r=new FileReader(); r.onload=()=>update({src:r.result,name:file.name}); r.readAsDataURL(file);
    }}/>
    {actions}

    <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
      <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Fit & Crop</summary>
      <div className="mt-2 space-y-3">
        <label className="block text-[10px] font-bold text-stone-400">Fit
          <select value={el.objectFit} onChange={e => update({objectFit:e.target.value})} className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-2 text-xs">
            <option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option><option value="none">None</option>
          </select>
        </label>
        <label className="block text-[10px] font-bold text-stone-400">Crop / Position
          <select value={el.objectPosition} onChange={e => update({objectPosition:e.target.value})} className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-2 text-xs">
            {["center","top","bottom","left","right","top left","top right","bottom left","bottom right"].map(x=><option key={x}>{x}</option>)}
          </select>
        </label>
        <NumberField label="Image zoom" value={el.imageScale || 1} min={1} max={4} step={.05} onChange={v=>update({imageScale:clamp(v,1,4)})}/>
        <Button onClick={()=>update({imageScale:1, objectPosition:"center"})}><RotateCcw size={13}/>Reset crop</Button>
      </div>
    </details>

    <details className="rounded-xl border border-stone-200 bg-stone-50 p-2">
      <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Border & Filter</summary>
      <div className="mt-2 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Radius" value={el.radius} min={0} max={500} onChange={v=>update({radius:v})}/>
          <NumberField label="Border width" value={el.borderWidth} min={0} max={50} onChange={v=>update({borderWidth:v})}/>
        </div>
        <ColorField label="Border color" value={el.borderColor} onChange={v=>update({borderColor:v})}/>
        <label className="block text-[10px] font-bold text-stone-400">Filter
          <select value={el.filter} onChange={e=>update({filter:e.target.value})} className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-2 text-xs">
            {FILTERS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>
    </details>

    <details className="rounded-xl border border-stone-200 bg-stone-50 p-2">
      <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Flip, Opacity & Shadow</summary>
      <div className="mt-2 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button active={el.flipX} onClick={()=>update({flipX:!el.flipX})}><FlipHorizontal2 size={14}/>Flip X</Button>
          <Button active={el.flipY} onClick={()=>update({flipY:!el.flipY})}><FlipVertical2 size={14}/>Flip Y</Button>
        </div>
        <RangeField label="Opacity" value={el.opacity} onChange={v=>update({opacity:v})}/>
        <Toggle label="Shadow" checked={el.shadow} onChange={v=>update({shadow:v})}/>
        {el.shadow && <div className="grid grid-cols-2 gap-2">
          <NumberField label="Shadow X" value={el.shadowX} onChange={v=>update({shadowX:v})}/>
          <NumberField label="Shadow Y" value={el.shadowY} onChange={v=>update({shadowY:v})}/>
          <NumberField label="Blur" value={el.shadowBlur} min={0} max={100} onChange={v=>update({shadowBlur:v})}/>
          <ColorField label="Shadow color" value={el.shadowColor} onChange={v=>update({shadowColor:v})}/>
        </div>}
      </div>
    </details>

    <Toggle label="Locked" checked={el.locked} onChange={v=>update({locked:v})}/>
  </div>;
}

function ShapeTool({ el, addShape, update, actions }) {
  const imageRef = useRef(null);
  return <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
    <p className="section-title">Shapes</p>
    <div className="grid grid-cols-4 gap-1.5">
      {SHAPES.map(([type,label,Icon])=><button key={type} type="button" onClick={()=>addShape(type)}
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 text-[8px] font-bold hover:bg-stone-100">
        <Icon size={16}/>{label}
      </button>)}
    </div>
    {!el ? <p className="text-[10px] text-stone-400">Add a shape or select one on the canvas.</p> : <>
      {actions}
      <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
        <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Fill & border</summary>
        <div className="mt-2 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Fill" value={el.fill} onChange={v=>update({fill:v})}/>
        <ColorField label="Second color" value={el.fill2} onChange={v=>update({fill2:v})}/>
      </div>
      <ColorPalette value={el.fill} onChange={v=>update({fill:v})}/>
      <div className="grid grid-cols-2 gap-2">
        <Button active={el.fillType==="solid"} onClick={()=>update({fillType:"solid"})}>Solid</Button>
        <Button active={el.fillType==="gradient"} onClick={()=>update({fillType:"gradient"})}>Gradient</Button>
      </div>
      {el.fillType==="gradient" && <NumberField label="Gradient angle" value={el.gradientAngle} min={0} max={360} onChange={v=>update({gradientAngle:v})}/>}
      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Border" value={el.stroke} onChange={v=>update({stroke:v})}/>
        <NumberField label="Border width" value={el.strokeWidth} min={0} max={50} onChange={v=>update({strokeWidth:v})}/>
        <NumberField label="Radius" value={el.radius} min={0} max={500} onChange={v=>update({radius:v})}/>
        <RangeField label="Opacity" value={el.opacity} onChange={v=>update({opacity:v})}/>
      </div>
        </div>
      </details>
      <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
        <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Shadow</summary>
        <div className="mt-2 space-y-3">
      <Toggle label="Shadow" checked={el.shadow} onChange={v=>update({shadow:v})}/>
      {el.shadow && <div className="grid grid-cols-2 gap-2">
        <NumberField label="Shadow X" value={el.shadowX} onChange={v=>update({shadowX:v})}/>
        <NumberField label="Shadow Y" value={el.shadowY} onChange={v=>update({shadowY:v})}/>
        <NumberField label="Blur" value={el.shadowBlur} min={0} max={100} onChange={v=>update({shadowBlur:v})}/>
        <ColorField label="Shadow color" value={el.shadowColor} onChange={v=>update({shadowColor:v})}/>
      </div>}
        </div>
      </details>
      <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
        <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Shape text</summary>
        <div className="mt-2 space-y-3">
      <div className="border-t pt-3">
        <input value={el.text||""} onChange={e=>update({text:e.target.value})} placeholder="Text inside shape"
          className="h-10 w-full rounded-lg border border-stone-200 px-3 text-xs"/>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumberField label="Text size" value={el.textSize} min={6} max={300} onChange={v=>update({textSize:v})}/>
          <ColorField label="Text color" value={el.textColor} onChange={v=>update({textColor:v})}/>
        </div>
        <select value={el.textFontFamily || "Inter, sans-serif"} onChange={e=>update({textFontFamily:e.target.value})} className="h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs">
          {FONTS.map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-1.5">
          <Button active={el.textAlign==="left"} onClick={()=>update({textAlign:"left"})}>Left</Button>
          <Button active={el.textAlign==="center"} onClick={()=>update({textAlign:"center"})}>Center</Button>
          <Button active={el.textAlign==="right"} onClick={()=>update({textAlign:"right"})}>Right</Button>
        </div>
      </div>
        </div>
      </details>
      <details open className="rounded-xl border border-stone-200 bg-stone-50 p-2">
        <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-black text-stone-700">Image fill</summary>
        <div className="mt-2 space-y-3">
      <div className="border-t pt-3">
        <p className="section-title mb-2">Image inside shape</p>
        <Button onClick={()=>imageRef.current?.click()}><ImagePlus size={13}/>Upload image</Button>
        <input ref={imageRef} hidden type="file" accept="image/*" onChange={e=>{
          const file=e.target.files?.[0]; if(!file)return;
          const r=new FileReader();
          r.onload=()=>update({image:r.result});
          r.readAsDataURL(file);
        }}/>
        {el.image && <div className="grid grid-cols-2 gap-2">
          <select value={el.imageFit || "cover"} onChange={e=>update({imageFit:e.target.value})} className="h-9 rounded-lg border border-stone-200 bg-white px-2 text-xs">
            <option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option>
          </select>
          <select value={el.imagePosition || "center"} onChange={e=>update({imagePosition:e.target.value})} className="h-9 rounded-lg border border-stone-200 bg-white px-2 text-xs">
            {["center","top","bottom","left","right"].map(position=><option key={position}>{position}</option>)}
          </select>
        </div>}
        {el.image && <>
          <img src={el.image} alt="Shape preview" className="mt-2 h-20 w-full rounded-lg border border-stone-200 object-cover" />
          <Button danger onClick={()=>update({image:null})}><Trash2 size={13}/>Remove image</Button>
        </>}
      </div>
        </div>
      </details>
      <Toggle label="Locked" checked={el.locked} onChange={v=>update({locked:v})}/>
    </>}
  </div>;
}

function BackgroundTool({ background, type, second, angle, image, imageFit, imagePosition, setBackground, setType, setSecond, setAngle, setImage, setImageFit, setImagePosition }) {
  const fileRef = useRef(null);
  return <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
    <p className="section-title">Background</p>
    <div className="grid grid-cols-2 gap-2"><Button active={type==="solid"} onClick={()=>setType("solid")}>Solid</Button><Button active={type==="gradient"} onClick={()=>setType("gradient")}>Gradient</Button></div>
    <ColorField label="Color" value={background} onChange={setBackground}/>
    <ColorPalette value={background} onChange={setBackground}/>
    {type==="gradient" && <>
      <ColorField label="Second color" value={second} onChange={setSecond}/>
      <ColorPalette value={second} onChange={setSecond}/>
      <NumberField label="Gradient angle" value={angle} min={0} max={360} onChange={setAngle}/>
    </>}
    <div className="border-t border-stone-100 pt-3">
      <p className="section-title mb-2">Background image</p>
      <Button onClick={() => fileRef.current?.click()}><ImagePlus size={14}/> Upload background</Button>
      <input ref={fileRef} hidden type="file" accept="image/*" onChange={e => {
        const file=e.target.files?.[0]; if(!file)return;
        const reader=new FileReader();
        reader.onload=()=>setImage(reader.result);
        reader.readAsDataURL(file);
      }}/>
      {image && <>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[10px] font-bold text-stone-400">Fit
            <select value={imageFit} onChange={e => setImageFit(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-2 text-xs">
              <option value="cover">Cover</option><option value="contain">Contain</option><option value="auto">Original</option>
            </select>
          </label>
          <label className="block text-[10px] font-bold text-stone-400">Position
            <select value={imagePosition} onChange={e => setImagePosition(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-2 text-xs">
              {["center","top","bottom","left","right","top left","top right","bottom left","bottom right"].map(x=><option key={x}>{x}</option>)}
            </select>
          </label>
        </div>
        <Button danger onClick={()=>setImage(null)}><Trash2 size={13}/>Remove image</Button>
      </>}
    </div>
  </div>;
}

function TransformTool({ el, update, alignCenter, alignMiddle, reset }) {
  if (!el) return <div className="rounded-xl border border-stone-100 bg-white p-4 text-xs text-stone-400">Select an element first.</div>;
  return <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
    <p className="section-title">Position & Transform</p>
    <div className="grid grid-cols-2 gap-2">
      <NumberField label="X %" value={el.x} min={0} max={100} step={.1} onChange={v=>update({x:clamp(v,0,100-el.width)})}/>
      <NumberField label="Y %" value={el.y} min={0} max={100} step={.1} onChange={v=>update({y:clamp(v,0,100-el.height)})}/>
      <NumberField label="Width %" value={el.width} min={3} max={100} step={.1} onChange={v=>update({width:clamp(v,3,100-el.x)})}/>
      <NumberField label="Height %" value={el.height} min={3} max={100} step={.1} onChange={v=>update({height:clamp(v,3,100-el.y)})}/>
      <NumberField label="Rotation" value={el.rotation} min={-360} max={360} onChange={v=>update({rotation:v})}/>
      <RangeField label="Opacity" value={el.opacity} onChange={v=>update({opacity:v})}/>
    </div>
    <div className="grid grid-cols-3 gap-1.5">
      <Button onClick={()=>update({rotation:n(el.rotation)-90})}>-90°</Button>
      <Button onClick={()=>update({rotation:n(el.rotation)+90})}>+90°</Button>
      <Button onClick={reset}><RefreshIcon/>Reset</Button>
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      <Button onClick={alignCenter}><AlignHorizontalJustifyCenter size={14}/>Center X</Button>
      <Button onClick={alignMiddle}><AlignVerticalJustifyCenter size={14}/>Center Y</Button>
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      <Button active={el.flipX} onClick={()=>update({flipX:!el.flipX})}><FlipHorizontal2 size={14}/>Flip X</Button>
      <Button active={el.flipY} onClick={()=>update({flipY:!el.flipY})}><FlipVertical2 size={14}/>Flip Y</Button>
    </div>
    <Toggle label="Locked" checked={el.locked} onChange={v=>update({locked:v})}/>
  </div>;
}
function RefreshIcon(){ return <RotateCcw size={14}/>; }

function LayersPanel({ elements, selectedId, select, update, remove, duplicate, moveUp, moveDown, reorder }) {
  const [draggedId, setDraggedId] = useState(null);
  const [overId, setOverId] = useState(null);

  const drop = (targetId) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setOverId(null);
      return;
    }
    reorder(draggedId, targetId);
    setDraggedId(null);
    setOverId(null);
  };

  return <div className="rounded-xl border border-stone-100 bg-white p-2">
    <div className="px-1 pb-2"><p className="text-sm font-bold">Layers</p><p className="text-[10px] text-stone-400">{elements.length} elements</p></div>
    <div className="max-h-[60vh] overflow-y-auto">
      {[...elements].reverse().map(el=>{
        const index=elements.findIndex(x=>x.id===el.id);
        return <div key={el.id}
          draggable
          onDragStart={() => setDraggedId(el.id)}
          onDragOver={e => { e.preventDefault(); setOverId(el.id); }}
          onDragLeave={() => setOverId(null)}
          onDrop={() => drop(el.id)}
          onDragEnd={() => { setDraggedId(null); setOverId(null); }}
          className={`mb-1 flex cursor-grab items-center gap-1 rounded-lg border p-1 active:cursor-grabbing ${
            overId===el.id ? "border-sky-500 bg-sky-50" :
            selectedId===el.id ? "border-stone-900 bg-stone-50" : "border-transparent"
          }`}>
          <button onClick={()=>select(el.id)} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5 text-left">
            <GripVertical size={12} className="shrink-0 text-stone-400"/>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-white text-[10px] font-black shadow-sm">{el.type==="text"?"T":el.type==="image"?"▧":"◆"}</span>
            <span className="truncate text-[11px] font-semibold">{el.name||el.text||el.type}</span>
          </button>
          <button title="Show/hide" onClick={()=>update(el.id,{visible:el.visible===false})} className="p-1 text-stone-400">{el.visible===false?<EyeOff size={13}/>:<Eye size={13}/>}</button>
          <button title="Lock" onClick={()=>update(el.id,{locked:!el.locked})} className="p-1 text-stone-400">{el.locked?<Lock size={13}/>:<LockOpen size={13}/>}</button>
          {selectedId===el.id && <>
            <button type="button" disabled={index===elements.length-1} onClick={()=>moveUp(el.id)} className="p-1 disabled:opacity-20" title="Move one step up"><ChevronUp size={13}/></button>
            <button type="button" disabled={index===0} onClick={()=>moveDown(el.id)} className="p-1 disabled:opacity-20" title="Move one step down"><ChevronDown size={13}/></button>
            <button onClick={()=>duplicate(el.id)} className="p-1"><Copy size={13}/></button>
            <button onClick={()=>remove(el.id)} className="p-1 text-red-500"><Trash2 size={13}/></button>
          </>}
        </div>;
      })}
    </div>
  </div>;
}

function Templates({ addTemplate }) {
  const templates = [
    ["Minimal", "Minimal clean post"],
    ["Promo", "Bold promotional post"],
    ["Quote", "Quote card"],
    ["Sale", "Sale campaign"],
    ["Product", "Product launch"],
    ["Event", "Event invite"],
    ["Food", "Food special"],
    ["Hiring", "Hiring post"],
    ["Real Estate", "Property listing"],
    ["Webinar", "Webinar promo"],
    ["Testimonial", "Customer review"],
    ["Festival", "Festival greeting"],
    ["Podcast", "Podcast episode"],
    ["Announcement", "Announcement"],
  ];
  return <div className="grid grid-cols-2 gap-2">{templates.map(([id,label])=>
    <button key={id} type="button" title={`Use ${label}`} onClick={()=>addTemplate(id)}
      className="group overflow-hidden rounded-xl border border-stone-200 bg-white text-left transition hover:border-stone-900 hover:shadow-md active:scale-[.98]">
      <TemplatePreview elements={makeTemplate(id)} />
      <div className="p-2">
        <span className="flex items-center gap-1.5 text-[10px] font-black text-stone-800"><LayoutTemplate size={13}/>{label}</span>
        <span className="mt-1 block text-[9px] text-stone-400">Click to use</span>
      </div>
    </button>
  )}</div>;
}

function TemplatePreview({ elements }) {
  return <div className="relative aspect-[4/3] overflow-hidden bg-[#f5efff]">
    {elements.map((element, index) => {
      const style = {
        position: "absolute", left: `${n(element.x)}%`, top: `${n(element.y)}%`,
        width: `${n(element.width)}%`, height: `${n(element.height)}%`,
        zIndex: index + 1, opacity: element.opacity ?? 1, overflow: "hidden",
        transform: `rotate(${n(element.rotation)}deg)`,
      };
      if (element.type === "text") {
        return <div key={element.id} style={{
          ...style, display: "flex", alignItems: "center",
          justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
          padding: "2%", textAlign: element.textAlign || "center", whiteSpace: "pre-wrap",
          lineHeight: n(element.lineHeight, 1.1), color: element.color || "#171717",
          fontSize: `${Math.max(4, n(element.fontSize, 44) * .12)}px`, fontWeight: n(element.fontWeight, 700),
          background: element.highlight ? element.highlightColor : element.backgroundColor === "transparent" ? "transparent" : element.backgroundColor,
        }}>{element.text}</div>;
      }
      return <div key={element.id} style={{
        ...style, background: shapeBackground(element),
        borderRadius: element.shape === "circle" ? "50%" : element.shape === "pill" ? "999px" : `${n(element.radius) * .12}px`,
      }} />;
    })}
  </div>;
}

const TOOLS = [
  ["templates","Templates",LayoutTemplate],
  ["text","Text",Type],
  ["image","Image",ImageIcon],
  ["shape","Shape",Square],
  ["background","Background",PaletteIcon],
  ["transform","Transform",Move],
  ["layers","Layers",LayersIcon],
];

const TITLES = {
  templates:"Templates", text:"Text", image:"Images", shape:"Shapes",
  background:"Background", transform:"Position & Transform", layers:"Layers"
};

function makeTemplate(kind) {
  if (kind==="Minimal") return [
    makeText("MAKE IT SIMPLE",{x:10,y:35,width:80,height:16,fontSize:58,fontWeight:800}),
    makeText("Clean design. Clear message.",{x:15,y:55,width:70,height:10,fontSize:23,fontWeight:400,color:"#555"}),
  ];
  if (kind==="Promo") return [
    makeShape("rounded",{x:7,y:8,width:86,height:84,fill:"#111827",radius:28}),
    makeText("50% OFF",{x:12,y:30,width:76,height:18,fontSize:72,color:"#ffffff",fontWeight:900}),
    makeText("LIMITED TIME OFFER",{x:15,y:53,width:70,height:9,fontSize:24,color:"#fde68a",fontWeight:800}),
    makeShape("pill",{x:28,y:70,width:44,height:9,fill:"#fde68a",text:"SHOP NOW",textColor:"#111827",textSize:16}),
  ];
  if (kind==="Quote") return [
    makeShape("rectangle",{x:7,y:8,width:86,height:84,fill:"#eaf0ff"}),
    makeText("“Design is intelligence made visible.”",{x:12,y:31,width:76,height:25,fontSize:42,fontWeight:800,color:"#171717"}),
    makeText("— Alina Wheeler",{x:20,y:65,width:60,height:8,fontSize:20,fontWeight:500,color:"#555"}),
  ];
  if (kind==="Sale") return [
    makeShape("rectangle",{x:0,y:0,width:100,height:100,fill:"#fff1e8"}),
    makeShape("circle",{x:7,y:9,width:24,height:24,fill:"#ef4444"}),
    makeText("SALE",{x:10,y:15,width:80,height:18,fontSize:76,fontWeight:900,color:"#ef4444"}),
    makeText("UP TO 70% OFF",{x:15,y:38,width:70,height:12,fontSize:34,fontWeight:800}),
    makeShape("pill",{x:28,y:70,width:44,height:10,fill:"#171717",text:"SHOP NOW",textColor:"#ffffff",textSize:17}),
  ];
  if (kind==="Product") return [
    makeShape("rounded",{x:7,y:7,width:86,height:86,fill:"#eaf0ff",radius:28}),
    makeText("NEW ARRIVAL",{x:14,y:16,width:72,height:10,fontSize:25,fontWeight:800,color:"#3156c9"}),
    makeShape("circle",{x:25,y:31,width:50,height:35,fill:"#ffffff",shadow:true}),
    makeText("YOUR\nPRODUCT",{x:15,y:72,width:70,height:14,fontSize:34,fontWeight:900}),
  ];
  if (kind==="Event") return [
    makeShape("rectangle",{x:0,y:0,width:100,height:100,fill:"#171717"}),
    makeText("SAVE THE DATE",{x:12,y:13,width:76,height:9,fontSize:24,fontWeight:800,color:"#fde68a"}),
    makeText("CREATIVE\nWORKSHOP",{x:10,y:30,width:80,height:27,fontSize:58,fontWeight:900,color:"#ffffff"}),
    makeText("24 AUG  •  6:00 PM",{x:15,y:68,width:70,height:9,fontSize:23,fontWeight:700,color:"#fde68a"}),
    makeShape("pill",{x:29,y:82,width:42,height:8,fill:"#fde68a",text:"REGISTER",textColor:"#171717",textSize:15}),
  ];
  if (kind==="Food") return [
    makeShape("rounded",{x:6,y:6,width:88,height:88,fill:"#fff7ed",radius:32}),
    makeText("TODAY'S SPECIAL",{x:12,y:16,width:76,height:9,fontSize:24,fontWeight:800,color:"#c2410c"}),
    makeText("Fresh.\nFast.\nDelicious.",{x:12,y:29,width:76,height:30,fontSize:52,fontWeight:900,color:"#7c2d12",textAlign:"left",verticalAlign:"top"}),
    makeShape("pill",{x:12,y:74,width:38,height:10,fill:"#ea580c",text:"ORDER NOW",textColor:"#ffffff",textSize:14}),
  ];
  if (kind==="Hiring") return [
    makeShape("rectangle",{x:0,y:0,width:100,height:100,fill:"#e8f5f1"}),
    makeText("WE ARE\nHIRING",{x:10,y:20,width:80,height:26,fontSize:67,fontWeight:900,color:"#065f46",textAlign:"left",verticalAlign:"top"}),
    makeText("Join our growing team",{x:12,y:57,width:76,height:9,fontSize:25,color:"#134e4a"}),
    makeShape("pill",{x:28,y:75,width:44,height:9,fill:"#065f46",text:"APPLY NOW",textColor:"#ffffff",textSize:15}),
  ];
  if (kind==="Real Estate") return [
    makeShape("rectangle",{x:0,y:0,width:100,height:100,fill:"#eaf0ff"}),
    makeText("FOR SALE",{x:12,y:14,width:76,height:9,fontSize:28,fontWeight:800,color:"#1d4ed8"}),
    makeText("Your dream\nhome awaits",{x:10,y:29,width:80,height:24,fontSize:52,fontWeight:900,textAlign:"left",verticalAlign:"top"}),
    makeText("$450,000  •  3 BED  •  2 BATH",{x:12,y:64,width:76,height:8,fontSize:18,fontWeight:700,color:"#1e3a8a"}),
    makeShape("pill",{x:30,y:78,width:40,height:9,fill:"#1d4ed8",text:"VIEW DETAILS",textColor:"#ffffff",textSize:13}),
  ];
  if (kind==="Webinar") return [
    makeShape("rounded",{x:7,y:7,width:86,height:86,fill:"#f5efff",radius:26}),
    makeText("LIVE WEBINAR",{x:14,y:16,width:72,height:9,fontSize:25,fontWeight:800,color:"#7e22ce"}),
    makeText("Grow your\nbusiness online",{x:12,y:30,width:76,height:25,fontSize:49,fontWeight:900,textAlign:"left",verticalAlign:"top"}),
    makeText("FREE • 12 SEPTEMBER",{x:14,y:65,width:72,height:8,fontSize:21,fontWeight:700,color:"#581c87"}),
    makeShape("pill",{x:29,y:78,width:42,height:9,fill:"#7e22ce",text:"JOIN FREE",textColor:"#ffffff",textSize:15}),
  ];
  if (kind==="Testimonial") return [
    makeShape("rounded",{x:7,y:8,width:86,height:84,fill:"#171717",radius:26}),
    makeText("“",{x:13,y:17,width:20,height:22,fontSize:80,fontWeight:900,color:"#fde68a"}),
    makeText("This service changed the way we work.",{x:14,y:34,width:72,height:24,fontSize:35,fontWeight:700,color:"#ffffff",textAlign:"left",verticalAlign:"top"}),
    makeText("— Happy Customer",{x:18,y:70,width:64,height:8,fontSize:20,color:"#fde68a"}),
  ];
  if (kind==="Festival") return [
    makeShape("rectangle",{x:0,y:0,width:100,height:100,fill:"#fff1f2"}),
    makeText("HAPPY FESTIVAL",{x:10,y:15,width:80,height:10,fontSize:28,fontWeight:800,color:"#be123c"}),
    makeText("Celebrate\nwith joy",{x:10,y:31,width:80,height:25,fontSize:58,fontWeight:900,color:"#881337",textAlign:"left",verticalAlign:"top"}),
    makeText("Special offers inside",{x:15,y:66,width:70,height:8,fontSize:23,color:"#9f1239"}),
    makeShape("pill",{x:30,y:79,width:40,height:9,fill:"#be123c",text:"EXPLORE",textColor:"#ffffff",textSize:15}),
  ];
  if (kind==="Podcast") return [
    makeShape("circle",{x:17,y:12,width:66,height:66,fill:"#111827"}),
    makeText("PODCAST",{x:16,y:27,width:68,height:9,fontSize:25,fontWeight:800,color:"#93c5fd"}),
    makeText("THE\nNEXT\nIDEA",{x:13,y:42,width:74,height:28,fontSize:43,fontWeight:900,color:"#ffffff"}),
    makeText("EPISODE 08  •  LISTEN NOW",{x:12,y:84,width:76,height:7,fontSize:17,fontWeight:700,color:"#111827"}),
  ];
  if (kind==="Announcement") return [
    makeShape("rounded",{x:8,y:10,width:84,height:80,fill:"#171717",radius:24}),
    makeText("BIG NEWS",{x:13,y:29,width:74,height:16,fontSize:64,color:"#ffffff",fontWeight:900}),
    makeText("Something exciting is coming.",{x:16,y:51,width:68,height:12,fontSize:24,color:"#fde68a"}),
  ];
  return [
    makeShape("rounded",{x:8,y:10,width:84,height:80,fill:"#171717",radius:24}),
    makeText("BIG NEWS",{x:13,y:29,width:74,height:16,fontSize:64,color:"#ffffff",fontWeight:900}),
    makeText("Something exciting is coming.",{x:16,y:51,width:68,height:12,fontSize:24,color:"#fde68a"}),
  ];
}

function StudioExport({ canvasRef, format, background, onDone }) {
  const [busy,setBusy]=useState(false);

  const exportFile = async type => {
    const source=canvasRef.current;
    if(!source || busy) return;
    setBusy(true);
    const disabledStyles=[];
    try {
      const f=FORMATS[format]||FORMATS["Square Post"];
      const clone=source.cloneNode(true);
      clone.querySelectorAll("[data-editor-only]").forEach(x=>x.remove());
      clone.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable"));
      clone.style.position="fixed";
      clone.style.left="0";
      clone.style.top="0";
      clone.style.pointerEvents="none";
      clone.style.width=`${f.w}px`;
      clone.style.height=`${f.h}px`;
      clone.style.aspectRatio="auto";
      clone.style.borderRadius="0";
      clone.style.boxShadow="none";
      clone.style.transform="none";
      clone.style.overflow="hidden";
      clone.style.margin="0";
      clone.style.zIndex="-1";
      clone.setAttribute("data-export-clone","true");
      document.body.appendChild(clone);

      const imgs=[...clone.querySelectorAll("img")];
      await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r;})));
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

      document.querySelectorAll("style, link[rel='stylesheet']").forEach(node => {
        disabledStyles.push({
          node,
          disabled: node.disabled,
          media: node.media,
        });
        if (node.tagName === "LINK") node.disabled = true;
        else node.media = "not all";
      });

      const shot=await html2canvas(clone,{
        width:f.w,height:f.h,scale:1,
        backgroundColor:null,useCORS:true,allowTaint:true,
        imageTimeout:15000,logging:false,
        foreignObjectRendering:false,
        onclone: clonedDocument => {
          clonedDocument.querySelectorAll("style, link[rel='stylesheet']").forEach(node => node.remove());
          const exportStyles = clonedDocument.createElement("style");
          exportStyles.textContent = `
            .relative{position:relative}
            .absolute{position:absolute}
            .inset-0{inset:0}
            .top-0{top:0}
            .left-1\\/2{left:50%}
            .grid{display:grid}
            .place-items-center{place-items:center}
            .flex{display:flex}
            .h-full{height:100%}
            .w-full{width:100%}
            .min-w-0{min-width:0}
            .pointer-events-none{pointer-events:none}
            .overflow-hidden{overflow:hidden}
            .break-words{overflow-wrap:break-word}
            .p-2{padding:.5rem}
            .text-center{text-align:center}
            .font-bold{font-weight:700}
            .block{display:block}
          `;
          clonedDocument.head.appendChild(exportStyles);
        },
      });
      clone.remove();

      const mime=type==="jpg"?"image/jpeg":type==="webp"?"image/webp":"image/png";
      const quality=type==="png" || type==="svg"?undefined:.95;
      const data=shot.toDataURL(mime,quality);

      if(type==="pdf"){
        const pdf=new jsPDF({orientation:f.w>=f.h?"landscape":"portrait",unit:"px",format:[f.w,f.h],compress:true});
        pdf.addImage(data,"PNG",0,0,f.w,f.h,undefined,"FAST");
        pdf.save(`design-${Date.now()}.pdf`);
      } else if(type==="svg"){
        const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${f.w}" height="${f.h}" viewBox="0 0 ${f.w} ${f.h}"><image width="${f.w}" height="${f.h}" href="${data}" xlink:href="${data}"/></svg>`;
        const blob=new Blob([svg],{type:"image/svg+xml;charset=utf-8"});
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=url;a.download=`design-${Date.now()}.svg`;
        document.body.appendChild(a);a.click();a.remove();
        URL.revokeObjectURL(url);
      } else {
        const a=document.createElement("a");
        a.href=data;a.download=`design-${Date.now()}.${type}`;
        document.body.appendChild(a);a.click();a.remove();
      }
      onDone?.(`Downloaded ${type.toUpperCase()}`);
    } catch(err) {
      console.error("Design export error:",err);
      alert(`Export failed: ${err?.message || "Unknown error"}`);
    } finally {
      disabledStyles.forEach(({node,disabled,media}) => {
        node.disabled = disabled;
        node.media = media;
      });
      document.querySelectorAll('[data-export-clone="true"]').forEach(x=>x.remove());
      setBusy(false);
    }
  };

  return <div>
    <div className="w-44 rounded-xl border border-stone-200 bg-white p-1 shadow-2xl">
      {[["png","PNG Image"],["jpg","JPG Image"],["webp","WEBP Image"],["pdf","PDF Document"],["svg","SVG Image"]].map(([t,l])=>
        <button key={t} type="button" disabled={busy} onClick={()=>exportFile(t)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-semibold hover:bg-stone-100 disabled:opacity-50">
          {t==="pdf"?<FileText size={14}/>:<FileImage size={14}/>} {l}
        </button>
      )}
    </div>
  </div>;
}

export default function DesignStudio() {
  const [format, setFormat] = useState("Square Post");

  const [background, setBackground] = useState("#f5efff");
  const [backgroundType, setBackgroundType] = useState("solid");
  const [backgroundSecond, setBackgroundSecond] = useState("#ffffff");
  const [backgroundAngle, setBackgroundAngle] = useState(135);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundImageFit, setBackgroundImageFit] = useState("cover");
  const [backgroundImagePosition, setBackgroundImagePosition] = useState("center");

  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const safeElements = Array.isArray(elements) ? elements : [];

  const [panel, setPanel] = useState(null);

  const [zoom, setZoom] = useState(100);

  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [snapGrid, setSnapGrid] = useState(5);

  const [preview, setPreview] = useState(false);

  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const [exportOpen, setExportOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [saveName, setSaveName] = useState("");

  const pendingRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const importRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * SELECTED ELEMENT
   * ---------------------------------------------------------
   */

  const selected = useMemo(
    () => safeElements.find((item) => item.id === selectedId) || null,
    [safeElements, selectedId]
  );

  /*
   * ---------------------------------------------------------
   * STATUS HELPER
   * ---------------------------------------------------------
   */

  const showStatus = useCallback((message, duration = 2500) => {
    setStatus(message);

    window.clearTimeout(showStatus.timer);

    showStatus.timer = window.setTimeout(() => {
      setStatus("");
    }, duration);
  }, []);

  const makeSnapshot = useCallback(() => ({
    version: 1,
    savedAt: new Date().toISOString(),
    format,
    background,
    backgroundType,
    backgroundSecond,
    backgroundAngle,
    backgroundImage,
    backgroundImageFit,
    backgroundImagePosition,
    showGuides,
    elements: safeElements,
  }), [
    format, background, backgroundType, backgroundSecond, backgroundAngle,
    backgroundImage, backgroundImageFit, backgroundImagePosition, showGuides, safeElements,
  ]);

  const persistSavedDesigns = useCallback((next) => {
    try {
      window.localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(next));
      setSavedDesigns(next);
      return true;
    } catch (error) {
      console.error("Saved post could not be stored:", error);
      showStatus("Post could not be saved in this browser");
      return false;
    }
  }, [showStatus]);

  const saveCurrentDesign = useCallback(() => {
    const name = saveName.trim() || `Post ${savedDesigns.length + 1}`;
    const snapshot = { ...makeSnapshot(), id: uid(), name, savedAt: new Date().toISOString() };
    if (!persistSavedDesigns([snapshot, ...savedDesigns])) return;
    setSaveName("");
    showStatus(`"${name}" saved`);
  }, [makeSnapshot, persistSavedDesigns, saveName, savedDesigns, showStatus]);

  const deleteSavedDesign = useCallback((id) => {
    const next = savedDesigns.filter(item => item.id !== id);
    persistSavedDesigns(next);
    showStatus("Saved post deleted");
  }, [persistSavedDesigns, savedDesigns, showStatus]);

  const saveAndOpenLibrary = useCallback(() => {
    if (safeElements.length) saveCurrentDesign();
    setFileOpen(false);
    setSavedOpen(true);
  }, [safeElements.length, saveCurrentDesign]);

  const downloadSavedDesign = useCallback(async (snapshot) => {
    const formatData = FORMATS[snapshot.format] || FORMATS["Square Post"];
    const root = document.createElement("div");
    const disabledStyles = [];
    root.style.cssText = `position:fixed;left:0;top:0;width:${formatData.w}px;height:${formatData.h}px;overflow:hidden;pointer-events:none;z-index:-1;`;
    root.style.background = snapshot.backgroundType === "gradient"
      ? `linear-gradient(${n(snapshot.backgroundAngle, 135)}deg, ${snapshot.background}, ${snapshot.backgroundSecond})`
      : snapshot.background || "#ffffff";
    if (snapshot.backgroundImage) {
      root.style.backgroundImage = snapshot.backgroundType === "gradient"
        ? `url(${snapshot.backgroundImage}), linear-gradient(${n(snapshot.backgroundAngle, 135)}deg, ${snapshot.background}, ${snapshot.backgroundSecond})`
        : `url(${snapshot.backgroundImage})`;
      root.style.backgroundSize = snapshot.backgroundType === "gradient"
        ? `${snapshot.backgroundImageFit || "cover"}, 100% 100%`
        : snapshot.backgroundImageFit || "cover";
      root.style.backgroundPosition = snapshot.backgroundImagePosition || "center";
    }

    (snapshot.elements || []).filter(element => element.visible !== false).forEach((element, index) => {
      const node = document.createElement(element.type === "image" ? "img" : "div");
      node.style.position = "absolute";
      node.style.left = `${n(element.x)}%`;
      node.style.top = `${n(element.y)}%`;
      node.style.width = `${n(element.width)}%`;
      node.style.height = `${n(element.height)}%`;
      node.style.opacity = element.opacity ?? 1;
      node.style.transform = `rotate(${n(element.rotation)}deg)`;
      node.style.zIndex = String(index + 1);
      node.style.overflow = "hidden";

      if (element.type === "image") {
        node.src = element.src;
        node.alt = "";
        node.style.objectFit = element.objectFit || "cover";
        node.style.objectPosition = element.objectPosition || "center";
        node.style.borderRadius = `${n(element.radius)}px`;
        node.style.border = `${n(element.borderWidth)}px solid ${element.borderColor || "#ffffff"}`;
        node.style.filter = element.filter || "none";
      } else if (element.type === "text") {
        node.textContent = element.text || "";
        node.style.display = "flex";
        node.style.alignItems = element.verticalAlign === "top" ? "flex-start" : element.verticalAlign === "bottom" ? "flex-end" : "center";
        node.style.justifyContent = element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center";
        node.style.padding = `${clamp(element.padding, 0, 8)}%`;
        node.style.textAlign = element.textAlign || "center";
        node.style.whiteSpace = "pre-wrap";
        node.style.wordBreak = "break-word";
        node.style.fontFamily = element.fontFamily || "Inter, sans-serif";
        node.style.fontSize = `${n(element.fontSize, 44)}px`;
        node.style.fontWeight = n(element.fontWeight, 700);
        node.style.fontStyle = element.fontStyle || "normal";
        node.style.textDecoration = element.textDecoration || "none";
        node.style.textTransform = element.textTransform || "none";
        node.style.lineHeight = n(element.lineHeight, 1.1);
        node.style.letterSpacing = `${n(element.letterSpacing)}px`;
        node.style.color = element.color || "#171717";
        node.style.background = element.highlight ? element.highlightColor || "#fde68a" : element.backgroundColor === "transparent" ? "transparent" : element.backgroundColor;
        node.style.borderRadius = `${n(element.radius)}px`;
        node.style.textShadow = element.textShadow ? "0 3px 12px #0006" : "none";
        node.style.webkitTextStroke = `${n(element.textStrokeWidth)}px ${element.textStroke || "#000000"}`;
      } else {
        node.style.background = shapeBackground(element);
        node.style.border = `${n(element.strokeWidth)}px solid ${element.stroke || "#171717"}`;
        node.style.borderRadius = element.shape === "circle" ? "50%" : element.shape === "pill" ? "999px" : `${n(element.radius)}px`;
        if (element.shape === "triangle") node.style.clipPath = "polygon(50% 0%,100% 100%,0% 100%)";
        if (element.shape === "diamond") node.style.clipPath = "polygon(50% 0%,100% 50%,50% 100%,0% 50%)";
        if (element.shape === "star") node.style.clipPath = "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";
        if (element.shape === "heart") node.style.clipPath = "polygon(50% 100%,0% 35%,10% 15%,30% 10%,50% 28%,70% 10%,90% 15%,100% 35%)";
        if (element.text) {
          node.textContent = element.text;
          node.style.display = "grid";
          node.style.placeItems = "center";
          node.style.color = element.textColor || "#ffffff";
          node.style.fontSize = `${n(element.textSize, 26)}px`;
          node.style.fontWeight = "700";
          node.style.textAlign = element.textAlign || "center";
        }
      }
      root.appendChild(node);
    });

    try {
      document.body.appendChild(root);
      const imgs = [...root.querySelectorAll("img")];
      await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })));
      document.querySelectorAll("style, link[rel='stylesheet']").forEach(node => {
        disabledStyles.push({ node, disabled: node.disabled, media: node.media });
        if (node.tagName === "LINK") node.disabled = true;
        else node.media = "not all";
      });
      const canvas = await html2canvas(root, { width: formatData.w, height: formatData.h, scale: 1, backgroundColor: null, useCORS: true, allowTaint: true, logging: false });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${(snapshot.name || "design").replace(/[^a-z0-9-_]+/gi, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showStatus("Saved post image downloaded");
    } catch (error) {
      console.error("Saved post image download error:", error);
      showStatus("Saved post image could not be downloaded");
    } finally {
      disabledStyles.forEach(({ node, disabled, media }) => {
        node.disabled = disabled;
        node.media = media;
      });
      root.remove();
    }
  }, [showStatus]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_DESIGNS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedDesigns(parsed.map(item => ({
            ...item,
            id: item.id || uid(),
            name: item.name || "Untitled post",
          })));
        }
      }
    } catch (error) {
      console.warn("Saved designs could not be loaded:", error);
    }
  }, []);

  const applySnapshot = useCallback((snapshot, message = "Design restored") => {
    if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot.elements)) {
      throw new Error("This file is not a valid design");
    }
    const nextElements = snapshot.elements
      .map(normalizeElement)
      .filter(element => element && (element.type !== "image" || element.src));
    const nextFormat = FORMATS[snapshot.format] ? snapshot.format : "Square Post";
    setFormat(nextFormat);
    setBackground(typeof snapshot.background === "string" ? snapshot.background : "#f5efff");
    setBackgroundType(snapshot.backgroundType === "gradient" ? "gradient" : "solid");
    setBackgroundSecond(typeof snapshot.backgroundSecond === "string" ? snapshot.backgroundSecond : "#ffffff");
    setBackgroundAngle(clamp(snapshot.backgroundAngle ?? 135, 0, 360));
    setBackgroundImage(typeof snapshot.backgroundImage === "string" ? snapshot.backgroundImage : null);
    setBackgroundImageFit(["cover", "contain", "auto"].includes(snapshot.backgroundImageFit) ? snapshot.backgroundImageFit : "cover");
    setBackgroundImagePosition(typeof snapshot.backgroundImagePosition === "string" ? snapshot.backgroundImagePosition : "center");
    setShowGuides(snapshot.showGuides !== false);
    setElements(nextElements);
    setSelectedId(null);
    setPanel(null);
    setHistory([]);
    setFuture([]);
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
    pendingRef.current = null;
    showStatus(message);
  }, [showStatus]);

  const exportJson = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(makeSnapshot(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `design-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showStatus("Design JSON exported");
      setFileOpen(false);
    } catch (error) {
      showStatus("Could not export design JSON");
      console.error("Design JSON export error:", error);
    }
  }, [makeSnapshot, showStatus]);

  const importJson = useCallback((event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (safeElements.length && !window.confirm("Importing will replace the current design. Continue?")) return;
        applySnapshot(JSON.parse(String(reader.result)), "Design JSON imported");
        setFileOpen(false);
      } catch (error) {
        showStatus(error?.message || "Could not import design JSON");
      }
    };
    reader.onerror = () => showStatus("Could not read design JSON");
    reader.readAsText(file);
  }, [applySnapshot, safeElements.length, showStatus]);

  /*
   * ---------------------------------------------------------
   * HISTORY
   * ---------------------------------------------------------
   *
   * Dragging/resizing creates many updates.
   * We group those updates into one history entry.
   */

  const tracked = useCallback((updater) => {
    setElements((previous) => {
      const safePrevious = Array.isArray(previous) ? previous : [];

      if (pendingRef.current === null) {
        pendingRef.current = safePrevious;
      }

      if (typeof updater === "function") {
        const next = updater(safePrevious);
        return Array.isArray(next) ? next : safePrevious;
      }

      return Array.isArray(updater) ? updater : safePrevious;
    });

    setFuture([]);

    window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      if (pendingRef.current !== null) {
        setHistory((previousHistory) => [
          ...(Array.isArray(previousHistory) ? previousHistory.slice(-59) : []),
          pendingRef.current,
        ]);

        pendingRef.current = null;
      }
    }, 300);
  }, []);

  /*
   * ---------------------------------------------------------
   * UPDATE ELEMENT
   * ---------------------------------------------------------
   */

  const update = useCallback(
    (id, changes) => {
      if (!id) return;

      tracked((previous) =>
        (Array.isArray(previous) ? previous : []).map((element) =>
          element.id === id
            ? {
                ...element,
                ...changes,
              }
            : element
        )
      );
    },
    [tracked]
  );

  /*
   * ---------------------------------------------------------
   * UNDO
   * ---------------------------------------------------------
   */

  const undo = useCallback(() => {
    window.clearTimeout(timerRef.current);

    setElements((current) => {
      const safeCurrent = Array.isArray(current) ? current : [];
      const base =
        pendingRef.current !== null
          ? pendingRef.current
          : Array.isArray(history) && Array.isArray(history[history.length - 1])
            ? history[history.length - 1]
            : null;

      if (!Array.isArray(base)) {
        return safeCurrent;
      }

      setFuture((previousFuture) => [
        ...(Array.isArray(previousFuture) ? previousFuture : []),
        safeCurrent,
      ]);

      if (pendingRef.current !== null) {
        pendingRef.current = null;
      } else {
        setHistory((previousHistory) =>
          (Array.isArray(previousHistory) ? previousHistory : []).slice(0, -1)
        );
      }

      return Array.isArray(base) ? base : safeCurrent;
    });
  }, [history]);

  /*
   * ---------------------------------------------------------
   * REDO
   * ---------------------------------------------------------
   */

  const redo = useCallback(() => {
    if (!Array.isArray(future) || !future.length) return;

    window.clearTimeout(timerRef.current);

    setElements((current) => {
      const next = future[future.length - 1];
      const safeCurrent = Array.isArray(current) ? current : [];

      if (!Array.isArray(next)) {
        return safeCurrent;
      }

      setHistory((previousHistory) => [
        ...(Array.isArray(previousHistory) ? previousHistory : []),
        safeCurrent,
      ]);

      setFuture((previousFuture) =>
        (Array.isArray(previousFuture) ? previousFuture : []).slice(0, -1)
      );

      return Array.isArray(next) ? next : safeCurrent;
    });
  }, [future]);

  /*
   * ---------------------------------------------------------
   * ADD TEXT
   * ---------------------------------------------------------
   */

  const addText = useCallback((extra = {}) => {
    const element = makeText(extra.text || "Add your text", extra);

    tracked((previous) => [
      ...(Array.isArray(previous) ? previous : []),
      element,
    ]);

    setSelectedId(element.id);
    setPanel("text");
  }, [tracked]);

  /*
   * ---------------------------------------------------------
   * ADD IMAGE
   * ---------------------------------------------------------
   */

  const addImage = useCallback(
    ({ src, name }) => {
      if (!src) return;

      const element = makeImage(src, name);

      tracked((previous) => [
        ...(Array.isArray(previous) ? previous : []),
        element,
      ]);

      setSelectedId(element.id);
      setPanel("image");
    },
    [tracked]
  );

  /*
   * ---------------------------------------------------------
   * ADD SHAPE
   * ---------------------------------------------------------
   */

  const addShape = useCallback(
    (shape) => {
      const element = makeShape(shape);

      tracked((previous) => [
        ...(Array.isArray(previous) ? previous : []),
        element,
      ]);

      setSelectedId(element.id);
      setPanel("shape");
    },
    [tracked]
  );

  /*
   * ---------------------------------------------------------
   * REMOVE ELEMENT
   * ---------------------------------------------------------
   */

  const remove = useCallback(
    (id) => {
      if (!id) return;

      tracked((previous) =>
        (Array.isArray(previous) ? previous : []).filter(
          (element) => element.id !== id
        )
      );

      setSelectedId((currentId) =>
        currentId === id ? null : currentId
      );

      setPanel((currentPanel) => {
        if (!currentPanel) return currentPanel;

        const stillExists = safeElements.some(
          (element) =>
            element.id !== id &&
            element.id === selectedId
        );

        return stillExists ? currentPanel : null;
      });
    },
    [tracked, safeElements, selectedId]
  );

  /*
   * ---------------------------------------------------------
   * DUPLICATE
   * ---------------------------------------------------------
   */

  const duplicate = useCallback(
    (id) => {
      if (!id) return;

      tracked((previous) => {
        const safePrevious = Array.isArray(previous) ? previous : [];
        const element = safePrevious.find(
          (item) => item.id === id
        );

        if (!element) return safePrevious;

        const width = n(element.width);
        const height = n(element.height);

        const clone = {
          ...element,

          id: uid(),

          x: clamp(
            n(element.x) + 4,
            0,
            100 - width
          ),

          y: clamp(
            n(element.y) + 4,
            0,
            100 - height
          ),

          name: `${
            element.name || element.type
          } copy`,
        };

        setSelectedId(clone.id);
        setPanel(clone.type);

        return [
          ...safePrevious,
          clone,
        ];
      });
    },
    [tracked]
  );

  /*
   * ---------------------------------------------------------
   * LAYER ORDER
   * ---------------------------------------------------------
   */

  /*
   * MOVE ONE STEP UP
   */

  const moveUp = useCallback(
    (id) => {
      tracked((previous) => {
        const safePrevious = Array.isArray(previous) ? previous : [];
        const index = safePrevious.findIndex(
          (item) => item.id === id
        );

        if (index === -1) return safePrevious;

        if (index === safePrevious.length - 1) {
          return safePrevious;
        }

        const next = [...safePrevious];

        [
          next[index],
          next[index + 1],
        ] = [
          next[index + 1],
          next[index],
        ];

        return next;
      });
    },
    [tracked]
  );

  /*
   * MOVE ONE STEP DOWN
   */

  const moveDown = useCallback(
    (id) => {
      tracked((previous) => {
        const safePrevious = Array.isArray(previous) ? previous : [];
        const index = safePrevious.findIndex(
          (item) => item.id === id
        );

        if (index === -1) return safePrevious;

        if (index === 0) {
          return safePrevious;
        }

        const next = [...safePrevious];

        [
          next[index],
          next[index - 1],
        ] = [
          next[index - 1],
          next[index],
        ];

        return next;
      });
    },
    [tracked]
  );

  const reorder = useCallback(
    (fromId, toId) => {
      tracked((previous) => {
        const visual = [...(Array.isArray(previous) ? previous : [])].reverse();
        const fromIndex = visual.findIndex((item) => item.id === fromId);
        const toIndex = visual.findIndex((item) => item.id === toId);

        if (fromIndex === -1 || toIndex === -1) return previous;

        const [moved] = visual.splice(fromIndex, 1);
        visual.splice(toIndex, 0, moved);
        return visual.reverse();
      });
    },
    [tracked]
  );

  /*
   * ---------------------------------------------------------
   * SELECT ELEMENT
   * ---------------------------------------------------------
   */

  const select = useCallback(
    (id) => {
      setSelectedId(id);

      if (!id) {
        setPanel(null);
        return;
      }

      const element = safeElements.find(
        (item) => item.id === id
      );

      if (element) {
        setPanel(element.type);
      }
    },
    [safeElements]
  );

  /*
   * ---------------------------------------------------------
   * TEMPLATE
   * ---------------------------------------------------------
   */

  const addTemplate = useCallback(
    (kind) => {
      const list = makeTemplate(kind);

      if (!list || !list.length) {
        return;
      }

      tracked(list);

      const first = list[0];

      setSelectedId(first.id);
      setPanel(first.type);
    },
    [tracked]
  );

  /*
   * ---------------------------------------------------------
   * CLEAR DESIGN
   * ---------------------------------------------------------
   */

  const clearDesign = useCallback(() => {
    if (!safeElements.length) return;

    const confirmed = window.confirm(
      "Clear the whole design?"
    );

    if (!confirmed) return;

    tracked([]);

    setSelectedId(null);
    setPanel(null);

    showStatus("Design cleared");
  }, [safeElements.length, tracked, showStatus]);

  /*
   * ---------------------------------------------------------
   * ALIGN CENTER
   * ---------------------------------------------------------
   */

  const alignCenter = useCallback(() => {
    if (!selected) return;

    update(selected.id, {
      x: clamp(
        (100 - n(selected.width)) / 2,
        0,
        100 - n(selected.width)
      ),
    });
  }, [selected, update]);

  /*
   * ---------------------------------------------------------
   * ALIGN MIDDLE
   * ---------------------------------------------------------
   */

  const alignMiddle = useCallback(() => {
    if (!selected) return;

    update(selected.id, {
      y: clamp(
        (100 - n(selected.height)) / 2,
        0,
        100 - n(selected.height)
      ),
    });
  }, [selected, update]);

  /*
   * ---------------------------------------------------------
   * RESET TRANSFORM
   * ---------------------------------------------------------
   */

  const reset = useCallback(() => {
    if (!selected) return;

    update(selected.id, {
      rotation: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
    });
  }, [selected, update]);

  /*
   * ---------------------------------------------------------
   * KEYBOARD SHORTCUTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const active = document.activeElement;

      const editing =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.isContentEditable;

      if (editing) return;

      const mod =
        event.ctrlKey || event.metaKey;

      /*
       * UNDO
       */

      if (
        mod &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }

        return;
      }

      /*
       * REDO
       */

      if (
        mod &&
        event.key.toLowerCase() === "y"
      ) {
        event.preventDefault();
        redo();
        return;
      }

      /*
       * DUPLICATE
       */

      if (
        mod &&
        event.key.toLowerCase() === "d" &&
        selectedId
      ) {
        event.preventDefault();
        duplicate(selectedId);
        return;
      }

      /*
       * DELETE
       */

      if (
        (event.key === "Delete" ||
          event.key === "Backspace") &&
        selectedId
      ) {
        event.preventDefault();
        remove(selectedId);
        return;
      }

      /*
       * ESCAPE
       */

      if (event.key === "Escape") {
        setSelectedId(null);
        setPreview(false);
        setPanel(null);
        setExportOpen(false);
        return;
      }

      /*
       * ZOOM IN
       */

      if (
        mod &&
        (event.key === "+" ||
          event.key === "=")
      ) {
        event.preventDefault();

        setZoom((value) =>
          clamp(value + 10, 25, 300)
        );

        return;
      }

      /*
       * ZOOM OUT
       */

      if (
        mod &&
        event.key === "-"
      ) {
        event.preventDefault();

        setZoom((value) =>
          clamp(value - 10, 25, 300)
        );

        return;
      }

      /*
       * ELEMENT MOVEMENT
       */

      if (selected) {
        const step = event.shiftKey
          ? 2
          : 0.5;

        if (event.key === "ArrowLeft") {
          event.preventDefault();

          update(selected.id, {
            x: clamp(
              n(selected.x) - step,
              0,
              100 - n(selected.width)
            ),
          });

          return;
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();

          update(selected.id, {
            x: clamp(
              n(selected.x) + step,
              0,
              100 - n(selected.width)
            ),
          });

          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();

          update(selected.id, {
            y: clamp(
              n(selected.y) - step,
              0,
              100 - n(selected.height)
            ),
          });

          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();

          update(selected.id, {
            y: clamp(
              n(selected.y) + step,
              0,
              100 - n(selected.height)
            ),
          });

          return;
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    redo,
    undo,
    duplicate,
    remove,
    selectedId,
    selected,
    update,
  ]);

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current);
      window.clearTimeout(showStatus.timer);
    };
  }, [showStatus]);

  /*
   * ---------------------------------------------------------
   * PANEL BODY
   * ---------------------------------------------------------
   */

  const body = () => {
    const actions = selected ? (
      <ElementActions
        id={selected.id}
        duplicate={duplicate}
        remove={remove}
        moveUp={moveUp}
        moveDown={moveDown}
      />
    ) : null;

    /*
     * TEMPLATES
     */

    if (panel === "templates") {
      return (
        <div className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
          <p className="section-title">
            Starter Templates
          </p>

          <Templates
            addTemplate={addTemplate}
          />

          <Button
            onClick={clearDesign}
          >
            <Trash2 size={13} />
            Clear design
          </Button>
        </div>
      );
    }

    /*
     * TEXT
     */

    if (panel === "text") {
      return (
        <TextTool
          el={
            selected?.type === "text"
              ? selected
              : null
          }
          update={(changes) => {
            if (selected) {
              update(
                selected.id,
                changes
              );
            }
          }}
          addText={addText}
          actions={actions}
        />
      );
    }

    /*
     * IMAGE
     */

    if (panel === "image") {
      return (
        <ImageTool
          el={
            selected?.type === "image"
              ? selected
              : null
          }
          update={(changes) => {
            if (selected) {
              update(
                selected.id,
                changes
              );
            }
          }}
          addImage={addImage}
          actions={actions}
        />
      );
    }

    /*
     * SHAPE
     */

    if (panel === "shape") {
      return (
        <ShapeTool
          el={
            selected?.type === "shape"
              ? selected
              : null
          }
          addShape={addShape}
          update={(changes) => {
            if (selected) {
              update(
                selected.id,
                changes
              );
            }
          }}
          actions={actions}
        />
      );
    }

    /*
     * BACKGROUND
     */

    if (panel === "background") {
      return (
        <BackgroundTool
          background={background}
          type={backgroundType}
          second={backgroundSecond}
          angle={backgroundAngle}
          image={backgroundImage}
          imageFit={backgroundImageFit}
          imagePosition={backgroundImagePosition}
          setBackground={setBackground}
          setType={setBackgroundType}
          setSecond={setBackgroundSecond}
          setAngle={setBackgroundAngle}
          setImage={setBackgroundImage}
          setImageFit={setBackgroundImageFit}
          setImagePosition={setBackgroundImagePosition}
          />
      );
    }

    /*
     * TRANSFORM
     */

    if (panel === "transform") {
      return (
        <TransformTool
          el={selected}
          update={(changes) => {
            if (selected) {
              update(
                selected.id,
                changes
              );
            }
          }}
          alignCenter={alignCenter}
          alignMiddle={alignMiddle}
          reset={reset}
        />
      );
    }

    /*
     * LAYERS
     */

    if (panel === "layers") {
      return (
        <LayersPanel
          elements={safeElements}
          selectedId={selectedId}
          select={select}
          update={update}
          remove={remove}
          duplicate={duplicate}
          moveUp={moveUp}
          moveDown={moveDown}
          reorder={reorder}
        />
      );
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * HISTORY STATE
   * ---------------------------------------------------------
   */

  const canUndo =
    history.length > 0 ||
    pendingRef.current !== null;

  const canRedo =
    future.length > 0;

  /*
   * ---------------------------------------------------------
   * PANEL TITLE
   * ---------------------------------------------------------
   */

  const panelTitle =
    TITLES?.[panel] || "Design Tools";

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-stone-100 text-stone-900"
      style={{
        fontFamily:
          "Inter, system-ui, sans-serif",
      }}
    >
      <style>{`
        .section-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .12em;
          color: #78716c;
        }

        .studio-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .studio-scroll::-webkit-scrollbar-thumb {
          background: #d6d3d1;
          border-radius: 999px;
        }

        .studio-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {/* LOGO */}

          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-stone-900 text-xs font-black text-white">
            D
          </div>

          {/* FORMAT */}

          <select
            value={format}
            onChange={(event) =>
              setFormat(event.target.value)
            }
            className="max-w-[180px] rounded-lg border border-stone-200 bg-white px-2 py-2 text-[11px] font-bold outline-none"
          >
            {Object.keys(FORMATS).map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          {/* QUICK START */}

          <button
            type="button"
            onClick={() =>
              addTemplate("Minimal")
            }
            className="hidden items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-2 text-[10px] font-bold sm:flex"
          >
            <SparkleIcon size={13} />
            Quick Start
          </button>
        </div>

        {/* HEADER ACTIONS */}

        <div className="flex shrink-0 items-center gap-1">
          {/* UNDO */}

          <button
            type="button"
            title="Undo"
            disabled={!canUndo}
            onClick={undo}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-stone-100 disabled:opacity-25"
          >
            <Undo2 size={16} />
          </button>

          {/* REDO */}

          <button
            type="button"
            title="Redo"
            disabled={!canRedo}
            onClick={redo}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-stone-100 disabled:opacity-25"
          >
            <Redo2 size={16} />
          </button>

          {/* GRID */}

          <button
            type="button"
            title="Grid"
            onClick={() =>
              setShowGrid(
                (value) => !value
              )
            }
            className={`hidden h-9 w-9 place-items-center rounded-lg sm:grid ${
              showGrid
                ? "bg-stone-100 text-stone-900"
                : "text-stone-400"
            }`}
          >
            <Grid3X3 size={16} />
          </button>

          <button
            type="button"
            title="Alignment guides"
            onClick={() => setShowGuides(value => !value)}
            className={`hidden h-9 w-9 place-items-center rounded-lg sm:grid ${
              showGuides ? "bg-stone-100 text-sky-600" : "text-stone-400"
            }`}
          >
            <Move size={16} />
          </button>

          {/* PREVIEW */}

          <button
            type="button"
            title="Preview"
            onClick={() =>
              setPreview(
                (value) => !value
              )
            }
            className="hidden items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-[10px] font-bold sm:flex"
          >
            <MousePointer2 size={13} />

            {preview
              ? "Edit"
              : "Preview"}
          </button>

          {/* DOWNLOAD */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setExportOpen(
                  (value) => !value
                )
              }
              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-[10px] font-bold text-white"
            >
              <Download size={14} />
              Download
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full z-[500] mt-1 w-48 rounded-xl border border-stone-200 bg-white p-1 shadow-2xl">
                <StudioExport
                  canvasRef={canvasRef}
                  format={format}
                  background={background}
                  onDone={(message) => {
                    showStatus(message);
                    setExportOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              title="Design file"
              onClick={saveAndOpenLibrary}
              className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
            >
              <Save size={15} />
            </button>
            {fileOpen && (
              <div className="absolute right-0 top-full z-[500] mt-1 w-44 rounded-xl border border-stone-200 bg-white p-1 shadow-2xl">
                <button type="button" onClick={exportJson} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-semibold hover:bg-stone-100">
                  <Download size={14} /> Export design JSON
                </button>
                <button type="button" onClick={() => importRef.current?.click()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[11px] font-semibold hover:bg-stone-100">
                  <Upload size={14} /> Import design JSON
                </button>
              </div>
            )}
            <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={importJson} />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN STUDIO
      ===================================================== */}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* ===================================================
            DESKTOP TOOLBAR
        =================================================== */}

        <nav className="hidden w-[76px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-stone-200 bg-white py-3 md:flex">
          {TOOLS.map(
            ([id, label, Icon]) => (
              <button
                type="button"
                key={id}
                onClick={() =>
                  setPanel(
                    (current) =>
                      current === id
                        ? null
                        : id
                  )
                }
                className={`flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[9px] font-bold transition ${
                  panel === id
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          )}
        </nav>

        {/* ===================================================
            DESKTOP SIDE PANEL
        =================================================== */}

        {panel && (
          <aside className="studio-scroll hidden w-80 shrink-0 overflow-y-auto border-r border-stone-200 bg-stone-50 p-3 md:block">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {panelTitle}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setPanel(null)
                }
                className="grid h-7 w-7 place-items-center rounded-lg hover:bg-stone-200"
              >
                <X size={14} />
              </button>
            </div>

            {body()}
          </aside>
        )}

        {/* ===================================================
            CANVAS AREA
        =================================================== */}

        <main
          className="relative min-w-0 flex-1 overflow-auto studio-scroll"
          onPointerDown={() => {
            setExportOpen(false);
            setFileOpen(false);
          }}
        >
          <div className="flex min-h-full min-w-full items-center justify-center p-5 sm:p-10">
            <div
              className="relative w-[calc(100vw-24px)] max-w-[760px] transition-transform duration-150 md:w-[min(76vw,760px)]"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin:
                  "center center",
              }}
            >
              <div className="overflow-visible rounded-xl bg-white shadow-2xl">
                <DesignCanvas
                  format={format}
                  background={background}
                  backgroundType={
                    backgroundType
                  }
                  backgroundSecond={
                    backgroundSecond
                  }
                  backgroundAngle={
                    backgroundAngle
                  }
                  backgroundImage={backgroundImage}
                  backgroundImageFit={backgroundImageFit}
                  backgroundImagePosition={backgroundImagePosition}
                  elements={safeElements}
                  selectedId={selectedId}
                  onSelect={select}
                  onUpdate={update}
                  onEditText={(id, text, html) =>
                    update(id, { text, html })
                  }
                  preview={preview}
                  showGrid={showGrid}
                  guideLines={showGuides}
                  snapGrid={snapGrid}
                  setSnapGrid={setSnapGrid}
                  canvasRefExternal={
                    canvasRef
                  }
                />
              </div>
            </div>
          </div>

          {/* =================================================
              ZOOM CONTROLS
          ================================================= */}

          {!preview && (
            <div className="fixed bottom-20 right-4 z-[250] flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl md:bottom-5">
              {/* ZOOM OUT */}

              <button
                type="button"
                title="Zoom out"
                onClick={() =>
                  setZoom(
                    (value) =>
                      clamp(
                        value - 10,
                        25,
                        300
                      )
                  )
                }
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-stone-100"
              >
                <ZoomOut size={15} />
              </button>

              {/* CURRENT ZOOM */}

              <button
                type="button"
                title="Reset zoom"
                onClick={() =>
                  setZoom(100)
                }
                className="min-w-12 rounded-lg px-2 text-[10px] font-black hover:bg-stone-100"
              >
                {zoom}%
              </button>

              {/* ZOOM IN */}

              <button
                type="button"
                title="Zoom in"
                onClick={() =>
                  setZoom(
                    (value) =>
                      clamp(
                        value + 10,
                        25,
                        300
                      )
                  )
                }
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-stone-100"
              >
                <ZoomIn size={15} />
              </button>

              {/* FIT */}

              <button
                type="button"
                title="Fit / 100%"
                onClick={() =>
                  setZoom(100)
                }
                className="hidden h-8 w-8 place-items-center rounded-lg hover:bg-stone-100 sm:grid"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          )}

          {/* =================================================
              STATUS MESSAGE
          ================================================= */}

          {status && (
            <div className="fixed bottom-20 left-1/2 z-[600] -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-[11px] font-bold text-white shadow-xl md:bottom-5">
              {status}
            </div>
          )}
        </main>

        {/* ===================================================
            MOBILE OVERLAY
        =================================================== */}

        {panel && (
          <div
            className="fixed inset-0 z-[300] bg-black/30 md:hidden"
            onClick={() =>
              setPanel(null)
            }
          />
        )}

        {/* ===================================================
            MOBILE BOTTOM PANEL
            (height capped to 55dvh so canvas stays visible)
        =================================================== */}

        {panel && (
          <div
            className="studio-scroll fixed inset-x-0 bottom-16 z-[400] flex max-h-[55dvh] min-h-0 flex-col overflow-hidden rounded-t-2xl bg-white p-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl md:hidden"
            onPointerDown={event => event.stopPropagation()}
          >
            <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-stone-200" />

            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {panelTitle}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setPanel(null)
                }
                className="grid h-7 w-7 place-items-center rounded-lg hover:bg-stone-100"
              >
                <X size={14} />
              </button>
            </div>

            <div className="studio-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
              {body()}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          MOBILE TOOLBAR
      ===================================================== */}

      <nav className="grid h-16 shrink-0 grid-cols-7 border-t border-stone-200 bg-white md:hidden">
        {TOOLS.map(
          ([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() =>
                setPanel(
                  (current) =>
                    current === id
                      ? null
                      : id
                )
              }
              className={`flex flex-col items-center justify-center gap-0.5 text-[8px] font-bold transition ${
                panel === id
                  ? "text-stone-900"
                  : "text-stone-400"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        )}
      </nav>
      {savedOpen && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/40 p-4" onPointerDown={() => setSavedOpen(false)}>
          <section className="flex max-h-[85vh] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ position: "relative", zIndex: 1 }} onPointerDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <div>
                <h2 className="text-base font-black">Saved posts</h2>
                <p className="text-[10px] text-stone-400">Open, edit or manage your saved designs</p>
              </div>
              <button type="button" onClick={() => setSavedOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-stone-100"><X size={16}/></button>
            </div>

            <div className="flex gap-2 border-b border-stone-100 p-3">
              <input value={saveName} onChange={event => setSaveName(event.target.value)} placeholder="Post name (e.g. Diwali Offer)"
                className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 px-3 text-xs outline-none focus:border-stone-900" />
              <Button onClick={saveCurrentDesign}><Save size={14}/>Save current</Button>
            </div>

            <div className="studio-scroll min-h-0 flex-1 grid gap-3 overflow-y-auto p-4 sm:grid-cols-2"
              style={{ minHeight: 0, maxHeight: "calc(85vh - 150px)", overflowY: "auto", overscrollBehavior: "contain" }}>
              {!savedDesigns.length && <p className="col-span-full py-10 text-center text-xs text-stone-400">No saved posts yet.</p>}
              {savedDesigns.map(snapshot => (
                <article key={snapshot.id} className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                  <div className="relative aspect-video overflow-hidden bg-stone-200">
                    <div className="absolute inset-0" style={{
                      background: snapshot.backgroundType === "gradient"
                        ? `linear-gradient(${n(snapshot.backgroundAngle, 135)}deg, ${snapshot.background}, ${snapshot.backgroundSecond})`
                        : snapshot.background,
                    }} />
                    {snapshot.elements?.filter(element => element.visible !== false).map(element => {
                      const style = {
                        position: "absolute",
                        left: `${n(element.x)}%`,
                        top: `${n(element.y)}%`,
                        width: `${n(element.width)}%`,
                        height: `${n(element.height)}%`,
                        opacity: element.opacity ?? 1,
                        transform: `rotate(${n(element.rotation)}deg)`,
                        overflow: "hidden",
                        zIndex: snapshot.elements.indexOf(element) + 1,
                      };
                      if (element.type === "image") {
                        return <img key={element.id} src={element.src} alt="" style={{ ...style, objectFit: element.objectFit || "cover", objectPosition: element.objectPosition || "center" }} />;
                      }
                      if (element.type === "text") {
                        return <div key={element.id} style={{ ...style, display: "flex", alignItems: "center", justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center", color: element.color || "#171717", fontSize: `${Math.max(4, n(element.fontSize, 44) * .18)}px`, fontWeight: n(element.fontWeight, 700), textAlign: element.textAlign || "center", whiteSpace: "pre-wrap", lineHeight: n(element.lineHeight, 1.1), background: element.highlight ? element.highlightColor || "#fde68a" : element.backgroundColor === "transparent" ? "transparent" : element.backgroundColor }}>{element.text}</div>;
                      }
                      return <div key={element.id} style={{ ...style, background: element.image ? `url(${element.image}) center/cover` : shapeBackground(element), borderRadius: element.shape === "circle" ? "50%" : `${n(element.radius) * .18}px` }} />;
                    })}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="truncate text-xs font-bold">{snapshot.name || "Untitled post"}</p>
                    <p className="mt-1 text-[10px] text-stone-400">{new Date(snapshot.savedAt).toLocaleString()}</p>
                    <div className="mt-auto pt-3" style={{ display: "flex", flexWrap: "wrap", gap: "6px", width: "100%", position: "sticky", bottom: 0, background: "#fafaf9" }}>
                      <button type="button" onClick={() => { applySnapshot(snapshot, "Saved post opened"); setSavedOpen(false); }}
                        className="flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-stone-900 bg-stone-900 px-2 text-[10px] font-bold text-white hover:bg-stone-700" style={{ minWidth: "86px" }}>
                        <MousePointer2 size={12}/>Edit
                      </button>
                      <button type="button" onClick={() => downloadSavedDesign(snapshot)}
                        className="flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-2 text-[10px] font-bold text-stone-700 hover:bg-stone-100" style={{ minWidth: "86px" }}>
                        <Download size={12}/>Download
                      </button>
                      <button type="button" onClick={() => deleteSavedDesign(snapshot.id)}
                        className="flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2 text-[10px] font-bold text-red-500 hover:bg-red-50" style={{ minWidth: "86px" }}>
                        <Trash2 size={12}/>Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}