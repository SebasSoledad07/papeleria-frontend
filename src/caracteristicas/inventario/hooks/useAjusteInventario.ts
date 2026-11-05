import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"

// Ajuste positivo de stock con motivo obligatorio (RF-16, RN-22).
export function useAjustePositivo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: { productoId: number; cantidad: number; motivo: string }) =>
      apiPost<void>(
        `/api/inventario/${datos.productoId}/ajuste-positivo`,
        { cantidad: datos.cantidad, motivo: datos.motivo },
      ),
    onSettled: (_d, _e, datos) => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
      void queryClient.invalidateQueries({ queryKey: ["producto", datos.productoId] })
      void queryClient.invalidateQueries({ queryKey: ["kardex", datos.productoId] })
    },
  })
}

// Ajuste negativo de stock con motivo obligatorio (RF-16, RN-22).
export function useAjusteNegativo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: { productoId: number; cantidad: number; motivo: string }) =>
      apiPost<void>(
        `/api/inventario/${datos.productoId}/ajuste-negativo`,
        { cantidad: datos.cantidad, motivo: datos.motivo },
      ),
    onSettled: (_d, _e, datos) => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
      void queryClient.invalidateQueries({ queryKey: ["producto", datos.productoId] })
      void queryClient.invalidateQueries({ queryKey: ["kardex", datos.productoId] })
    },
  })
}