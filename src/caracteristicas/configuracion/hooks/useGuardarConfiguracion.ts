import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPut } from "@/api/cliente"
import type { Configuracion } from "@/api/tipos"
import { claveConfiguracion } from "./useConfiguracion"

export function useGuardarConfiguracion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: Record<string, string>) =>
      apiPut<Configuracion[]>("/api/configuracion", valores),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveConfiguracion })
    },
  })
}