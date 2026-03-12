import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { RemitoWithItems, Company } from "@/lib/types"
import { GeneratePdfButton } from "@/components/generate-pdf-button"
import { PrintRemitoButton } from "@/components/print-remito-button"
import { DeleteRemitoButton } from "@/components/delete-remito-button"
import { CancelRemitoButton } from "@/components/cancel-remito-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VerRemitoPageProps {
  params: Promise<{ id: string }>
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDateOnly(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString("es-AR")
}

function formatWeekday(dateString: string) {
  const weekday = parseLocalDate(dateString).toLocaleDateString("es-AR", {
    weekday: "long",
  })

  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
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

  const isCancelled = remito.status === "cancelled"

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <section className="border border-border/60 bg-card">
          <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
                <Link href="/dashboard/remitos">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>

              <p className="text-sm text-muted-foreground">Volver al listado</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <PrintRemitoButton
                targetId="remito-print-area"
                fileName={`venta-${remito.number}`}
              />
              <GeneratePdfButton remito={remitoWithItems} company={company as Company} />
              <CancelRemitoButton
                remitoId={remito.id}
                remitoNumber={remito.number}
                status={remito.status}
              />
              <DeleteRemitoButton
                remitoId={remito.id}
                remitoNumber={remito.number}
                status={remito.status}
              />
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[1.65rem] font-semibold tracking-[-0.025em] text-foreground">
                Venta #{remito.number}
              </h1>

              {isCancelled ? (
                <Badge variant="destructive">Cancelada</Badge>
              ) : (
                <Badge className="border-0 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
                  Confirmada
                </Badge>
              )}
            </div>

            <div className="mt-6 grid gap-x-10 gap-y-5 lg:grid-cols-2">
              <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-border/60 pb-3">
                <span className="text-sm font-semibold text-foreground">Cliente</span>
                <div>
                  <p className="text-sm text-foreground">{remito.client_name}</p>
                  {remito.client_cuit ? (
                    <p className="text-sm text-muted-foreground">CUIT: {remito.client_cuit}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-border/60 pb-3">
                <span className="text-sm font-semibold text-foreground">Fecha</span>
                <div>
                  <p className="text-sm text-foreground">{formatDateOnly(remito.date)}</p>
                  <p className="text-sm text-muted-foreground">{formatWeekday(remito.date)}</p>
                </div>
              </div>

              {remito.client_address ? (
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-border/60 pb-3 lg:col-span-2">
                  <span className="text-sm font-semibold text-foreground">Dirección</span>
                  <p className="text-sm text-muted-foreground">{remito.client_address}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-t border-border/60 px-5 py-3">
            <p className="text-sm font-medium text-foreground">Detalle</p>
          </div>

          <div className="px-5 py-5">
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
                    <TableCell className="font-medium text-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ${Number(item.unit_price).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      ${Number(item.subtotal).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="bg-muted/20">
                  <TableCell colSpan={3} className="text-right text-sm font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold">
                    ${Number(remito.total).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <div id="remito-print-area" className="hidden">
        <div className="space-y-6">
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
                    {company?.cuit ? (
                      <p className="muted text-muted-foreground">CUIT: {company.cuit}</p>
                    ) : null}
                    {company?.address ? (
                      <p className="muted text-muted-foreground">{company.address}</p>
                    ) : null}
                    {company?.phone ? (
                      <p className="muted text-muted-foreground">Tel: {company.phone}</p>
                    ) : null}
                    {company?.email ? (
                      <p className="muted text-muted-foreground">{company.email}</p>
                    ) : null}
                  </div>
                </div>

                <div className="print-remito-box rounded-lg border px-4 py-3 text-sm">
                  <p className="muted text-muted-foreground">Venta</p>
                  <p className="text-xl font-bold">#{remito.number}</p>
                  <p className="muted text-muted-foreground">{formatDateOnly(remito.date)}</p>
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
                  ${Number(remito.total).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
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
                          ${Number(item.unit_price).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(item.subtotal).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${Number(remito.total).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}