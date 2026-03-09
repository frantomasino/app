export interface ImportedProductRow {
  code: string | null
  name: string
  unit: string | null
  price_1: number
  price_2: number
  price_3: number
}

const HEADER_ALIASES: Record<string, keyof ImportedProductRow | null> = {
  codigo: "code",
  code: "code",
  sku: "code",

  nombre: "name",
  producto: "name",
  descripcion: "name",
  descripción: "name",

  unidad: "unit",
  unit: "unit",

  precio: "price_1",
  precio_1: "price_1",
  precio1: "price_1",
  lista_1: "price_1",
  lista1: "price_1",

  precio_2: "price_2",
  precio2: "price_2",
  lista_2: "price_2",
  lista2: "price_2",

  precio_3: "price_3",
  precio3: "price_3",
  lista_3: "price_3",
  lista3: "price_3",
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

export function normalizeImportedRows(rows: Record<string, unknown>[]) {
  const normalized: ImportedProductRow[] = []
  const errors: string[] = []

  rows.forEach((row, index) => {
    const mapped: Partial<ImportedProductRow> = {}

    Object.entries(row).forEach(([rawHeader, rawValue]) => {
      const alias = HEADER_ALIASES[normalizeHeader(rawHeader)]
      if (!alias) return

      if (alias === "code" || alias === "name" || alias === "unit") {
        const stringValue = String(rawValue ?? "").trim()

        if (alias === "name") {
          mapped.name = stringValue
        } else if (alias === "code") {
          mapped.code = stringValue || null
        } else {
          mapped.unit = stringValue || null
        }

        return
      }

      mapped[alias] = parseNumber(rawValue)
    })

    if (!mapped.name) {
      errors.push(`Fila ${index + 2}: falta el nombre del producto.`)
      return
    }

    const price1 = mapped.price_1 ?? 0
    const price2 = mapped.price_2 ?? price1
    const price3 = mapped.price_3 ?? price1

    normalized.push({
      code: mapped.code ?? null,
      name: mapped.name,
      unit: mapped.unit ?? null,
      price_1: price1,
      price_2: price2,
      price_3: price3,
    })
  })

  return { normalized, errors }
}

export const PRODUCT_TEMPLATE_ROWS: ImportedProductRow[] = [
  {
    code: "001",
    name: "Producto de ejemplo 1",
    unit: "unidad",
    price_1: 1000,
    price_2: 950,
    price_3: 900,
  },
  {
    code: "002",
    name: "Producto de ejemplo 2",
    unit: "kg",
    price_1: 2500,
    price_2: 2300,
    price_3: 2200,
  },
]