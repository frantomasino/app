"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Eye,
  EyeOff,
  Store,
  Users,
  Package,
  Receipt,
  ArrowRight,
} from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      let errorMessage = "No pudimos iniciar sesión. Intentá nuevamente."

      if (error.message === "Invalid login credentials") {
        errorMessage = "El email o la contraseña no son correctos."
      }

      setError(errorMessage)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center p-4 lg:p-6">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[1.1fr_480px]">
          <section className="hidden lg:block">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
                <Store className="h-4 w-4 text-primary" />
                ERP comercial simple para comercios
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-foreground xl:text-5xl">
                  Gestioná pedidos, clientes y productos desde un solo sistema
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  Una plataforma comercial simple para ordenar la operación diaria,
                  controlar el negocio y trabajar con más claridad.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Receipt className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    Pedidos y ventas
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Registrá operaciones y seguí cada movimiento comercial.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    Clientes
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Organizá tu base comercial y mantené todo centralizado.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    Productos
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Controlá catálogo, stock y precios desde un solo lugar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Card className="mx-auto w-full max-w-md border-border/60 shadow-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
                  <Store className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  Ingresar al sistema
                </CardTitle>
                <CardDescription>
                  Accedé a tu panel comercial para continuar operando.
                </CardDescription>
              </div>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@comercio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Olvidé mi contraseña
                      </Link>
                    </div>

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
                        {showPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                </FieldGroup>

                {error ? (
                  <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                ) : null}
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Spinner className="mr-2" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {loading ? "Ingresando..." : "Entrar al panel"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿Todavía no tenés cuenta?{" "}
                  <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                    Crear cuenta
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}