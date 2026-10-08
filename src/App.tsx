import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LogOutIcon, StoreIcon } from "lucide-react"
import { useSesion } from "@/caracteristicas/autenticacion/hooks/useSesion"
import { useCerrarSesion } from "@/caracteristicas/autenticacion/hooks/useLogout"
import { SinConexion } from "@/componentes/comunes/SinConexion"
import { Button } from "@/componentes/ui/button"
import { cn } from "@/lib/utils"
import { menu } from "@/rutas/navegacion"

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

  function cerrar() {
    void cerrarSesion.mutateAsync().finally(() => navegar("/login"))
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <StoreIcon className="size-4" />
        </div>
        <span className="font-heading text-sm font-medium">Papelería</span>
      </div>
      <nav
        className="flex flex-1 flex-col gap-1 overflow-auto px-2 py-2"
        aria-label="Menú principal"
      >
        {menu.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            end={item.ruta === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )
            }
          >
            <item.icono className="size-4 shrink-0" aria-hidden />
            {item.etiqueta}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-3">
        <div className="mb-2 px-1">
          <p className="text-sm font-medium">{usuario}</p>
          {rol ? (
            <p className="text-xs text-muted-foreground">{etiquetasRol[rol] ?? rol}</p>
          ) : null}
        </div>
        <Button
          variant="outline"
          className="w-full"
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
      <main className="min-w-0 flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}