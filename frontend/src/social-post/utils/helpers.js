export const formatNumber = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
export const truncate = (value, length = 40) =>
  value.length > length ? `${value.slice(0, length - 1)}…` : value;
