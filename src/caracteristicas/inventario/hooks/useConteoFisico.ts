import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { ConteoFisicoResultado, LineaConteo } from "@/api/tipos"

// Conteo físico en una sola sesión (RF-18, RN-46).
export function useConteoFisico() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lineas: LineaConteo[]) =>
      apiPost<ConteoFisicoResultado>("/api/inventario/conteo-fisico", {
        lineas,
      }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
    },
  })
}