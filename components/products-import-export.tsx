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
import { Download, FileSpreadsheet, Upload, FileDown, AlertCircle, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductsImportExportProps {
  userId: string
  products: Product[]
  showEmptyStateTrigger?: boolean
}

const EXPORT_HEADERS = ["codigo", "nombre", "precio", "stock"]

function formatRows(products: Product[]) {
  return products.map((product) => ({
    codigo: product.code || "",
    nombre: product.name,
    precio: Number(product.price),
    stock: Number(product.stock),
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

export function ProductsImportExport({
  userId,
  products,
  showEmptyStateTrigger = false,
}: ProductsImportExportProps) {
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
        precio: row.price,
        stock: row.stock,
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
        price: row.price,
        stock: row.stock,
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Importar y exportar catálogo</CardTitle>
            <CardDescription>
              Podés cargar tu lista desde CSV o Excel. En esta versión, al importar se reemplaza el catálogo actual de tu empresa.
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon" disabled={loading}>
                {loading ? <Spinner className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => inputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Importar registros
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleExportCsv} disabled={products.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleExportExcel} disabled={products.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleTemplateDownload}>
                <Download className="mr-2 h-4 w-4" />
                Descargar plantilla
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
          Formatos aceptados:
          <br />
          <strong>codigo, nombre, precio, stock</strong>
        </div>

        {showEmptyStateTrigger && products.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              {loading ? <Spinner className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Todavía no cargaste productos</p>
              <p className="text-sm text-muted-foreground">
                Tocá acá para importar un archivo CSV o Excel.
              </p>
            </div>
          </button>
        ) : null}

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