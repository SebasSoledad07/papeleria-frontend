import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { Compra, EntradaCompra } from "@/api/tipos"

// Entrada de mercancía (RF-14, RN-23). Actualiza stock y costo promedio.
export function useRegistrarCompra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entrada: EntradaCompra) =>
      apiPost<Compra>("/api/inventario/compras", entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
      void queryClient.invalidateQueries({ queryKey: ["producto-codigo"] })
    },
  })
}