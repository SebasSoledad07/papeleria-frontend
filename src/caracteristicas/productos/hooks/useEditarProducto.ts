import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPut } from "@/api/cliente"
import type { EntradaProducto, Producto } from "@/api/tipos"

interface Params {
  id: number
  entrada: EntradaProducto
}

// Edición de producto (RF-05); el cambio de precio queda en el historial del
// backend cuando el valor cambia (RN-07).
export function useEditarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, entrada }: Params) =>
      apiPut<Producto>(`/api/producto/${id}`, entrada),
    onSettled: (_datos, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
      void queryClient.invalidateQueries({ queryKey: ["producto", id] })
      void queryClient.invalidateQueries({ queryKey: ["producto-codigo"] })
    },
  })
}