"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

interface CompanyFormProps {
  company: Company | null
  userId: string
}

export function CompanyForm({ company, userId }: CompanyFormProps) {
  const [name, setName] = useState(company?.name || "")
  const [cuit, setCuit] = useState(company?.cuit || "")
  const [address, setAddress] = useState(company?.address || "")
  const [phone, setPhone] = useState(company?.phone || "")
  const [email, setEmail] = useState(company?.email || "")
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || "")
  const [imageError, setImageError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    if (!name.trim()) {
      setError("El nombre de la empresa es obligatorio")
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error } = await supabase.from("companies").upsert(
      {
        id: userId,
        name: name.trim(),
        cuit: cuit.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        logo_url: logoUrl.trim() || null,
      },
      {
        onConflict: "id",
      },
    )

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Datos de la empresa</CardTitle>
        <CardDescription>Estos datos aparecerán en tus remitos.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre de la empresa *</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Mi Empresa S.A."
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
              <p className="mt-1 text-xs text-muted-foreground">Opcional.</p>
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Dirección</FieldLabel>
              <Input
                id="address"
                type="text"
                placeholder="Av. Principal 123, Ciudad"
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
                  placeholder="contacto@miempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="logoUrl">URL del Logo</FieldLabel>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://ejemplo.com/logo.png"
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value)
                  setImageError(false)
                }}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ingresá la URL pública de tu logo. Aparecerá en los PDFs de tus remitos.
              </p>
            </Field>

            {logoUrl.trim() ? (
              <div className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-medium">Vista previa del logo</p>

                {!imageError ? (
                  <div className="flex min-h-[120px] items-center justify-center rounded-md bg-muted/30 p-4">
                    <Image
                      src={logoUrl}
                      alt="Logo de la empresa"
                      width={220}
                      height={120}
                      className="h-auto max-h-[120px] w-auto object-contain"
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-sm text-destructive">
                    No se pudo mostrar el logo. Revisá que la URL sea pública y apunte directo a una imagen.
                  </div>
                )}
              </div>
            ) : null}
          </FieldGroup>

          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

          {success ? (
            <Alert className="mt-4 border-green-200 bg-green-50 text-green-900">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Los datos de tu empresa se guardaron correctamente.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            Guardar cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}