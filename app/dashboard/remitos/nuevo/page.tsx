import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RemitoForm } from "@/components/remito-form"

export default async function NuevoRemitoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [
    { data: clients, error: clientsError },
    { data: products, error: productsError },
    { data: lastRemito, error: lastRemitoError },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("company_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .eq("company_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("remitos")
      .select("number")
      .eq("company_id", user.id)
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (clientsError) {
    console.error("Error cargando clientes:", clientsError)
  }

  if (productsError) {
    console.error("Error cargando productos:", productsError)
  }

  if (lastRemitoError) {
    console.error("Error cargando último número de remito:", lastRemitoError)
  }

  const clientsList = clients ?? []
  const productsList = products ?? []
  const nextNumber = lastRemito ? lastRemito.number + 1 : 1

  return (
    <div className="space-y-4">
      <section className="border border-border/60 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <h1 className="text-[1.65rem] font-semibold tracking-[-0.025em] text-foreground">
            Nuevo registro
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cargá una nueva operación en el sistema.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-3">
          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Próximo número
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              #{nextNumber}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Numeración sugerida
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Clientes
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {clientsList.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Disponibles para seleccionar
            </p>
          </div>

          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Productos
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {productsList.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Disponibles para agregar
            </p>
          </div>
        </div>
      </section>

      <section className="border border-border/60 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Datos de la operación</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cliente, productos y detalle del registro.
          </p>
        </div>

        <div className="px-5 py-5">
          <RemitoForm
            userId={user.id}
            clients={clientsList}
            products={productsList}
            nextNumber={nextNumber}
          />
        </div>
      </section>
    </div>
  )
}