"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff, FileText } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/sign-up-success`
        : undefined

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          company_name: companyName,
        },
      },
    })

    if (error) {
      let errorMessage = "Ocurrió un error al crear la cuenta."

      if (error.message.includes("User already registered")) {
        errorMessage = "Ya existe una cuenta registrada con ese email."
      } else if (
        error.message.includes("Password should be at least") ||
        error.message.includes("Password is too short")
      ) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres."
      } else if (error.message.includes("Unable to validate email address")) {
        errorMessage = "Ingresá un email válido."
      } else if (error.message.includes("email rate limit exceeded")) {
        errorMessage = "Se alcanzó el límite de envíos de email. Probá de nuevo más tarde."
      }

      setError(errorMessage)
      setLoading(false)
      return
    }

    window.location.href = "/auth/sign-up-success"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Registrate para empezar a crear remitos</CardDescription>
        </CardHeader>

        <form onSubmit={handleSignUp}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="companyName">Nombre de la empresa</FieldLabel>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Mi Empresa S.A."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
            </FieldGroup>

            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Crear cuenta
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}