import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSesion } from "@/caracteristicas/autenticacion/hooks/useSesion"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"

export function RutaProtegida() {
  const ubicacion = useLocation()
  const sesion = useSesion()

  if (sesion.isPending) return <PantallaCarga />

  if (sesion.isError) {
    return (
      <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
    )
  }

  return <Outlet />
}