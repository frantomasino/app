import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductsImportExport } from "@/components/products-import-export"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Boxes,
  AlertTriangle,
  Package,
  CircleDollarSign,
} from "lucide-react"

function formatCurrency(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

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
  })

  const noStockProducts = safeProducts.filter(
    (product) => Number(product.stock || 0) <= 0,
  )

  const totalInventoryValue = safeProducts.reduce((acc, product) => {
    return acc + Number(product.price || 0) * Number(product.stock || 0)
  }, 0)

  const availableProducts = safeProducts.filter(
    (product) => Number(product.stock || 0) > 0,
  ).length

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
      <section className="rounded-2xl border border-border/70 bg-card">
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Inventario</Badge>
              <Badge className="border-0 bg-primary/10 text-primary hover:bg-primary/10">
                {totalProducts} productos
              </Badge>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
              Productos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Controlá catálogo, precios y stock desde una vista de inventario clara y operativa.
            </p>
          </div>
        </div>

        <div className="grid gap-0 border-t border-border/70 md:grid-cols-2 xl:grid-cols-4">
          <div className="border-b border-border/70 px-4 py-4 xl:border-b-0 xl:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Productos
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalProducts}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              En catálogo
            </p>
          </div>

          <div className="border-b border-border/70 px-4 py-4 md:border-l-0 xl:border-b-0 xl:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Disponibles
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {availableProducts}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Con stock positivo
            </p>
          </div>

          <div className="border-b border-border/70 px-4 py-4 xl:border-b-0 xl:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Stock bajo
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {lowStockProducts.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Requieren reposición
            </p>
          </div>

          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Valor stock
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              ${formatCurrency(totalInventoryValue)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Inventario valorizado
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Gestión de catálogo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Importá, exportá y actualizá productos de forma masiva.
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

          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Bandeja de productos</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Catálogo actual con precio, stock y disponibilidad.
                </p>
              </div>
            </div>

            {safeProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr className="border-b border-border/70">
                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Código
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Producto
                      </th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Precio
                      </th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Stock
                      </th>
                      <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
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
                          className="border-b border-border/60 transition-colors hover:bg-muted/15"
                        >
                          <td className="px-5 py-4 text-foreground">
                            {product.code || "-"}
                          </td>

                          <td className="px-5 py-4 font-semibold text-foreground">
                            {product.name}
                          </td>

                          <td className="px-5 py-4 text-right text-foreground">
                            ${Number(product.price || 0).toLocaleString("es-AR", {
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

                          <td className="px-5 py-4 text-center">
                            {getStockBadge(stock)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Boxes className="h-5 w-5 text-muted-foreground" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-foreground">
                  Todavía no hay productos cargados
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Importá tu catálogo para empezar a trabajar con stock, precios y ventas.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">Resumen de stock</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Indicadores clave del inventario actual.
              </p>
            </div>

            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Stock bajo</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lowStockProducts.length} productos para revisar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sin stock</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {noStockProducts.length} productos no disponibles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CircleDollarSign className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Valor estimado</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${formatCurrency(totalInventoryValue)} en inventario.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}