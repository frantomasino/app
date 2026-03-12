"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

type RemitoRow = {
  id: string
  number: number
  client_name: string
  total: number | string
  date: string
  status: "confirmed" | "cancelled" | string
}

interface RemitosTableProps {
  remitos: RemitoRow[]
}

type StatusFilter = "all" | "confirmed" | "cancelled"

function formatDateOnly(dateString: string) {
  const [year, month, day] = dateString.split("-")
  return `${day}/${month}/${year}`
}

export function RemitosTable({ remitos }: RemitosTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filteredRemitos = useMemo(() => {
    if (statusFilter === "all") return remitos
    return remitos.filter((remito) => remito.status === statusFilter)
  }, [remitos, statusFilter])

  const counts = useMemo(() => {
    return {
      all: remitos.length,
      confirmed: remitos.filter((r) => r.status === "confirmed").length,
      cancelled: remitos.filter((r) => r.status === "cancelled").length,
    }
  }, [remitos])

  const filters: {
    key: StatusFilter
    label: string
    count: number
  }[] = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "confirmed", label: "Confirmados", count: counts.confirmed },
    { key: "cancelled", label: "Cancelados", count: counts.cancelled },
  ]

  return (
    <section className="border border-border/60 bg-card">
      <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Listado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial completo de operaciones cargadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const isActive = statusFilter === filter.key

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-background text-foreground hover:bg-muted/50",
                )}
              >
                <span>{filter.label}</span>
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 text-[10px]",
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {filter.count}
                </span>
              </button>
            )
          })}

          <Button asChild variant="outline" size="sm" className="rounded-md">
            <Link href="/dashboard/remitos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Crear registro
            </Link>
          </Button>
        </div>
      </div>

      {filteredRemitos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="border-b border-border/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Registro
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Cliente
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Estado
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Total
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Fecha
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRemitos.map((remito) => {
                const isCancelled = remito.status === "cancelled"

                return (
                  <tr
                    key={remito.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/remitos/${remito.id}`}
                        className="block font-semibold text-foreground hover:underline"
                      >
                        #{remito.number}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-foreground">
                      <Link
                        href={`/dashboard/remitos/${remito.id}`}
                        className="block hover:underline"
                      >
                        {remito.client_name}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <Link href={`/dashboard/remitos/${remito.id}`} className="block">
                        {isCancelled ? (
                          <Badge variant="destructive">Cancelado</Badge>
                        ) : (
                          <Badge className="border-0 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
                            Confirmado
                          </Badge>
                        )}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-foreground">
                      <Link
                        href={`/dashboard/remitos/${remito.id}`}
                        className="block hover:underline"
                      >
                        ${Number(remito.total).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-right text-muted-foreground">
                      <Link
                        href={`/dashboard/remitos/${remito.id}`}
                        className="block hover:underline"
                      >
                        {formatDateOnly(remito.date)}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-foreground">
            No hay registros para este estado
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Probá cambiando el filtro o creando un nuevo registro.
          </p>

          <div className="mt-5">
            <Button asChild size="sm" className="rounded-md">
              <Link href="/dashboard/remitos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Crear registro
              </Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}