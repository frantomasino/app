import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductsImportExport } from "@/components/products-import-export"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export default async function ProductosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("company_id", user.id)
    .order("name", { ascending: true })

  const safeProducts = (products ?? []) as Product[]

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Sin stock</Badge>
    }

    if (stock <= 5) {
      return (
        <Badge className="bg-yellow-100 text-yellow-900 hover:bg-yellow-100">
          Stock bajo
        </Badge>
      )
    }

    return (
      <Badge className="bg-green-100 text-green-900 hover:bg-green-100">
        Disponible
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
        <p className="text-muted-foreground">
          Importá o exportá tu catálogo para manejar tus precios y stock desde la app.
        </p>
      </div>

      <ProductsImportExport
        userId={user.id}
        products={safeProducts}
        showEmptyStateTrigger
      />

      <Card>
        <CardHeader>
          <CardTitle>Catálogo actual</CardTitle>
          <CardDescription>
            Se muestran los productos cargados para tu empresa. La importación actual reemplaza el
            catálogo completo.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {safeProducts.length === 0 ? null : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Código</th>
                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                    <th className="px-4 py-3 text-right font-medium">Precio</th>
                    <th className="px-4 py-3 text-right font-medium">Stock</th>
                    <th className="px-4 py-3 text-center font-medium">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {safeProducts.map((product) => {
                    const stock = Number(product.stock)

                    return (
                      <tr key={product.id} className="border-t">
                        <td className="px-4 py-3">{product.code || "-"}</td>
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-right">
                          {Number(product.price).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {stock.toLocaleString("es-AR", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">{getStockBadge(stock)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}