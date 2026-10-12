import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboardIcon,
  SettingsIcon,
  TagsIcon,
  TruckIcon,
  UsersIcon,
} from "lucide-react"
import type { Rol } from "@/api/tipos"

export interface ElementoMenu {
  ruta: string
  etiqueta: string
  icono: LucideIcon
  roles: Rol[]
}

// El menú es comodidad: solo lista las pantallas ya construidas y oculta las
// que el rol no puede usar. El backend vuelve a validar cada petición.
export const menu: ElementoMenu[] = [
  {
    ruta: "/",
    etiqueta: "Panel",
    icono: LayoutDashboardIcon,
    roles: ["ADMIN", "CAJERO", "BODEGUERO"],
  },
  { ruta: "/usuarios", etiqueta: "Usuarios", icono: UsersIcon, roles: ["ADMIN"] },
  {
    ruta: "/categorias",
    etiqueta: "Categorías",
    icono: TagsIcon,
    roles: ["ADMIN"],
  },
  {
    ruta: "/proveedores",
    etiqueta: "Proveedores",
    icono: TruckIcon,
    roles: ["ADMIN"],
  },
  {
    ruta: "/configuracion",
    etiqueta: "Configuración",
    icono: SettingsIcon,
    roles: ["ADMIN"],
  },
]

export function menuPorRol(rol: Rol | undefined): ElementoMenu[] {
  if (!rol) return []
  return menu.filter((item) => item.roles.includes(rol))
}
