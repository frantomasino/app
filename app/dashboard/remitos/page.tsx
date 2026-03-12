import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { RemitosTable } from "@/components/remitos-table"

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
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.id),
  ])

  if (remitosError) {
    console.error("Error cargando remitos:", remitosError)
  }

  if (clientsCountError) {
    console.error("Error cargando cantidad de contactos:", clientsCountError)
  }

  const remitosList = remitos ?? []
  const totalRegistros = remitosList.length
  const totalContactos = clientsCount || 0
  const totalFacturado = remitosList
    .filter((remito) => remito.status !== "cancelled")
    .reduce((acc, remito) => acc + Number(remito.total || 0), 0)

  return (
    <div className="space-y-4">
      <section className="border border-border/60 bg-card">
        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[1.65rem] font-semibold tracking-[-0.025em] text-foreground">
              Ventas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultá y administrá los registros emitidos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button asChild variant="outline" size="sm" className="rounded-md">
              <Link href="/dashboard/clientes">
                <Users className="mr-2 h-4 w-4" />
                Ver contactos
              </Link>
            </Button>

            <Button asChild size="sm" className="rounded-md">
              <Link href="/dashboard/remitos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo registro
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-3">
          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Registros
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalRegistros}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Total emitido en el sistema
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
              Disponibles para operar
            </p>
          </div>

          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Total acumulado
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              ${totalFacturado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Solo registros confirmados
            </p>
          </div>
        </div>
      </section>

      <RemitosTable remitos={remitosList} />
    </div>
  )
}