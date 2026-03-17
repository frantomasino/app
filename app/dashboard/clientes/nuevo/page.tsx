import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientForm } from "@/components/client-form"

export default async function NuevoClientePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-5">
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-foreground">
            Nuevo cliente
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cargá la información principal para sumar un nuevo cliente a tu base comercial.
          </p>
        </div>

        <div className="px-5 py-5">
          <ClientForm userId={user.id} />
        </div>
      </section>
    </div>
  )
}