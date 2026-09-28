import { createElement } from "react";

const variants = {
  primary:
    "bg-[#2E9E6D] text-white hover:bg-[#227955] dark:bg-[#2E9E6D] dark:hover:bg-[#4AAE85]",

  dark: "bg-[#0C2C50] text-white hover:bg-[#2E9E6D] dark:bg-[#123A60] dark:hover:bg-[#2E9E6D]",

  outline:
    "border border-slate-200 bg-white text-slate-600 hover:border-[#2E9E6D] hover:text-[#2E9E6D] " +
    "dark:border-white/15 dark:bg-white/[0.04] dark:text-white/75 dark:hover:border-[#4AAE85] dark:hover:text-[#4AAE85]",

  unstyled: "",
};

export default function Button({
  as = "button",
  variant = "unstyled",
  className = "",
  children,
  ...props
}) {
  return createElement(
    as,
    {
      ...(as === "button" && !props.type ? { type: "button" } : {}),
      className: `
        inline-flex
        items-center
        justify-center
        transition-all
        duration-300
        ${variants[variant] || variants.unstyled}
        ${className}
      `,
      ...props,
    },
    children,
  );
}
