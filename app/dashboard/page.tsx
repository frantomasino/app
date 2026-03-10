import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Plus, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [{ count: remitosCount }, { count: clientsCount }, { data: recentRemitos }] = await Promise.all([
    supabase.from("remitos").select("*", { count: "exact", head: true }).eq("company_id", user.id),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("company_id", user.id),
    supabase.from("remitos").select("*").eq("company_id", user.id).order("created_at", { ascending: false }).limit(5),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de gestión</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/remitos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nueva venta
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total ventas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remitosCount || 0}</div>
            <p className="text-xs text-muted-foreground">Ventas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Acciones rápidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/clientes/nuevo">
                <Users className="mr-1 h-3 w-3" />
                Nuevo cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas recientes</CardTitle>
          <CardDescription>Las últimas ventas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRemitos && recentRemitos.length > 0 ? (
            <div className="space-y-4">
              {recentRemitos.map((remito) => (
                <Link
                  key={remito.id}
                  href={`/dashboard/remitos/${remito.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Venta #{remito.number}</p>
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
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-medium">No hay ventas</h3>
              <p className="mt-1 text-sm text-muted-foreground">Comenzá cargando tu primera venta.</p>
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