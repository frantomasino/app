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

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Configurá los datos de tu empresa</p>
      </div>

      <CompanyForm company={company} userId={user.id} />
    </div>
  )
}