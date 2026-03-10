import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RemitoForm } from "@/components/remito-form"

export default async function NuevoRemitoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", user.id)
    .order("name", { ascending: true })

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("company_id", user.id)
    .order("name", { ascending: true })

  const { data: lastRemito } = await supabase
    .from("remitos")
    .select("number")
    .eq("company_id", user.id)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = lastRemito ? lastRemito.number + 1 : 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva venta</h1>
        <p className="text-muted-foreground">Creá una nueva venta para tu cliente</p>
      </div>

      <RemitoForm
        userId={user.id}
        clients={clients || []}
        products={products || []}
        nextNumber={nextNumber}
      />
    </div>
  )
}