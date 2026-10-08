import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { EntradaProveedor, Proveedor } from "@/api/tipos"
import { claveProveedores } from "./useProveedores"

export function useCrearProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entrada: EntradaProveedor) =>
      apiPost<Proveedor>("/api/proveedor", entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveProveedores })
    },
  })
}