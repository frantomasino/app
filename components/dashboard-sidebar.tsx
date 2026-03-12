"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Company } from "@/lib/types"
import {
  Building2,
  Home,
  FileText,
  Users,
  Package,
  BarChart3,
  Wallet,
  Settings,
} from "lucide-react"

interface DashboardSidebarProps {
  company: Company | null
}

interface SidebarItem {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

const operationItems: SidebarItem[] = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Ventas", href: "/dashboard/remitos", icon: FileText },
  { name: "Contactos", href: "/dashboard/clientes", icon: Users },
  { name: "Inventario", href: "/dashboard/productos", icon: Package },
]

const analysisItems: SidebarItem[] = [
  { name: "Reportes", icon: BarChart3, disabled: true },
  { name: "Caja", icon: Wallet, disabled: true },
]

const systemItems: SidebarItem[] = [
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

function SidebarList({
  items,
  pathname,
}: {
  items: SidebarItem[]
  pathname: string
}) {
  return (
    <ul role="list" className="space-y-1">
      {items.map((item) => {
        if (item.disabled || !item.href) {
          return (
            <li key={item.name}>
              <div className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground/70">
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.name}</span>
                <span className="text-[10px] uppercase tracking-[0.08em]">
                  Próx.
                </span>
              </div>
            </li>
          )
        }

        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href))

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground",
                )}
              />
              <span>{item.name}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function DashboardSidebar({ company }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/60 bg-background">
      <div className="border-b border-border/60 px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          {company?.logo_url ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-white">
              <Image
                src={company.logo_url}
                alt={company?.name || "Logo de la empresa"}
                width={36}
                height={36}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Scarlo
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {company?.name || "Mi Empresa"}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          <div>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Operación
            </p>
            <SidebarList items={operationItems} pathname={pathname} />
          </div>

          <div>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Análisis
            </p>
            <SidebarList items={analysisItems} pathname={pathname} />
          </div>

          <div>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Sistema
            </p>
            <SidebarList items={systemItems} pathname={pathname} />
          </div>
        </div>
      </nav>

      <div className="border-t border-border/60 px-4 py-3">
        <p className="text-xs text-muted-foreground">Panel comercial</p>
      </div>
    </aside>
  )
}