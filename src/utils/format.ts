export function formatCurrency(value?: number) {
  if (!value) return "";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function pickDailyIndex(length: number, date = new Date()) {
  if (length <= 0) return 0;
  const seed = Number(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`);
  return seed % length;
}
