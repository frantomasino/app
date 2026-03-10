"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const supabase = createClient()

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/update-password`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      let errorMessage = "No se pudo enviar el enlace de recuperación."

      if (error.message.includes("Unable to validate email address")) {
        errorMessage = "Ingresá un email válido."
      } else if (error.message.includes("email rate limit exceeded")) {
        errorMessage = "Se alcanzó el límite de envíos de email. Probá de nuevo más tarde."
      }

      setError(errorMessage)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar contraseña</CardTitle>
          <CardDescription>
            Te vamos a enviar un enlace para cambiar tu contraseña.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleReset}>
          <CardContent>
            <FieldGroup>
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
            </FieldGroup>

            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

            {success ? (
              <Alert className="mt-4 border-green-200 bg-green-50 text-green-900">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Si el email existe, te enviamos un enlace para restablecer la contraseña.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Enviar enlace
            </Button>

            <Link href="/auth/login" className="text-sm text-primary hover:underline">
              Volver al login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}