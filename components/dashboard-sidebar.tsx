"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Company } from "@/lib/types"
import {
  Building2,
  Home,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Wallet,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react"

interface DashboardSidebarProps {
  company: Company | null
}

interface SidebarItem {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
  badge?: string
}

const operationItems: SidebarItem[] = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Pedidos", href: "/dashboard/remitos", icon: ShoppingCart },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "Productos", href: "/dashboard/productos", icon: Package },
]

const analysisItems: SidebarItem[] = [
  { name: "Reportes", icon: BarChart3, disabled: true, badge: "Próx." },
  { name: "Caja", icon: Wallet, disabled: true, badge: "Próx." },
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
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/60">
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge ? (
                  <span className="rounded-full border border-sidebar-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/70">
                    {item.badge}
                  </span>
                ) : null}
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
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70",
                )}
              />
              <span className="flex-1">{item.name}</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-opacity",
                  isActive
                    ? "text-sidebar-primary-foreground/80"
                    : "opacity-0 text-sidebar-foreground/50 group-hover:opacity-100",
                )}
              />
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
    <aside className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          {company?.logo_url ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-white">
              <Image
                src={company.logo_url}
                alt={company?.name || "Logo de la empresa"}
                width={44}
                height={44}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sidebar-foreground">
              <Building2 className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-primary">
              ERP comercial
            </p>
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {company?.name || "Mi negocio"}
            </p>
          </div>
        </Link>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-2xl border border-sidebar-border bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary/15 text-sidebar-primary">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">
                Panel de operación
              </p>
              <p className="mt-1 text-xs leading-5 text-sidebar-foreground/70">
                Pedidos, clientes y productos en una sola vista de trabajo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-5">
        <div className="space-y-6">
          <div>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              Operación
            </p>
            <SidebarList items={operationItems} pathname={pathname} />
          </div>

          <div>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              Análisis
            </p>
            <SidebarList items={analysisItems} pathname={pathname} />
          </div>

          <div>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              Sistema
            </p>
            <SidebarList items={systemItems} pathname={pathname} />
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="rounded-2xl border border-sidebar-border bg-white/5 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
            Estado del producto
          </p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/70">
            Próximos módulos: reportes, caja y seguimiento financiero.
          </p>
        </div>
      </div>
    </aside>
  )
}