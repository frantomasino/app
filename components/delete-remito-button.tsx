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
import { Trash2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface DeleteRemitoButtonProps {
  remitoId: string
  remitoNumber: number
}

export function DeleteRemitoButton({ remitoId, remitoNumber }: DeleteRemitoButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
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

    const { error } = await supabase
      .from("remitos")
      .delete()
      .eq("id", remitoId)

    if (error) {
      console.error("Error deleting remito:", error)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
    router.push("/dashboard/remitos")
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por eliminar la <strong>Venta #{remitoNumber}</strong>. Esta acción no se puede deshacer y devolverá el stock de los productos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <Spinner className="mr-2" /> : null}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}