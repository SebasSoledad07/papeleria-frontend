import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { EntradaVenta, Venta } from "@/api/tipos"

export function useConfirmarVenta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entrada: EntradaVenta) =>
      apiPost<Venta>("/api/venta", entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["ventas"] })
      void queryClient.invalidateQueries({ queryKey: ["caja-abierta"] })
    },
  })
}