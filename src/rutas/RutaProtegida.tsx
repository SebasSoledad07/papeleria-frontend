import type { ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import type { Rol } from "@/api/tipos"
import { SinPermiso } from "@/caracteristicas/errores/paginas/SinPermiso"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { useSesion } from "@/caracteristicas/autenticacion/hooks/useSesion"

interface Props {
  /** Roles con acceso. Sin este prop solo exige estar autenticado. */
  roles?: Rol[]
  children?: ReactNode
}

export function RutaProtegida({ roles, children }: Props) {
  const ubicacion = useLocation()
  const sesion = useSesion()

  if (sesion.isPending) return <PantallaCarga />

  if (sesion.isError) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  if (roles && !(sesion.data && roles.includes(sesion.data.rol))) {
    return <SinPermiso />
  }

  return <>{children ?? <Outlet />}</>
}
