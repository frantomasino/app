import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompanyForm } from "@/components/company-form"

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error cargando empresa:", error)
  }

  const hasCompanyData = !!company
  const hasLogo = !!company?.logo_url
  const hasFiscalData = !!company?.name && !!company?.cuit
  const hasContactData = !!company?.phone || !!company?.email || !!company?.address

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            Sistema comercial
          </p>
          <h1 className="mt-1 text-[1.7rem] font-semibold tracking-[-0.035em] text-foreground">
            Configuración del negocio
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Definí los datos comerciales, fiscales y visuales que se usarán en pedidos, documentos y reportes.
          </p>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Negocio
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {hasCompanyData ? company?.name || "Configurado" : "Pendiente"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Estado general de la cuenta
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Datos fiscales
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {hasFiscalData ? "Completos" : "Incompletos"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nombre fiscal y CUIT
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Contacto
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {hasContactData ? "Disponible" : "Pendiente"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Teléfono, email o dirección
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Identidad visual
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {hasLogo ? "Logo cargado" : "Sin logo"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Imagen usada en documentos
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Datos del negocio</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta información se mostrará en pedidos, PDFs, impresiones y documentos comerciales.
          </p>
        </div>

        <div className="px-5 py-5">
          <CompanyForm company={company} userId={user.id} />
        </div>
      </section>
    </div>
  )
}