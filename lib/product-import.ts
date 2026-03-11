export interface ImportedProductRow {
  code: string | null
  name: string
  price: number
  stock: number
}

const HEADER_ALIASES: Record<string, keyof ImportedProductRow | null> = {
  codigo: "code",
  code: "code",
  sku: "code",

  nombre: "name",
  producto: "name",
  descripcion: "name",
  descripción: "name",

  precio: "price",
  price: "price",

  stock: "stock",
}

const normalizeHeader = (value: string) =>
  value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return value
  if (typeof value !== "string") return 0

  const cleaned = value
    .trim()
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "")

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const isEmptyRow = (row: Record<string, unknown>) => {
  return Object.values(row).every((value) => String(value ?? "").trim() === "")
}

export function normalizeImportedRows(rows: Record<string, unknown>[]) {
  const normalized: ImportedProductRow[] = []
  const errors: string[] = []

  rows.forEach((row, index) => {
    if (isEmptyRow(row)) {
      return
    }

    const mapped: Partial<ImportedProductRow> = {}

    Object.entries(row).forEach(([rawHeader, rawValue]) => {
      const alias = HEADER_ALIASES[normalizeHeader(rawHeader)]
      if (!alias) return

      if (alias === "code" || alias === "name") {
        const stringValue = String(rawValue ?? "").trim()

        if (alias === "name") {
          mapped.name = stringValue
        } else {
          mapped.code = stringValue || null
        }

        return
      }

      mapped[alias] = parseNumber(rawValue)
    })

    if (!mapped.name) {
      errors.push(`Fila ${index + 2}: falta el nombre del producto.`)
      return
    }

    normalized.push({
      code: mapped.code ?? null,
      name: mapped.name,
      price: mapped.price ?? 0,
      stock: mapped.stock ?? 0,
    })
  })

  return { normalized, errors }
}

export const PRODUCT_TEMPLATE_ROWS: ImportedProductRow[] = [
  {
    code: "001",
    name: "Suprema",
    price: 8500,
    stock: 20,
  },
  {
    code: "002",
    name: "Pechuga con hueso",
    price: 7200,
    stock: 15,
  },
]