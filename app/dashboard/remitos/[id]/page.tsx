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
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Receipt,
  UserRound,
} from "lucide-react"
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

function formatCurrency(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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
  const totalItems = remitoWithItems.items.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0,
  )

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <section className="rounded-2xl border border-border/70 bg-card">
          <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
                <Link href="/dashboard/remitos">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>

              <div>
                <p className="text-sm text-muted-foreground">Volver a pedidos</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Registro comercial
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrintRemitoButton
                targetId="remito-print-area"
                fileName={`pedido-${remito.number}`}
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

          <div className="px-5 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                    Pedido #{remito.number}
                  </h1>

                  {isCancelled ? (
                    <Badge variant="destructive">Cancelado</Badge>
                  ) : (
                    <Badge className="border-0 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
                      Vigente
                    </Badge>
                  )}
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Ficha del pedido con cliente, fecha, detalle de productos y total de la operación.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-right lg:min-w-[220px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Total del pedido
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  ${formatCurrency(Number(remito.total || 0))}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-0 rounded-2xl border border-border/70 bg-background md:grid-cols-2 xl:grid-cols-4">
              <div className="border-b border-border/70 px-4 py-4 xl:border-b-0 xl:border-r">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserRound className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Cliente
                    </p>
                    <p className="mt-1 font-semibold text-foreground">{remito.client_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {remito.client_cuit ? `CUIT: ${remito.client_cuit}` : "Sin CUIT"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-border/70 px-4 py-4 md:border-l-0 xl:border-b-0 xl:border-r">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarDays className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Fecha
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {formatDateOnly(remito.date)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatWeekday(remito.date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-border/70 px-4 py-4 xl:border-b-0 xl:border-r">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Receipt className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Productos
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {remitoWithItems.items.length} cargados
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {totalItems} unidades
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Dirección
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {remito.client_address || "Sin dirección cargada"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card">
          <div className="border-b border-border/70 px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Detalle del pedido</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Productos, cantidades, precios unitarios y subtotales de la operación.
            </p>
          </div>

          <div className="px-5 py-5">
            <div className="overflow-hidden rounded-2xl border border-border/70">
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
                        ${formatCurrency(Number(item.unit_price || 0))}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        ${formatCurrency(Number(item.subtotal || 0))}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={3} className="text-right text-sm font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right text-base font-semibold">
                      ${formatCurrency(Number(remito.total || 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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
                  <p className="muted text-muted-foreground">Pedido</p>
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
                  ${formatCurrency(Number(remito.total || 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="print-card">
            <CardHeader>
              <CardTitle>Detalle del pedido</CardTitle>
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
                          ${formatCurrency(Number(item.unit_price || 0))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${formatCurrency(Number(item.subtotal || 0))}
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${formatCurrency(Number(remito.total || 0))}
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