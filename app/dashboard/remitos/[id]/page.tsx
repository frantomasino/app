import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { RemitoWithItems, Company } from "@/lib/types"
import { GeneratePdfButton } from "@/components/generate-pdf-button"
import { PrintRemitoButton } from "@/components/print-remito-button"
import { DeleteRemitoButton } from "@/components/delete-remito-button"

interface VerRemitoPageProps {
  params: Promise<{ id: string }>
}

export default async function VerRemitoPage({ params }: VerRemitoPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: remito } = await supabase
    .from("remitos")
    .select("*")
    .eq("id", id)
    .eq("company_id", user.id)
    .single()

  if (!remito) {
    notFound()
  }

  const { data: items } = await supabase
    .from("remito_items")
    .select("*")
    .eq("remito_id", remito.id)

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const remitoWithItems: RemitoWithItems = {
    ...remito,
    items: items || [],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/remitos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              Venta <Badge variant="secondary">#{remito.number}</Badge>
            </h1>
            <p className="text-muted-foreground">
              {new Date(remito.date).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PrintRemitoButton targetId="remito-print-area" fileName={`venta-${remito.number}`} />
          <GeneratePdfButton remito={remitoWithItems} company={company as Company} />
          <DeleteRemitoButton remitoId={remito.id} remitoNumber={remito.number} />
        </div>
      </div>

      <div id="remito-print-area" className="space-y-6">
        <Card className="print-card">
          <CardContent className="pt-6">
            <div className="print-header flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="print-company flex items-center gap-4">
                {company?.logo_url ? (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-2">
                    <Image
                      src={company.logo_url}
                      alt={company.name || "Logo de la empresa"}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : null}

                <div className="space-y-1 text-sm">
                  <p className="text-lg font-semibold">{company?.name || "Mi Empresa"}</p>
                  {company?.cuit ? <p className="muted text-muted-foreground">CUIT: {company.cuit}</p> : null}
                  {company?.address ? <p className="muted text-muted-foreground">{company.address}</p> : null}
                  {company?.phone ? <p className="muted text-muted-foreground">Tel: {company.phone}</p> : null}
                  {company?.email ? <p className="muted text-muted-foreground">{company.email}</p> : null}
                </div>
              </div>

              <div className="print-remito-box rounded-lg border px-4 py-3 text-sm">
                <p className="muted text-muted-foreground">Venta</p>
                <p className="text-xl font-bold">#{remito.number}</p>
                <p className="muted text-muted-foreground">
                  {new Date(remito.date).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="print-grid grid gap-6 lg:grid-cols-2">
          <Card className="print-card">
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{remito.client_name}</p>
              {remito.client_cuit ? (
                <p className="muted text-muted-foreground">CUIT: {remito.client_cuit}</p>
              ) : null}
              {remito.client_address ? (
                <p className="muted text-muted-foreground">{remito.client_address}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="print-card">
            <CardHeader>
              <CardTitle className="text-base">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${Number(remito.total).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="print-card">
          <CardHeader>
            <CardTitle>Detalle de la venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remitoWithItems.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${Number(item.unit_price).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(item.subtotal).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${Number(remito.total).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}