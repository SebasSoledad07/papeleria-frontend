import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  TagsIcon,
  BarChart3Icon,
  ReceiptIcon,
  ShoppingCartIcon,
  SlidersHorizontalIcon,
  TruckIcon,
  UsersIcon,
  WarehouseIcon,
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
  {
    ruta: "/productos",
    etiqueta: "Productos",
    icono: PackageIcon,
    roles: ["ADMIN", "CAJERO", "BODEGUERO"],
  },
  {
    ruta: "/caja",
    etiqueta: "Caja",
    icono: ShoppingCartIcon,
    roles: ["ADMIN", "CAJERO"],
  },
  {
    ruta: "/ventas",
    etiqueta: "Ventas",
    icono: ReceiptIcon,
    roles: ["ADMIN", "CAJERO"],
  },
  {
    ruta: "/reportes",
    etiqueta: "Reportes",
    icono: BarChart3Icon,
    roles: ["ADMIN", "BODEGUERO"],
  },
  {
    ruta: "/inventario/compras",
    etiqueta: "Inventario",
    icono: WarehouseIcon,
    roles: ["ADMIN", "BODEGUERO"],
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
  {
    ruta: "/preferencias",
    etiqueta: "Preferencias",
    icono: SlidersHorizontalIcon,
    roles: ["ADMIN", "CAJERO", "BODEGUERO"],
  },
]

export function menuPorRol(rol: Rol | undefined): ElementoMenu[] {
  if (!rol) return []
  return menu.filter((item) => item.roles.includes(rol))
}
