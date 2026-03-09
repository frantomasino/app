"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Client, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Trash2 } from "lucide-react"

interface RemitoItem {
  id: string
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
    { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 },
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
        unitPrice: Number(product.price_1 || 0),
      })),
    [products],
  )

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof RemitoItem, value: string | number) => {
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
          description: value,
          unit_price: matchedProduct ? matchedProduct.unitPrice : item.unit_price,
        }
      }),
    )
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!clientName.trim()) {
      setError("El nombre del cliente es requerido")
      setLoading(false)
      return
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Todos los items deben tener una descripción")
      setLoading(false)
      return
    }

    const supabase = createClient()

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

    router.push(`/dashboard/remitos/${remito.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
            <CardDescription>
              Buscá un cliente cargado escribiendo su nombre o completá los datos manualmente
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="clientName">Nombre *</FieldLabel>
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
                  <FieldLabel htmlFor="clientCuit">CUIT</FieldLabel>
                  <Input
                    id="clientCuit"
                    type="text"
                    placeholder="XX-XXXXXXXX-X"
                    value={clientCuit}
                    onChange={(e) => setClientCuit(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Items del remito</CardTitle>
                <CardDescription>
                  Agregá los productos o servicios. Si el producto existe en tu catálogo, se sugerirá mientras escribís.
                </CardDescription>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Agregar item
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="hidden text-sm font-medium text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-4">
                <div className="col-span-5">Descripción</div>
                <div className="col-span-2">Cantidad</div>
                <div className="col-span-2">Precio unit.</div>
                <div className="col-span-2 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4 sm:rounded-none sm:border-0 sm:p-0"
                >
                  <div className="sm:col-span-5">
                    <label className="text-sm text-muted-foreground sm:hidden">Descripción</label>
                    <Input
                      list={`products-suggestions-${index}`}
                      placeholder="Descripción del item"
                      value={item.description}
                      onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                      required
                    />
                    <datalist id={`products-suggestions-${index}`}>
                      {productOptions.map((product) => (
                        <option key={product.id} value={product.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-1">
                    <div>
                      <label className="text-sm text-muted-foreground sm:hidden">Cantidad</label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Cant."
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-1">
                    <div>
                      <label className="text-sm text-muted-foreground sm:hidden">Precio unit.</label>
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

                  <div className="sm:col-span-2 text-right">
                    <label className="text-sm text-muted-foreground sm:hidden">Subtotal</label>
                    <p className="font-medium">
                      $
                      {(item.quantity * item.unit_price).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="flex justify-end sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end border-t pt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">
                    $
                    {calculateTotal().toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Crear Remito #{nextNumber}
            </Button>

            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}