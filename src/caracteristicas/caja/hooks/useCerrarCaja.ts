import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { Caja, CierreCaja } from "@/api/tipos"

export function useCerrarCaja() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: { id: number; entrada: CierreCaja }) =>
      apiPost<Caja>(`/api/caja/${datos.id}/cerrar`, datos.entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["caja-abierta"] })
    },
  })
}