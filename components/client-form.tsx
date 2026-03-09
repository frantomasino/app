"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Client } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

interface ClientFormProps {
  client?: Client
  userId: string
}

export function ClientForm({ client, userId }: ClientFormProps) {
  const [name, setName] = useState(client?.name || "")
  const [cuit, setCuit] = useState(client?.cuit || "")
  const [address, setAddress] = useState(client?.address || "")
  const [phone, setPhone] = useState(client?.phone || "")
  const [email, setEmail] = useState(client?.email || "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isEditing = !!client

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    if (isEditing) {
      const { error } = await supabase
        .from("clients")
        .update({
          name,
          cuit: cuit || null,
          address: address || null,
          phone: phone || null,
          email: email || null,
        })
        .eq("id", client.id)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("clients")
        .insert({
          company_id: userId,
          name,
          cuit: cuit || null,
          address: address || null,
          phone: phone || null,
          email: email || null,
        })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push("/dashboard/clientes")
    router.refresh()
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar cliente" : "Nuevo cliente"}</CardTitle>
        <CardDescription>
          {isEditing ? "Modificá los datos del cliente" : "Completá los datos del nuevo cliente"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre *</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Nombre del cliente o empresa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cuit">CUIT</FieldLabel>
              <Input
                id="cuit"
                type="text"
                placeholder="XX-XXXXXXXX-X"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="address">Dirección</FieldLabel>
              <Input
                id="address"
                type="text"
                placeholder="Dirección del cliente"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            {isEditing ? "Guardar cambios" : "Crear cliente"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
