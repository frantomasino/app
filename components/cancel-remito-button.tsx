"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { Ban } from "lucide-react"

interface CancelRemitoButtonProps {
  remitoId: string
  remitoNumber: number
  status: "confirmed" | "cancelled"
}

export function CancelRemitoButton({
  remitoId,
  remitoNumber,
  status,
}: CancelRemitoButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: items, error: itemsError } = await supabase
      .from("remito_items")
      .select("product_id, quantity")
      .eq("remito_id", remitoId)

    if (itemsError) {
      console.error("Error loading remito items:", itemsError)
      setLoading(false)
      return
    }

    const productIds = (items || [])
      .map((item) => item.product_id)
      .filter((value): value is string => Boolean(value))

    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, stock")
        .in("id", productIds)

      if (productsError) {
        console.error("Error loading products:", productsError)
        setLoading(false)
        return
      }

      const stockMap = new Map(
        (products || []).map((product) => [product.id, Number(product.stock || 0)]),
      )

      for (const item of items || []) {
        if (!item.product_id) continue

        const currentStock = stockMap.get(item.product_id) ?? 0
        const quantity = Number(item.quantity || 0)
        const newStock = currentStock + quantity

        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id)

        if (stockError) {
          console.error("Error restoring stock:", stockError)
          setLoading(false)
          return
        }

        stockMap.set(item.product_id, newStock)
      }
    }

    const { error: cancelError } = await supabase
      .from("remitos")
      .update({ status: "cancelled" })
      .eq("id", remitoId)

    if (cancelError) {
      console.error("Error cancelling remito:", cancelError)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (status === "cancelled") {
    return (
      <Button variant="outline" size="sm" disabled className="rounded-md">
        <Ban className="mr-2 h-4 w-4" />
        Venta cancelada
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-md">
          <Ban className="mr-2 h-4 w-4" />
          Cancelar venta
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar venta?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por cancelar la <strong>Venta #{remitoNumber}</strong>. La venta quedará en el
            historial y se devolverá el stock de los productos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            Confirmar cancelación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}