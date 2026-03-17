"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Building2, Phone, ImageIcon } from "lucide-react"

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
      setError("El nombre del negocio es obligatorio.")
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
      }
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4.5 w-4.5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Información general</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Datos principales que identifican al negocio en el sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <FieldGroup>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Nombre del negocio *</FieldLabel>
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
              </Field>

              <Field className="lg:col-span-2">
                <FieldLabel htmlFor="address">Dirección</FieldLabel>
                <Input
                  id="address"
                  type="text"
                  placeholder="Av. Principal 123, Ciudad"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-4.5 w-4.5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Contacto comercial</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Información que puede aparecer en documentos y comunicaciones.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <FieldGroup>
            <div className="grid gap-4 lg:grid-cols-2">
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
          </FieldGroup>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="h-4.5 w-4.5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Identidad visual</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Logo utilizado en pedidos, PDF e impresiones.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="logoUrl">URL del logo</FieldLabel>
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
            </Field>

            {logoUrl.trim() ? (
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                {!imageError ? (
                  <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-border/60 bg-background p-4">
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
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    No se pudo cargar la imagen. Revisá la URL del logo.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Todavía no cargaste un logo para el negocio.
                </p>
              </div>
            )}
          </FieldGroup>
        </div>
      </section>

      {error ? (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription>
            Los datos del negocio se guardaron correctamente.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button type="submit" size="sm" disabled={loading} className="rounded-md">
          {loading ? <Spinner className="mr-2" /> : null}
          {loading ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </form>
  )
}