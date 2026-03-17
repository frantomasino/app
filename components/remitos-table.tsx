"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Receipt, Search, ArrowUpRight } from "lucide-react"
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

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function RemitosTable({ remitos }: RemitosTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")

  const counts = useMemo(() => {
    return {
      all: remitos.length,
      confirmed: remitos.filter((r) => r.status === "confirmed").length,
      cancelled: remitos.filter((r) => r.status === "cancelled").length,
    }
  }, [remitos])

  const filteredRemitos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return remitos.filter((remito) => {
      const matchesStatus =
        statusFilter === "all" ? true : remito.status === statusFilter

      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : remito.client_name.toLowerCase().includes(normalizedSearch) ||
            String(remito.number).includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [remitos, search, statusFilter])

  const filters: {
    key: StatusFilter
    label: string
    count: number
  }[] = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "confirmed", label: "Vigentes", count: counts.confirmed },
    { key: "cancelled", label: "Cancelados", count: counts.cancelled },
  ]

  return (
    <section className="rounded-2xl border border-border/70 bg-card">
      <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => {
              const isActive = statusFilter === filter.key

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-background text-foreground hover:bg-muted/50",
                  )}
                >
                  <span>{filter.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px]",
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
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente o pedido"
                className="h-10 w-full rounded-xl border border-border/70 bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
              />
            </div>

            <Button asChild size="sm">
              <Link href="/dashboard/remitos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo pedido
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {filteredRemitos.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRemitos.map((remito) => {
              const isCancelled = remito.status === "cancelled"

              return (
                <TableRow key={remito.id}>
                  <TableCell className="font-semibold text-foreground">
                    #{remito.number}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/dashboard/remitos/${remito.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {remito.client_name}
                    </Link>
                  </TableCell>

                  <TableCell>
                    {isCancelled ? (
                      <Badge variant="destructive">Cancelado</Badge>
                    ) : (
                      <Badge className="border-0 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
                        Vigente
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right text-muted-foreground">
                    {formatDateOnly(remito.date)}
                  </TableCell>

                  <TableCell className="text-right font-semibold text-foreground">
                    ${formatCurrency(remito.total)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/remitos/${remito.id}`}>
                        Ver
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-foreground">
            No hay pedidos para mostrar
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Probá cambiando el filtro, la búsqueda o cargando un nuevo pedido.
          </p>

          <div className="mt-5">
            <Button asChild size="sm">
              <Link href="/dashboard/remitos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Crear pedido
              </Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}