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
    console.error("Error cargando contactos:", error)
  }

  const clientsList = clients ?? []
  const totalContacts = clientsList.length
  const contactsWithEmail = clientsList.filter((client) => !!client.email).length
  const contactsWithPhone = clientsList.filter((client) => !!client.phone).length
  const contactsWithCuit = clientsList.filter((client) => !!client.cuit).length

  return (
    <div className="space-y-4">
      <section className="border border-border/60 bg-card">
        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[1.65rem] font-semibold tracking-[-0.025em] text-foreground">
              Contactos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultá y administrá tu base de contactos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button asChild variant="outline" size="sm" className="rounded-md">
              <Link href="/dashboard/remitos">
                Ver ventas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild size="sm" className="rounded-md">
              <Link href="/dashboard/clientes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo contacto
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-4">
          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalContacts}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Contactos registrados
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Con email
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {contactsWithEmail}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Correo disponible
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Con teléfono
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {contactsWithPhone}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Contacto telefónico
            </p>
          </div>

          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Con CUIT
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {contactsWithCuit}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Identificación fiscal
            </p>
          </div>
        </div>
      </section>

      <section className="border border-border/60 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Listado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Información comercial y de contacto de cada registro.
            </p>
          </div>

          {totalContacts > 0 ? (
            <Button asChild variant="outline" size="sm" className="rounded-md">
              <Link href="/dashboard/clientes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Agregar contacto
              </Link>
            </Button>
          ) : null}
        </div>

        {clientsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/20">
                <tr className="border-b border-border/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Contacto
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:table-cell">
                    CUIT
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground md:table-cell">
                    Teléfono
                  </th>
                  <th className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground lg:table-cell">
                    Email
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientsList.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/20"
                  >
                    <td className="min-w-[240px] px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{client.name}</p>

                          {client.cuit ? (
                            <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                              Registrado
                            </Badge>
                          ) : null}
                        </div>

                        <div className="space-y-1 sm:hidden">
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
                        <Button asChild variant="ghost" size="icon-sm" className="rounded-md">
                          <Link href={`/dashboard/clientes/${client.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              No hay contactos cargados
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Empezá agregando el primero para organizar mejor tus operaciones.
            </p>

            <div className="mt-5">
              <Button asChild size="sm" className="rounded-md">
                <Link href="/dashboard/clientes/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar contacto
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}