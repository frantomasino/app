import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function VentasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: remitos } = await supabase
    .from("remitos")
    .select("*")
    .eq("company_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground">Acá podés ver todas las ventas registradas</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/remitos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nueva venta
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de ventas</CardTitle>
          <CardDescription>Todas las ventas cargadas en tu cuenta</CardDescription>
        </CardHeader>

        <CardContent>
          {remitos && remitos.length > 0 ? (
            <div className="space-y-4">
              {remitos.map((remito) => (
                <Link
                  key={remito.id}
                  href={`/dashboard/remitos/${remito.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Venta #{remito.number}</p>
                        {remito.status === "cancelled" ? (
                          <Badge variant="destructive">Cancelada</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-900 hover:bg-green-100">
                            Confirmada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{remito.client_name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      ${Number(remito.total).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(remito.date).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-medium">No hay ventas registradas</h3>
              <p className="mt-1 text-sm text-muted-foreground">Todavía no cargaste ninguna venta.</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/dashboard/remitos/nuevo">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear venta
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}