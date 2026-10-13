import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { EntradaProducto, Producto } from "@/api/tipos"

// Alta de producto (RF-01, RN-13/RN-15/RN-16).
export function useCrearProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entrada: EntradaProducto) =>
      apiPost<Producto>("/api/producto", entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
      void queryClient.invalidateQueries({ queryKey: ["producto-codigo"] })
    },
  })
}