"use client"

import { useRef, useState } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/client"
import { Product } from "@/lib/types"
import { PRODUCT_TEMPLATE_ROWS, normalizeImportedRows } from "@/lib/product-import"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Download, FileSpreadsheet, Upload, FileDown, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProductsImportExportProps {
  userId: string
  products: Product[]
}

const EXPORT_HEADERS = ["codigo", "nombre", "unidad", "precio_1", "precio_2", "precio_3"]

function formatRows(products: Product[]) {
  return products.map((product) => ({
    codigo: product.code || "",
    nombre: product.name,
    unidad: product.unit || "",
    precio_1: Number(product.price_1),
    precio_2: Number(product.price_2),
    precio_3: Number(product.price_3),
  }))
}

function downloadWorkbook(
  rows: Record<string, string | number>[],
  fileName: string,
  bookType: XLSX.BookType,
) {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: EXPORT_HEADERS })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos")
  XLSX.writeFile(workbook, fileName, { bookType })
}

function parseCsvText(text: string): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message))
          return
        }

        resolve(results.data)
      },
    })
  })
}

function parseTsvText(text: string) {
  const cleaned = text.replace(/^\uFEFF/, "").trim()
  if (!cleaned) return []

  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  const headers = lines[0].split("\t").map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = line.split("\t").map((value) => value.trim())
    const row: Record<string, unknown> = {}

    headers.forEach((header, index) => {
      row[header] = values[index] ?? ""
    })

    return row
  })
}

export function ProductsImportExport({ userId, products }: ProductsImportExportProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleTemplateDownload = () => {
    downloadWorkbook(
      PRODUCT_TEMPLATE_ROWS.map((row) => ({
        codigo: row.code || "",
        nombre: row.name,
        unidad: row.unit || "",
        precio_1: row.price_1,
        precio_2: row.price_2,
        precio_3: row.price_3,
      })),
      "plantilla-productos.xlsx",
      "xlsx",
    )
  }

  const handleExportCsv = () => {
    downloadWorkbook(formatRows(products), "productos.csv", "csv")
  }

  const handleExportExcel = () => {
    downloadWorkbook(formatRows(products), "productos.xlsx", "xlsx")
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      let rawRows: Record<string, unknown>[] = []
      const fileName = file.name.toLowerCase()

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: "array" })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

        rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
          defval: "",
        })
      } else {
        const text = await file.text()

        if (text.includes("\t")) {
          rawRows = parseTsvText(text)
        } else {
          rawRows = await parseCsvText(text)
        }
      }

      const { normalized, errors } = normalizeImportedRows(rawRows)

      if (errors.length > 0) {
        setError(errors.slice(0, 5).join(" "))
        return
      }

      if (normalized.length === 0) {
        setError("El archivo no tiene filas válidas para importar.")
        return
      }

      const supabase = createClient()

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("company_id", userId)

      if (deleteError) {
        throw deleteError
      }

      const rowsToInsert = normalized.map((row) => ({
        company_id: userId,
        code: row.code,
        name: row.name,
        unit: row.unit,
        price_1: row.price_1,
        price_2: row.price_2,
        price_3: row.price_3,
      }))

      const { error: insertError } = await supabase.from("products").insert(rowsToInsert)

      if (insertError) {
        throw insertError
      }

      setMessage(`Se importaron ${rowsToInsert.length} productos correctamente.`)
      router.refresh()
    } catch (err: unknown) {
      let errorMessage = "No se pudo importar el archivo."

      if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        errorMessage = err.message
      }

      console.error("Error al importar productos:", err)
      setError(errorMessage)
    } finally {
      setLoading(false)

      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar y exportar catálogo</CardTitle>
        <CardDescription>
          Podés cargar tu lista desde CSV o Excel. En esta versión, al importar se reemplaza el catálogo actual de tu empresa.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => inputRef.current?.click()} disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
            Importar CSV / Excel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            disabled={products.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            disabled={products.length === 0}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>

          <Button type="button" variant="secondary" onClick={handleTemplateDownload}>
            <Download className="mr-2 h-4 w-4" />
            Descargar plantilla
          </Button>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
          Formatos aceptados:
          <br />
          <strong>codigo, nombre, unidad, precio_1, precio_2, precio_3</strong>
          <br />
          o también:
          <br />
          <strong>descripcion, precio</strong>
        </div>

        {message ? (
          <Alert>
            <AlertTitle>Importación completada</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No se pudo importar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}