"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Company } from "@/lib/types"
import { FileText, Users, Settings, Home, Package } from "lucide-react"

interface DashboardSidebarProps {
  company: Company | null
}

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Productos", href: "/dashboard/productos", icon: Package },
  { name: "Remitos", href: "/dashboard/remitos", icon: FileText },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

export function DashboardSidebar({ company }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center border-b">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          {company?.logo_url ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white">
              <Image
                src={company.logo_url}
                alt={company?.name || "Logo de la empresa"}
                width={40}
                height={40}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
          )}

          <span className="truncate font-semibold text-foreground max-w-[160px]">
            {company?.name || "Mi Empresa"}
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}