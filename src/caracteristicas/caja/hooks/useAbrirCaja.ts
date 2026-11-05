import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { Caja, EntradaCaja } from "@/api/tipos"

export function useAbrirCaja() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entrada: EntradaCaja) =>
      apiPost<Caja>("/api/caja/abrir", entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["caja-abierta"] })
    },
  })
}