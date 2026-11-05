import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"

export function useAnularVenta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: { id: number; motivo: string }) =>
      apiPost<void>(`/api/venta/${datos.id}/anular`, { motivo: datos.motivo }),
    onSettled: (_d, _e, datos) => {
      void queryClient.invalidateQueries({ queryKey: ["venta", datos.id] })
      void queryClient.invalidateQueries({ queryKey: ["ventas"] })
    },
  })
}