import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Users,
  Package,
  Receipt,
  Settings,
  TrendingUp,
  ArrowRight,
  Clock3,
} from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [
    { count: remitosCount, error: remitosCountError },
    { count: clientsCount, error: clientsCountError },
    { count: productsCount, error: productsCountError },
    { data: recentRemitos, error: recentRemitosError },
  ] = await Promise.all([
    supabase
      .from("remitos")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id),
    supabase
      .from("remitos")
      .select("*")
      .eq("company_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4),
  ])

  if (remitosCountError) {
    console.error("Error cargando cantidad de remitos:", remitosCountError)
  }

  if (clientsCountError) {
    console.error("Error cargando cantidad de contactos:", clientsCountError)
  }

  if (productsCountError) {
    console.error("Error cargando cantidad de productos:", productsCountError)
  }

  if (recentRemitosError) {
    console.error("Error cargando remitos recientes:", recentRemitosError)
  }

  const totalComprobantes = remitosCount || 0
  const totalContactos = clientsCount || 0
  const totalProductos = productsCount || 0
  const recentList = recentRemitos ?? []
  const totalReciente = recentList
    .filter((remito) => remito.status !== "cancelled")
    .reduce((acc, remito) => acc + Number(remito.total || 0), 0)

  return (
    <div className="space-y-4">
      <section className="border border-border/60 bg-card">
        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[1.65rem] font-semibold tracking-[-0.025em] text-foreground">
              Inicio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Panorama general de la operación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button asChild size="sm" className="rounded-md">
              <Link href="/dashboard/remitos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo registro
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" className="rounded-md">
              <Link href="/dashboard/remitos">
                Ir a ventas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-4">
          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Ventas
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalComprobantes}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Registros emitidos
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Contactos
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalContactos}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Base activa
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Inventario
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalProductos}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Productos cargados
            </p>
          </div>

          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Reciente
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              ${totalReciente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Últimos confirmados
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="border border-border/60 bg-card">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Estado del sistema</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Resumen operativo del negocio.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-b border-border/60 px-5 py-4 md:border-b-0 md:border-r">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Receipt className="h-4.5 w-4.5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Ventas activas</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gestión central de registros y seguimiento comercial.
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm" className="rounded-md">
                      <Link href="/dashboard/remitos">Abrir ventas</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-border/60 px-5 py-4 md:border-b-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users className="h-4.5 w-4.5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Base de contactos</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Administración de datos comerciales y fiscales.
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm" className="rounded-md">
                      <Link href="/dashboard/clientes">Abrir contactos</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-border/60 px-5 py-4 md:border-b-0 md:border-r md:border-t">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Package className="h-4.5 w-4.5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Inventario</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Control de catálogo, stock y actualización de productos.
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm" className="rounded-md">
                      <Link href="/dashboard/productos">Abrir inventario</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 md:border-t border-border/60">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Settings className="h-4.5 w-4.5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Configuración</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Datos de empresa, identidad visual y parámetros del sistema.
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm" className="rounded-md">
                      <Link href="/dashboard/configuracion">Abrir configuración</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="border border-border/60 bg-card">
            <div className="border-b border-border/60 px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Último movimiento</p>
            </div>

            <div className="px-5 py-4">
              {recentList.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Clock3 className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Registro #{recentList[0].number}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {recentList[0].client_name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(recentList[0].date).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button asChild variant="outline" size="sm" className="w-full rounded-md">
                      <Link href={`/dashboard/remitos/${recentList[0].id}`}>
                        Ver detalle
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay movimientos registrados.
                </p>
              )}
            </div>
          </section>

          <section className="border border-border/60 bg-card">
            <div className="border-b border-border/60 px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Accesos rápidos</p>
            </div>

            <div className="px-3 py-3">
              <div className="space-y-1">
                <Link
                  href="/dashboard/remitos/nuevo"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
                >
                  <Plus className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Nuevo registro</span>
                </Link>

                <Link
                  href="/dashboard/clientes/nuevo"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
                >
                  <Users className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Nuevo contacto</span>
                </Link>

                <Link
                  href="/dashboard/productos"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
                >
                  <Package className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Inventario</span>
                </Link>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}