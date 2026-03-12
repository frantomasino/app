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

  return (
    <div className="space-y-4">
      <section className="border border-border/60 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <h1 className="text-[1.65rem] font-semibold tracking-[-0.025em] text-foreground">
            Configuración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Datos comerciales y fiscales de la empresa.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-3">
          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Empresa
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {hasCompanyData ? company?.name || "Configurada" : "Pendiente"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Estado general
            </p>
          </div>

          <div className="border-b border-border/60 px-5 py-4 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Datos fiscales
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {hasFiscalData ? "Completos" : "Incompletos"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nombre y CUIT
            </p>
          </div>

          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Logo
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {hasLogo ? "Cargado" : "Sin logo"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Identidad visual
            </p>
          </div>
        </div>
      </section>

      <section className="border border-border/60 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Datos de la empresa</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Información que se mostrará en documentos y registros.
          </p>
        </div>

        <div className="px-5 py-5">
          <CompanyForm company={company} userId={user.id} />
        </div>
      </section>
    </div>
  )
}