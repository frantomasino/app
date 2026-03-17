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
    console.error("Error cargando último número de pedido:", lastRemitoError)
  }

  const clientsList = clients ?? []
  const productsList = products ?? []
  const nextNumber = lastRemito ? lastRemito.number + 1 : 1
  const hasClients = clientsList.length > 0
  const hasProducts = productsList.length > 0

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            Pedidos y ventas
          </p>
          <h1 className="mt-1 text-[1.7rem] font-semibold tracking-[-0.035em] text-foreground">
            Nuevo pedido
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Registrá una nueva operación comercial con cliente, productos, cantidades e importe final.
          </p>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Próximo número
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              #{nextNumber}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Numeración sugerida
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Clientes
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {clientsList.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Disponibles para operar
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Productos
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {productsList.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Disponibles en catálogo
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Estado operativo
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {hasClients && hasProducts ? "Listo para cargar" : "Requiere revisión"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasClients && hasProducts
                ? "Ya podés registrar pedidos"
                : "Faltan datos básicos para operar"}
            </p>
          </div>
        </div>
      </section>

      {(!hasClients || !hasProducts) ? (
        <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-foreground">
              Antes de cargar un pedido
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Para operar correctamente, necesitás al menos un cliente y un producto cargado.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {!hasClients ? (
                <span className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground">
                  Falta cargar clientes
                </span>
              ) : null}

              {!hasProducts ? (
                <span className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-muted-foreground">
                  Falta cargar productos
                </span>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Carga del pedido</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seleccioná el cliente, agregá productos y confirmá el total de la operación.
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