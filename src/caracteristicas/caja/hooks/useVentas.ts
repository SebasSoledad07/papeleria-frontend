import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Venta } from "@/api/tipos"

export function useVentas(filtros: {
  desde?: string
  hasta?: string
  consecutivo?: number
}) {
  const params = new URLSearchParams()
  if (filtros.desde) params.set("desde", filtros.desde)
  if (filtros.hasta) params.set("hasta", filtros.hasta)
  if (filtros.consecutivo) params.set("consecutivo", String(filtros.consecutivo))
  const qs = params.toString()
  return useQuery({
    queryKey: ["ventas", qs],
    queryFn: () =>
      apiGet<Venta[]>(`/api/venta${qs ? `?${qs}` : ""}`),
  })
}