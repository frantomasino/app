import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users } from "lucide-react"
import { RemitosTable } from "@/components/remitos-table"

function formatCurrency(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default async function RemitosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [
    { data: remitos, error: remitosError },
    { count: clientsCount, error: clientsCountError },
  ] = await Promise.all([
    supabase
      .from("remitos")
      .select("*")
      .eq("company_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id),
  ])

  if (remitosError) {
    console.error("Error cargando pedidos:", remitosError)
  }

  if (clientsCountError) {
    console.error("Error cargando cantidad de clientes:", clientsCountError)
  }

  const remitosList = remitos ?? []
  const totalClientes = clientsCount || 0

  const pedidosVigentes = remitosList.filter((remito) => remito.status !== "cancelled")
  const totalFacturado = pedidosVigentes.reduce(
    (acc, remito) => acc + Number(remito.total || 0),
    0,
  )

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Bandeja comercial</Badge>
              <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                {remitosList.length} pedidos
              </Badge>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Pedidos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Consultá, filtrá y seguí la operación comercial desde una sola bandeja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/clientes">
                <Users className="mr-2 h-4 w-4" />
                Ver clientes
              </Link>
            </Button>

            <Button asChild size="sm">
              <Link href="/dashboard/remitos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo pedido
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-border/70 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{pedidosVigentes.length} vigentes</span>
            <span>•</span>
            <span>{totalClientes} clientes</span>
            <span>•</span>
            <span>${formatCurrency(totalFacturado)} vendidos</span>
          </div>
        </div>
      </section>

      <RemitosTable remitos={remitosList} />
    </div>
  )
}