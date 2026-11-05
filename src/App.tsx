import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LogOutIcon, StoreIcon } from "lucide-react"
import { useSesion } from "@/caracteristicas/autenticacion/hooks/useSesion"
import { useCerrarSesion } from "@/caracteristicas/autenticacion/hooks/useLogout"
import { SinConexion } from "@/componentes/comunes/SinConexion"
import { Button } from "@/componentes/ui/button"
import { cn } from "@/lib/utils"
import { menuPorRol } from "@/rutas/navegacion"

const etiquetasRol: Record<string, string> = {
  ADMIN: "Administrador",
  CAJERO: "Cajero",
  BODEGUERO: "Bodeguero",
}

function BarraLateral() {
  const navegar = useNavigate()
  const sesion = useSesion()
  const cerrarSesion = useCerrarSesion()
  const usuario = sesion.data?.nombre ?? "Usuario"
  const rol = sesion.data?.rol
  const elementos = menuPorRol(rol)
  const inicial = usuario.trim().charAt(0).toUpperCase() || "U"

  function cerrar() {
    void cerrarSesion.mutateAsync().finally(() => navegar("/login"))
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <StoreIcon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-base leading-tight font-semibold">
            Papelería
          </p>
          <p className="text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
            Inventario y ventas
          </p>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 overflow-auto px-2 py-2"
        aria-label="Menú principal"
      >
        <p className="px-3 pb-1 text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Menú
        </p>
        {elementos.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            end={item.ruta === "/"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 h-4 w-0.5 rounded-full bg-primary transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
                <item.icono className="size-4 shrink-0" aria-hidden />
                {item.etiqueta}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 flex items-center gap-2.5 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {inicial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{usuario}</p>
            {rol ? (
              <p className="text-xs text-muted-foreground">
                {etiquetasRol[rol] ?? rol}
              </p>
            ) : null}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={cerrarSesion.isPending}
          onClick={cerrar}
        >
          <LogOutIcon className="size-4" aria-hidden />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}

export default function App() {
  return (
    <div className="flex min-h-dvh bg-background">
      <SinConexion />
      <BarraLateral />
      <main className="min-w-0 flex-1 overflow-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
