"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Client, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Plus,
  Trash2,
  UserRound,
  Package,
  Receipt,
  CalendarDays,
} from "lucide-react"

interface RemitoItem {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
}

interface RemitoFormProps {
  userId: string
  clients?: Client[]
  products?: Product[]
  nextNumber: number
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

export function RemitoForm({
  userId,
  clients = [],
  products = [],
  nextNumber,
}: RemitoFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [clientName, setClientName] = useState("")
  const [clientCuit, setClientCuit] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [items, setItems] = useState<RemitoItem[]>([
    { id: crypto.randomUUID(), product_id: null, description: "", quantity: 1, unit_price: 0 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        id: client.id,
        name: client.name,
        cuit: client.cuit || "",
        address: client.address || "",
      })),
    [clients],
  )

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        name: product.name,
        unitPrice: Number(product.price || 0),
        stock: Number(product.stock || 0),
      })),
    [products],
  )

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), product_id: null, description: "", quantity: 1, unit_price: 0 },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof RemitoItem, value: string | number | null) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    )
  }

  const handleClientNameChange = (value: string) => {
    setClientName(value)

    const normalizedValue = normalizeText(value)
    const matchedClient = clientOptions.find(
      (client) => normalizeText(client.name) === normalizedValue,
    )

    if (matchedClient) {
      setSelectedClientId(matchedClient.id)
      setClientCuit(matchedClient.cuit)
      setClientAddress(matchedClient.address)
    } else {
      setSelectedClientId("")
    }
  }

  const handleDescriptionChange = (id: string, value: string) => {
    const normalizedValue = normalizeText(value)

    const matchedProduct = productOptions.find(
      (product) => normalizeText(product.name) === normalizedValue,
    )

    setItems(
      items.map((item) => {
        if (item.id !== id) return item

        return {
          ...item,
          product_id: matchedProduct ? matchedProduct.id : null,
          description: value,
          unit_price: matchedProduct ? matchedProduct.unitPrice : item.unit_price,
        }
      }),
    )
  }

  const getItemStock = (productId: string | null) => {
    if (!productId) return null
    const product = productOptions.find((item) => item.id === productId)
    return product ? product.stock : null
  }

  const totalProductos = items.length
  const totalUnidades = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!clientName.trim()) {
      setError("Seleccioná o ingresá un cliente para continuar.")
      setLoading(false)
      return
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Todos los ítems deben tener un producto cargado.")
      setLoading(false)
      return
    }

    if (items.some((item) => !item.product_id)) {
      setError("Todos los productos deben existir en el catálogo.")
      setLoading(false)
      return
    }

    if (items.some((item) => item.quantity <= 0)) {
      setError("Todas las cantidades deben ser mayores a 0.")
      setLoading(false)
      return
    }

    const supabase = createClient()

    const productIds = items
      .map((item) => item.product_id)
      .filter((value): value is string => Boolean(value))

    if (productIds.length > 0) {
      const { data: currentProducts, error: productsError } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("company_id", userId)
        .in("id", productIds)

      if (productsError) {
        setError("No se pudo validar el stock disponible.")
        setLoading(false)
        return
      }

      const stockMap = new Map(
        (currentProducts || []).map((product) => [
          product.id,
          {
            name: product.name,
            stock: Number(product.stock || 0),
          },
        ]),
      )

      for (const item of items) {
        if (!item.product_id) continue

        const product = stockMap.get(item.product_id)

        if (!product) {
          setError(`No se encontró el producto "${item.description}" en el catálogo.`)
          setLoading(false)
          return
        }

        if (item.quantity > product.stock) {
          setError(
            `No hay stock suficiente para "${product.name}". Disponible: ${product.stock}.`,
          )
          setLoading(false)
          return
        }
      }
    }

    const { data: remito, error: remitoError } = await supabase
      .from("remitos")
      .insert({
        company_id: userId,
        client_id: selectedClientId || null,
        number: nextNumber,
        date,
        client_name: clientName,
        client_cuit: clientCuit || null,
        client_address: clientAddress || null,
        total: calculateTotal(),
      })
      .select()
      .single()

    if (remitoError) {
      setError(remitoError.message)
      setLoading(false)
      return
    }

    const { error: itemsError } = await supabase.from("remito_items").insert(
      items.map((item) => ({
        remito_id: remito.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    )

    if (itemsError) {
      setError(itemsError.message)
      setLoading(false)
      return
    }

    for (const item of items) {
      if (!item.product_id) continue

      const matchedProduct = products.find((product) => product.id === item.product_id)
      if (!matchedProduct) continue

      const newStock = Number(matchedProduct.stock || 0) - item.quantity

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.product_id)
        .eq("company_id", userId)

      if (stockError) {
        setError("El pedido se guardó, pero no se pudo actualizar el stock.")
        setLoading(false)
        return
      }
    }

    router.push(`/dashboard/remitos/${remito.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Pedido
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                #{nextNumber}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Número sugerido
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Cliente
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {clientName.trim() ? "Seleccionado" : "Pendiente"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Datos de facturación y entrega
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Productos
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {totalProductos}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {totalUnidades} unidades cargadas
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Fecha
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {date ? new Date(date).toLocaleDateString("es-AR") : "-"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Registro del pedido
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Datos del cliente</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seleccioná el cliente y completá la información comercial del pedido.
          </p>
        </div>

        <div className="px-5 py-5">
          <FieldGroup>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="clientName">Cliente *</FieldLabel>
                <Input
                  id="clientName"
                  list="clients-suggestions"
                  type="text"
                  placeholder="Buscá o escribí el nombre del cliente"
                  value={clientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  required
                />
                <datalist id="clients-suggestions">
                  {clientOptions.map((client) => (
                    <option key={client.id} value={client.name} />
                  ))}
                </datalist>
              </Field>

              <Field>
                <FieldLabel htmlFor="date">Fecha *</FieldLabel>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="clientCuit">CUIT</FieldLabel>
                <Input
                  id="clientCuit"
                  type="text"
                  placeholder="XX-XXXXXXXX-X"
                  value={clientCuit}
                  onChange={(e) => setClientCuit(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="clientAddress">Dirección</FieldLabel>
                <Input
                  id="clientAddress"
                  type="text"
                  placeholder="Dirección del cliente"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Productos del pedido</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Agregá productos, cantidades, precios y validá stock antes de guardar.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="rounded-md"
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar producto
          </Button>
        </div>

        <div className="px-5 py-5">
          <div className="space-y-3">
            <div className="hidden border-b border-border/60 pb-2 text-sm font-medium text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-4">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2">Cantidad</div>
              <div className="col-span-2">Precio unitario</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1" />
            </div>

            {items.map((item, index) => {
              const availableStock = getItemStock(item.product_id)

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-background p-4 sm:grid sm:grid-cols-12 sm:items-start sm:gap-4"
                >
                  <div className="space-y-3 sm:col-span-5 sm:space-y-0">
                    <label className="text-sm text-muted-foreground sm:hidden">Producto</label>
                    <Input
                      list={`products-suggestions-${index}`}
                      placeholder="Seleccioná un producto"
                      value={item.description}
                      onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                      required
                    />
                    <datalist id={`products-suggestions-${index}`}>
                      {productOptions.map((product) => (
                        <option key={product.id} value={product.name} />
                      ))}
                    </datalist>

                    {item.product_id ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Stock disponible: {availableStock ?? 0}
                      </p>
                    ) : item.description.trim() ? (
                      <p className="mt-1 text-xs text-destructive">
                        Este producto no existe en el catálogo.
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:col-span-2 sm:mt-0 sm:block">
                    <div>
                      <label className="text-sm text-muted-foreground sm:hidden">Cantidad</label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Cant."
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", parseInt(e.target.value, 10) || 0)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:col-span-2 sm:mt-0 sm:block">
                    <div>
                      <label className="text-sm text-muted-foreground sm:hidden">
                        Precio unitario
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Precio"
                        value={item.unit_price || ""}
                        onChange={(e) =>
                          updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3 sm:col-span-2 sm:mt-0 sm:text-right">
                    <label className="text-sm text-muted-foreground sm:hidden">Subtotal</label>
                    <p className="pt-2 font-medium text-foreground sm:pt-2.5">
                      $
                      {(item.quantity * item.unit_price).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="mt-3 flex justify-end sm:col-span-1 sm:mt-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="rounded-md text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {totalProductos} productos · {totalUnidades} unidades
            </div>

            <div className="rounded-lg bg-muted/30 px-4 py-3 text-right">
              <p className="text-sm text-muted-foreground">Total del pedido</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                $
                {calculateTotal().toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          size="sm"
          className="rounded-md"
        >
          Volver
        </Button>

        <Button type="submit" size="sm" disabled={loading} className="rounded-md">
          {loading ? <Spinner className="mr-2" /> : null}
          {loading ? "Guardando..." : `Guardar pedido #${nextNumber}`}
        </Button>
      </div>
    </form>
  )
}