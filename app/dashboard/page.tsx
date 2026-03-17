import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Users,
  Package,
  ArrowRight,
  Clock3,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Receipt,
} from "lucide-react"

type DashboardPageProps = {
  searchParams?: Promise<{
    period?: string
  }>
}

type PeriodKey = "today" | "week" | "month" | "year" | "all"

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
  { key: "year", label: "Año" },
  { key: "all", label: "Histórico" },
]

function getPeriodLabel(period: PeriodKey) {
  switch (period) {
    case "today":
      return "de hoy"
    case "week":
      return "de esta semana"
    case "month":
      return "de este mes"
    case "year":
      return "de este año"
    case "all":
    default:
      return "histórico"
  }
}

function getPeriodStart(period: PeriodKey) {
  const now = new Date()

  if (period === "all") return null

  const start = new Date(now)

  if (period === "today") {
    start.setHours(0, 0, 0, 0)
    return start
  }

  if (period === "week") {
    const day = start.getDay()
    const diff = day === 0 ? 6 : day - 1
    start.setDate(start.getDate() - diff)
    start.setHours(0, 0, 0, 0)
    return start
  }

  if (period === "month") {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return start
  }

  start.setMonth(0, 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function formatCurrency(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR")
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const requestedPeriod = resolvedSearchParams.period as PeriodKey | undefined
  const selectedPeriod: PeriodKey = PERIOD_OPTIONS.some((p) => p.key === requestedPeriod)
    ? (requestedPeriod as PeriodKey)
    : "month"

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const periodStart = getPeriodStart(selectedPeriod)
  const periodStartString = periodStart ? periodStart.toISOString().slice(0, 10) : null

  const remitosCountQuery = supabase
    .from("remitos")
    .select("*", { count: "exact", head: true })
    .eq("company_id", user.id)

  const recentRemitosQuery = supabase
    .from("remitos")
    .select("*")
    .eq("company_id", user.id)
    .order("date", { ascending: false })
    .limit(8)

  if (periodStartString) {
    remitosCountQuery.gte("date", periodStartString)
    recentRemitosQuery.gte("date", periodStartString)
  }

  const [
    { count: remitosCount, error: remitosCountError },
    { count: clientsCount, error: clientsCountError },
    { data: products, error: productsError },
    { data: recentRemitos, error: recentRemitosError },
  ] = await Promise.all([
    remitosCountQuery,
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id),
    supabase
      .from("products")
      .select("id, name, stock, price")
      .eq("company_id", user.id)
      .order("name", { ascending: true }),
    recentRemitosQuery,
  ])

  if (remitosCountError) {
    console.error("Error cargando cantidad de pedidos:", remitosCountError)
  }

  if (clientsCountError) {
    console.error("Error cargando cantidad de clientes:", clientsCountError)
  }

  if (productsError) {
    console.error("Error cargando productos:", productsError)
  }

  if (recentRemitosError) {
    console.error("Error cargando pedidos recientes:", recentRemitosError)
  }

  const recentList = recentRemitos ?? []
  const productList = products ?? []

  const activeOrders = recentList.filter((remito) => remito.status !== "cancelled")
  const latestOrder = recentList[0] ?? null

  const totalPedidos = remitosCount || 0
  const totalClientes = clientsCount || 0
  const totalProductos = productList.length
  const totalVentas = activeOrders.reduce((acc, remito) => acc + Number(remito.total || 0), 0)
  const ticketPromedio = activeOrders.length > 0 ? totalVentas / activeOrders.length : 0

  const activeClientsCount = new Set(
    activeOrders.map((remito) => remito.client_name).filter(Boolean),
  ).size

  const lowStockProducts = productList.filter((product) => {
    const stock = Number(product.stock || 0)
    return stock > 0 && stock <= 5
  })

  const noStockProducts = productList.filter((product) => Number(product.stock || 0) <= 0)

  const inventoryValue = productList.reduce((acc, product) => {
    return acc + Number(product.price || 0) * Number(product.stock || 0)
  }, 0)

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border/70 bg-card">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Workspace comercial</Badge>
              <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                {getPeriodLabel(selectedPeriod)}
              </Badge>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Control del negocio
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Vista operativa para seguir ventas, clientes, stock y actividad comercial
              sin salir del panel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm">
              <Link href="/dashboard/remitos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo pedido
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/remitos">
                Ver pedidos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-border/70 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => {
              const isActive = selectedPeriod === option.key

              return (
                <Link
                  key={option.key}
                  href={`/dashboard?period=${option.key}`}
                  className={
                    isActive
                      ? "rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                      : "rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                  }
                >
                  {option.label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-5">
              <div className="border-b border-border/70 px-4 py-4 xl:border-b-0 xl:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Pedidos
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {totalPedidos}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Registrados</p>
              </div>

              <div className="border-b border-border/70 px-4 py-4 md:border-l-0 xl:border-b-0 xl:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Ventas
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  ${formatCurrency(totalVentas)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Período actual</p>
              </div>

              <div className="border-b border-border/70 px-4 py-4 xl:border-b-0 xl:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Ticket
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  ${formatCurrency(ticketPromedio)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Promedio</p>
              </div>

              <div className="border-b border-border/70 px-4 py-4 md:border-l-0 xl:border-b-0 xl:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Clientes activos
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {activeClientsCount}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  De {totalClientes} clientes
                </p>
              </div>

              <div className="px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Stock valorizado
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  ${formatCurrency(inventoryValue)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {totalProductos} productos
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Actividad reciente</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Últimos pedidos registrados {getPeriodLabel(selectedPeriod)}.
                </p>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/remitos">Ver todos</Link>
              </Button>
            </div>

            {recentList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr className="border-b border-border/70">
                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Pedido
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Cliente
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentList.map((remito) => {
                      const isCancelled = remito.status === "cancelled"

                      return (
                        <tr
                          key={remito.id}
                          className="border-b border-border/60 transition-colors hover:bg-muted/15"
                        >
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <Link
                                href={`/dashboard/remitos/${remito.id}`}
                                className="font-semibold text-foreground hover:underline"
                              >
                                Pedido #{remito.number}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(remito.date)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-foreground">{remito.client_name}</td>

                          <td className="px-5 py-4">
                            {isCancelled ? (
                              <Badge variant="destructive">Cancelado</Badge>
                            ) : (
                              <Badge className="border-0 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
                                Vigente
                              </Badge>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-semibold text-foreground">
                            ${formatCurrency(Number(remito.total || 0))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay pedidos en este período.
                </p>
              </div>
            )}
          </section>

          <section className="grid gap-3 lg:grid-cols-3">
            <Link
              href="/dashboard/remitos"
              className="rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/15"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Receipt className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pedidos</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gestión comercial y seguimiento.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/clientes"
              className="rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/15"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Clientes</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Base comercial activa.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/productos"
              className="rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/15"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Boxes className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Productos</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Catálogo, stock y precios.
                  </p>
                </div>
              </div>
            </Link>
          </section>
        </div>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-4 py-3.5">
              <p className="text-sm font-semibold text-foreground">Estado operativo</p>
            </div>

            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Stock bajo</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lowStockProducts.length} productos requieren reposición.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sin stock</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {noStockProducts.length} productos no disponibles.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/productos">Revisar inventario</Link>
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-4 py-3.5">
              <p className="text-sm font-semibold text-foreground">Último pedido</p>
            </div>

            <div className="p-4">
              {latestOrder ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Clock3 className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Pedido #{latestOrder.number}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {latestOrder.client_name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(latestOrder.date)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Importe
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                      ${formatCurrency(Number(latestOrder.total || 0))}
                    </p>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/dashboard/remitos/${latestOrder.id}`}>
                      Ver detalle
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    No hay pedidos en este período.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-4 py-3.5">
              <p className="text-sm font-semibold text-foreground">Acciones rápidas</p>
            </div>

            <div className="p-2">
              <div className="space-y-1">
                <Link
                  href="/dashboard/remitos/nuevo"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/30"
                >
                  <Plus className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Nuevo pedido</span>
                </Link>

                <Link
                  href="/dashboard/clientes/nuevo"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/30"
                >
                  <Users className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Nuevo cliente</span>
                </Link>

                <Link
                  href="/dashboard/productos"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/30"
                >
                  <Package className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Ver productos</span>
                </Link>

                <Link
                  href="/dashboard/configuracion"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted/30"
                >
                  <Users className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Configurar negocio</span>
                </Link>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}