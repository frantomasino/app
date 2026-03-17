import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Pencil, ArrowRight } from "lucide-react"
import { DeleteClientButton } from "@/components/delete-client-button"

export default async function ClientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", user.id)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error cargando clientes:", error)
  }

  const clientsList = clients ?? []
  const totalClients = clientsList.length
  const clientsWithEmail = clientsList.filter((client) => !!client.email).length
  const clientsWithPhone = clientsList.filter((client) => !!client.phone).length
  const clientsWithCuit = clientsList.filter((client) => !!client.cuit).length

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Base comercial</Badge>
              <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                {totalClients} clientes
              </Badge>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Clientes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Organizá contactos, datos fiscales y vías de comunicación desde una sola bandeja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/remitos">
                Ver pedidos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="sm">
              <Link href="/dashboard/clientes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo cliente
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-border/70 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{clientsWithEmail} con email</span>
            <span>•</span>
            <span>{clientsWithPhone} con teléfono</span>
            <span>•</span>
            <span>{clientsWithCuit} con CUIT</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Bandeja de clientes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Información comercial, fiscal y de contacto en una sola tabla.
            </p>
          </div>

          {totalClients > 0 ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/clientes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Agregar cliente
              </Link>
            </Button>
          ) : null}
        </div>

        {clientsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/20">
                <tr className="border-b border-border/70">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Cliente
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:table-cell">
                    CUIT
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground md:table-cell">
                    Teléfono
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground lg:table-cell">
                    Email
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientsList.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/15"
                  >
                    <td className="min-w-[260px] px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{client.name}</p>

                        {client.cuit ? (
                          <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                            Fiscal
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-1 space-y-1 sm:hidden">
                        <p className="text-sm text-muted-foreground">
                          {client.cuit || "Sin CUIT"}
                        </p>

                        {client.phone ? (
                          <p className="text-sm text-muted-foreground">{client.phone}</p>
                        ) : null}

                        {client.email ? (
                          <p className="truncate text-sm text-muted-foreground">
                            {client.email}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="hidden px-5 py-4 text-foreground sm:table-cell">
                      {client.cuit || "-"}
                    </td>

                    <td className="hidden px-5 py-4 text-foreground md:table-cell">
                      {client.phone || "-"}
                    </td>

                    <td className="hidden max-w-[260px] px-5 py-4 text-foreground lg:table-cell">
                      <span className="block truncate">{client.email || "-"}</span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button asChild variant="ghost" size="icon-sm" className="rounded-lg">
                          <Link href={`/dashboard/clientes/${client.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar cliente</span>
                          </Link>
                        </Button>

                        <DeleteClientButton clientId={client.id} clientName={client.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              Todavía no hay clientes cargados
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Empezá agregando el primero para ordenar pedidos, ventas y seguimiento.
            </p>

            <div className="mt-5">
              <Button asChild size="sm">
                <Link href="/dashboard/clientes/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar cliente
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}