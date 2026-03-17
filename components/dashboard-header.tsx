"use client"

import { useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ShoppingCart,
  Users,
  Settings,
  Home,
  Menu,
  LogOut,
  User,
  Package,
  Building2,
  ChevronRight,
} from "lucide-react"

interface DashboardHeaderProps {
  company: Company | null
}

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Productos", href: "/dashboard/productos", icon: Package },
  { name: "Pedidos", href: "/dashboard/remitos", icon: ShoppingCart },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

const pageTitles: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/productos": "Productos",
  "/dashboard/remitos": "Pedidos",
  "/dashboard/clientes": "Clientes",
  "/dashboard/configuracion": "Configuración",
}

export function DashboardHeader({ company }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const currentPageTitle = useMemo(() => {
    const matchedEntry =
      Object.entries(pageTitles)
        .filter(([key]) => pathname === key || pathname.startsWith(`${key}/`))
        .sort((a, b) => b[0].length - a[0].length)[0] ?? null

    return matchedEntry?.[1] ?? "Panel comercial"
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-lg border border-border/70 lg:hidden"
              >
                <Menu className="h-4.5 w-4.5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72 border-r border-border/70 p-0">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

              <div className="flex h-full flex-col bg-background">
                <div className="border-b border-border/70 px-4 py-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3"
                    onClick={() => setOpen(false)}
                  >
                    {company?.logo_url ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-white">
                        <img
                          src={company.logo_url}
                          alt={company?.name || "Logo de la empresa"}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                        ERP comercial
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {company?.name || "Mi negocio"}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="px-3 py-3">
                  <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Navegación
                  </p>
                </div>

                <nav className="flex-1 px-3 pb-4">
                  <ul role="list" className="space-y-1">
                    {navigation.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href))

                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-4.5 w-4.5 shrink-0",
                                isActive ? "text-primary-foreground" : "text-muted-foreground",
                              )}
                              aria-hidden="true"
                            />
                            <span className="flex-1">{item.name}</span>
                            {isActive ? <ChevronRight className="h-3.5 w-3.5" /> : null}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:block">
              Workspace
            </p>
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {currentPageTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden min-w-0 rounded-lg border border-border/70 bg-muted/20 px-3 py-1.5 lg:block">
            <p className="truncate text-xs font-medium text-foreground">
              {company?.name || "Mi negocio"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full border border-border/70"
              >
                <User className="h-4.5 w-4.5" />
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 rounded-xl">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {company?.name || "Mi negocio"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {company?.email || "Sistema comercial"}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/dashboard/configuracion" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}