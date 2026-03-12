import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
  const totalProducts = safeProducts.length
  const lowStockProducts = safeProducts.filter((product) => {
    const stock = Number(product.stock || 0)
    return stock > 0 && stock <= 5
  }).length
  const noStockProducts = safeProducts.filter((product) => Number(product.stock || 0) <= 0).length
  const totalInventoryValue = safeProducts.reduce((acc, product) => {
    return acc + Number(product.price || 0) * Number(product.stock || 0)
  }, 0)

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return <Badge variant="destructive">Sin stock</Badge>
    }

    if (stock <= 5) {
      return (
        <Badge className="border-0 bg-amber-500/12 text-amber-700 hover:bg-amber-500/12 dark:text-amber-300">
          Stock bajo
        </Badge>
      )
    }

    return (
      <Badge className="border-0 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
        Disponible
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <section className="border border-border/60 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <h1 className="text-[1.65rem] font-semibold tracking-[-0.025em] text-foreground">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administrá catálogo, precios y stock desde un solo lugar.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-4">
          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Productos
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalProducts}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              En catálogo
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Stock bajo
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {lowStockProducts}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Requieren atención
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Sin stock
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {noStockProducts}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              No disponibles
            </p>
          </div>

          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Valor estimado
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              ${totalInventoryValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Stock valorizado
            </p>
          </div>
        </div>
      </section>

      <section className="border border-border/60 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
         <p className="text-sm font-semibold text-foreground">Catálogo</p>
<p className="mt-1 text-sm text-muted-foreground">
  Importá, exportá y actualizá productos.
</p>
        </div>

        <div className="px-5 py-5">
          <ProductsImportExport
            userId={user.id}
            products={safeProducts}
            showEmptyStateTrigger
          />
        </div>
      </section>

      <section className="border border-border/60 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Catálogo actual</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Productos cargados para tu empresa.
            </p>
          </div>
        </div>

        {safeProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/20">
                <tr className="border-b border-border/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Código
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Precio
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {safeProducts.map((product) => {
                  const stock = Number(product.stock || 0)

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-4 text-foreground">
                        {product.code || "-"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-foreground">
                        {product.name}
                      </td>

                      <td className="px-5 py-4 text-right text-foreground">
                        ${Number(product.price).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-5 py-4 text-right text-foreground">
                        {stock.toLocaleString("es-AR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </td>

                      <td className="px-5 py-4 text-center">{getStockBadge(stock)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-semibold text-muted-foreground">0</span>
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              No hay productos cargados
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Importá tu catálogo para empezar a trabajar con stock y precios.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}