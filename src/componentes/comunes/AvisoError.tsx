import { mensajeDeError } from "@/api/errores"

export function AvisoError({ error }: { error: unknown }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
    >
      No se pudieron cargar los datos: {mensajeDeError(error)}
    </div>
  )
}