import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientForm } from "@/components/client-form"

interface EditarClientePageProps {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: EditarClientePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("company_id", user.id)
    .single()

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar Cliente</h1>
        <p className="text-muted-foreground">Modificá los datos del cliente</p>
      </div>
      <ClientForm client={client} userId={user.id} />
    </div>
  )
}
