"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff } from "lucide-react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      let errorMessage = "No se pudo actualizar la contraseña."

      if (
        error.message.includes("Password should be at least") ||
        error.message.includes("Password is too short")
      ) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres."
      } else if (
        error.message.includes("expired") ||
        error.message.includes("invalid") ||
        error.message.includes("otp_expired")
      ) {
        errorMessage = "El enlace para cambiar la contraseña es inválido o venció."
      }

      setError(errorMessage)
      setLoading(false)
      return
    }

    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nueva contraseña</CardTitle>
          <CardDescription>
            Ingresá tu nueva contraseña para continuar.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleUpdatePassword}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? (
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

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Guardar nueva contraseña
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}