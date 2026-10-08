import { NavLink } from "react-router-dom"
import {
  SettingsIcon,
  TagsIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componentes/ui/card"

const accesos = [
  {
    ruta: "/usuarios",
    titulo: "Usuarios",
    descripcion: "Personas que usan el sistema y su rol.",
    icono: UsersIcon,
  },
  {
    ruta: "/categorias",
    titulo: "Categorías",
    descripcion: "Clasifica los productos de la papelería.",
    icono: TagsIcon,
  },
  {
    ruta: "/proveedores",
    titulo: "Proveedores",
    descripcion: "Describe cómo llega cada producto.",
    icono: TruckIcon,
  },
  {
    ruta: "/configuracion",
    titulo: "Configuración",
    descripcion: "Parámetros generales del negocio.",
    icono: SettingsIcon,
  },
]

export function Panel() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Panel</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona usuarios, catálogo y la configuración del negocio.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accesos.map((acceso) => (
          <NavLink key={acceso.ruta} to={acceso.ruta}>
            <Card className="h-full transition-colors hover:bg-accent/40">
              <CardHeader>
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <acceso.icono className="size-4" aria-hidden />
                </div>
                <CardTitle className="mt-2">{acceso.titulo}</CardTitle>
                <CardDescription>{acceso.descripcion}</CardDescription>
              </CardHeader>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  )
}