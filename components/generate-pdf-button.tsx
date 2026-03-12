"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { FileDown } from "lucide-react"
import { RemitoWithItems, Company } from "@/lib/types"

interface GeneratePdfButtonProps {
  remito: RemitoWithItems
  company: Company
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDateOnly(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString("es-AR")
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("No se pudo cargar el logo")
  }

  const blob = await response.blob()

  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function GeneratePdfButton({ remito, company }: GeneratePdfButtonProps) {
  const [loading, setLoading] = useState(false)

  const generatePdf = async () => {
    setLoading(true)

    try {
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let y = margin

      const addText = (
        text: string,
        x: number,
        currentY: number,
        options?: {
          fontSize?: number
          fontStyle?: "normal" | "bold"
          maxWidth?: number
          align?: "left" | "center" | "right"
        },
      ) => {
        doc.setFontSize(options?.fontSize || 10)
        doc.setFont("helvetica", options?.fontStyle || "normal")

        if (options?.maxWidth) {
          const lines = doc.splitTextToSize(text, options.maxWidth)
          doc.text(lines, x, currentY, { align: options?.align || "left" })
          return currentY + lines.length * ((options?.fontSize || 10) * 0.45)
        }

        doc.text(text, x, currentY, { align: options?.align || "left" })
        return currentY + (options?.fontSize || 10) * 0.45
      }

      let headerTopY = margin
      let companyTextStartX = margin

      if (company.logo_url) {
        try {
          const logoDataUrl = await imageUrlToDataUrl(company.logo_url)
          const logoWidth = 36
          const logoHeight = 22
          const format = logoDataUrl.includes("image/png") ? "PNG" : "JPEG"

          doc.addImage(
            logoDataUrl,
            format,
            margin,
            headerTopY - 2,
            logoWidth,
            logoHeight,
          )

          companyTextStartX = margin + logoWidth + 8
        } catch (logoError) {
          console.error("No se pudo cargar el logo para el PDF:", logoError)
        }
      }

      let companyInfoY = headerTopY + 2

      companyInfoY = addText(company.name || "Mi Empresa", companyTextStartX, companyInfoY, {
        fontSize: 16,
        fontStyle: "bold",
        maxWidth: 90,
      })

      if (company.cuit) {
        companyInfoY = addText(`CUIT: ${company.cuit}`, companyTextStartX, companyInfoY)
      }

      if (company.address) {
        companyInfoY = addText(company.address, companyTextStartX, companyInfoY, {
          maxWidth: 90,
        })
      }

      if (company.phone) {
        companyInfoY = addText(`Tel: ${company.phone}`, companyTextStartX, companyInfoY)
      }

      if (company.email) {
        companyInfoY = addText(company.email, companyTextStartX, companyInfoY, {
          maxWidth: 90,
        })
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)
      doc.text(`VENTA #${remito.number}`, pageWidth - margin, margin + 4, {
        align: "right",
      })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(
        `Fecha: ${formatDateOnly(remito.date)}`,
        pageWidth - margin,
        margin + 12,
        { align: "right" },
      )

      y = Math.max(companyInfoY, margin + 24)
      y += 8

      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 10

      y = addText("CLIENTE", margin, y, {
        fontSize: 12,
        fontStyle: "bold",
      })
      y += 2

      y = addText(remito.client_name, margin, y, {
        fontSize: 11,
        fontStyle: "bold",
        maxWidth: pageWidth - margin * 2,
      })

      if (remito.client_cuit) {
        y = addText(`CUIT: ${remito.client_cuit}`, margin, y)
      }

      if (remito.client_address) {
        y = addText(remito.client_address, margin, y, {
          maxWidth: pageWidth - margin * 2,
        })
      }

      y += 10

      const colWidths = {
        description: 80,
        quantity: 25,
        unitPrice: 35,
        subtotal: 35,
      }

      const tableStartX = margin

      doc.setFillColor(240, 240, 240)
      doc.rect(tableStartX, y - 4, pageWidth - margin * 2, 10, "F")

      let x = tableStartX
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)

      doc.text("Descripción", x + 2, y + 2)
      x += colWidths.description
      doc.text("Cant.", x, y + 2, { align: "center" })
      x += colWidths.quantity
      doc.text("Precio unit.", x, y + 2, { align: "right" })
      x += colWidths.unitPrice
      doc.text("Subtotal", x + colWidths.subtotal - 2, y + 2, { align: "right" })

      y += 12

      doc.setFont("helvetica", "normal")

      remito.items.forEach((item) => {
        const descLines = doc.splitTextToSize(item.description, colWidths.description - 4)
        const rowHeight = Math.max(descLines.length * 5, 7)

        if (y + rowHeight > pageHeight - 40) {
          doc.addPage()
          y = margin
        }

        x = tableStartX

        doc.text(descLines, x + 2, y)
        x += colWidths.description

        doc.text(String(item.quantity), x, y, { align: "center" })
        x += colWidths.quantity

        doc.text(
          `$${Number(item.unit_price).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`,
          x,
          y,
          { align: "right" },
        )

        x += colWidths.unitPrice

        doc.text(
          `$${Number(item.subtotal).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}`,
          x + colWidths.subtotal - 2,
          y,
          { align: "right" },
        )

        y += rowHeight
      })

      y += 5
      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 8

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TOTAL", pageWidth - margin - 60, y)
      doc.text(
        `$${Number(remito.total).toLocaleString("es-AR", {
          minimumFractionDigits: 2,
        })}`,
        pageWidth - margin,
        y,
        { align: "right" },
      )

      const footerY = pageHeight - 20
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(128)
      doc.text("Documento generado con Scarlo", pageWidth / 2, footerY, {
        align: "center",
      })

      doc.save(`venta-${remito.number}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={generatePdf} disabled={loading} size="sm" className="rounded-md">
      {loading ? <Spinner className="mr-2" /> : <FileDown className="mr-2 h-4 w-4" />}
      Descargar PDF
    </Button>
  )
}