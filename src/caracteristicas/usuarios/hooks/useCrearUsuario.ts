import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { EntradaUsuario, Usuario } from "@/api/tipos"
import { claveUsuarios } from "./useUsuarios"

export function useCrearUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entrada: EntradaUsuario) =>
      apiPost<Usuario>("/api/usuario", entrada),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveUsuarios })
    },
  })
}