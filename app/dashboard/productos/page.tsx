import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductsImportExport } from "@/components/products-import-export"
import { Product } from "@/lib/types"

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
        <p className="text-muted-foreground">
          Importá o exportá tu catálogo para manejar tus listas de precios desde la app.
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
            Se muestran los productos cargados para tu empresa. La importación actual reemplaza el catálogo completo.
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
                    <th className="px-4 py-3 text-left font-medium">Unidad</th>
                    <th className="px-4 py-3 text-right font-medium">Lista 1</th>
                    <th className="px-4 py-3 text-right font-medium">Lista 2</th>
                    <th className="px-4 py-3 text-right font-medium">Lista 3</th>
                  </tr>
                </thead>
                <tbody>
                  {safeProducts.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="px-4 py-3">{product.code || "-"}</td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.unit || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        {Number(product.price_1).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(product.price_2).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(product.price_3).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}