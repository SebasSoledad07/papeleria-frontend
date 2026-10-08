import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPut } from "@/api/cliente"
import type { EntradaProveedor, Proveedor } from "@/api/tipos"
import { claveProveedores } from "./useProveedores"

interface Params {
  id: number
  entrada: EntradaProveedor
}

export function useEditarProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, entrada }: Params) =>
      apiPut<Proveedor>(`/api/proveedor/${id}`, entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveProveedores })
    },
  })
}