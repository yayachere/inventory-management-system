export function formatNumberWithCommas(value: number | string): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  if (isNaN(num)) {
    return String(value) // Return original value if not a valid number
  }
  return new Intl.NumberFormat("en-US").format(num)
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  if (isNaN(num)) {
    return String(value) // Return original value if not a valid number
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
