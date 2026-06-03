export function formatMoney(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pence / 100);
}

export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
}
