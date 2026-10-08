import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboardIcon,
  SettingsIcon,
  TagsIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react"

export interface ElementoMenu {
  ruta: string
  etiqueta: string
  icono: LucideIcon
}

export const menu: ElementoMenu[] = [
  { ruta: "/", etiqueta: "Panel", icono: LayoutDashboardIcon },
  { ruta: "/usuarios", etiqueta: "Usuarios", icono: UsersIcon },
  { ruta: "/categorias", etiqueta: "Categorías", icono: TagsIcon },
  { ruta: "/proveedores", etiqueta: "Proveedores", icono: TruckIcon },
  { ruta: "/configuracion", etiqueta: "Configuración", icono: SettingsIcon },
]