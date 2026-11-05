import { NavLink } from "react-router-dom"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  PackageIcon,
  SettingsIcon,
  TagsIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react"
import type { Rol } from "@/api/tipos"
import { useSesion } from "@/caracteristicas/autenticacion"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { buttonVariants } from "@/componentes/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componentes/ui/card"
import { cn } from "@/lib/utils"

interface Acceso {
  ruta: string
  titulo: string
  descripcion: string
  icono: typeof PackageIcon
  roles: Rol[]
  tono: string
}

const accesos: Acceso[] = [
  {
    ruta: "/productos",
    titulo: "Productos",
    descripcion: "Catálogo, precios, códigos y existencias.",
    icono: PackageIcon,
    roles: ["ADMIN", "CAJERO", "BODEGUERO"],
    tono: "bg-primary/10 text-primary",
  },
  {
    ruta: "/categorias",
    titulo: "Categorías",
    descripcion: "Clasifica los productos de la papelería.",
    icono: TagsIcon,
    roles: ["ADMIN"],
    tono: "bg-chart-2/20 text-foreground",
  },
  {
    ruta: "/proveedores",
    titulo: "Proveedores",
    descripcion: "Describe cómo llega cada producto.",
    icono: TruckIcon,
    roles: ["ADMIN"],
    tono: "bg-success/10 text-success",
  },
  {
    ruta: "/usuarios",
    titulo: "Usuarios",
    descripcion: "Personas que usan el sistema y su rol.",
    icono: UsersIcon,
    roles: ["ADMIN"],
    tono: "bg-chart-4/10 text-chart-4",
  },
  {
    ruta: "/configuracion",
    titulo: "Configuración",
    descripcion: "Parámetros generales del negocio.",
    icono: SettingsIcon,
    roles: ["ADMIN"],
    tono: "bg-muted text-muted-foreground",
  },
]

export function Panel() {
  const sesion = useSesion()
  const nombre = sesion.data?.nombre ?? "de nuevo"
  const rol = sesion.data?.rol
  const visibles = accesos.filter((acceso) => rol && acceso.roles.includes(rol))

  return (
    <div className="space-y-8">
      <PaginaTitulo
        titulo="Panel"
        descripcion="Gestiona el catálogo, el equipo y la configuración del negocio."
      />

      <section className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-20 -right-16 size-64 rotate-12 rounded-[2rem] border border-primary-foreground/15"
          aria-hidden
        />

        <div className="relative max-w-xl space-y-2">
          <p className="text-[0.65rem] font-medium tracking-[0.14em] uppercase opacity-75">
            Papelería
          </p>
          <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
            Hola, {nombre}.
          </h2>
          <p className="text-sm leading-relaxed opacity-80">
            Todo lo que necesitas para mantener tu inventario y tu equipo en
            orden, desde un solo lugar.
          </p>
          <div className="pt-2">
            <NavLink
              to="/productos"
              className={buttonVariants({ variant: "secondary" })}
            >
              Ver productos
              <ArrowRightIcon className="size-4" aria-hidden />
            </NavLink>
          </div>
        </div>
      </section>

      {visibles.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Accesos rápidos</h2>
            <span className="text-xs text-muted-foreground">
              {visibles.length} {visibles.length === 1 ? "sección" : "secciones"}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((acceso) => (
              <NavLink key={acceso.ruta} to={acceso.ruta} className="group">
                <Card className="h-full transition-colors hover:bg-accent/30 hover:ring-primary/25">
                  <CardHeader>
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        acceso.tono,
                      )}
                    >
                      <acceso.icono className="size-5" aria-hidden />
                    </div>
                    <CardTitle className="mt-3 flex items-center justify-between gap-2">
                      {acceso.titulo}
                      <ArrowUpRightIcon
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                    </CardTitle>
                    <CardDescription>{acceso.descripcion}</CardDescription>
                  </CardHeader>
                </Card>
              </NavLink>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
