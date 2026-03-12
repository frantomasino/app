"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintRemitoButtonProps {
  targetId: string
  fileName?: string
}

export function PrintRemitoButton({
  targetId,
  fileName = "venta",
}: PrintRemitoButtonProps) {
  const handlePrint = () => {
    const element = document.getElementById(targetId)

    if (!element) {
      console.error("No se encontró el área a imprimir")
      return
    }

    const printWindow = window.open("", "_blank", "width=900,height=700")

    if (!printWindow) {
      console.error("No se pudo abrir la ventana de impresión")
      return
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${fileName}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 24px;
              color: #111;
              background: #fff;
            }

            h1, h2, h3, h4, p {
              margin: 0;
            }

            .print-root {
              width: 100%;
            }

            .print-card {
              border: 1px solid #ddd;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 16px;
            }

            .print-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }

            .print-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
            }

            .print-company {
              display: flex;
              align-items: flex-start;
              gap: 16px;
            }

            .print-company img {
              max-width: 80px;
              max-height: 80px;
              object-fit: contain;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 6px;
              background: #fff;
            }

            .print-remito-box {
              border: 1px solid #ddd;
              border-radius: 10px;
              padding: 12px 16px;
              min-width: 120px;
              text-align: left;
            }

            .muted {
              color: #666;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }

            th, td {
              border-bottom: 1px solid #ddd;
              padding: 10px 8px;
              text-align: left;
              font-size: 14px;
            }

            th.right,
            td.right {
              text-align: right;
            }

            .total-row td {
              font-weight: bold;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-root">
            ${element.innerHTML}
          </div>
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

 return (
  <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-md">
    <Printer className="mr-2 h-4 w-4" />
    Imprimir
  </Button>
)
}