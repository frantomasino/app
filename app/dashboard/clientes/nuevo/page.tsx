import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientForm } from "@/components/client-form"

export default async function NuevoClientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Cliente</h1>
        <p className="text-muted-foreground">Agregá un nuevo cliente a tu lista</p>
      </div>
      <ClientForm userId={user.id} />
    </div>
  )
}
