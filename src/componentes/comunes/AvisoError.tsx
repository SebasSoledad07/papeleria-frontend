import { AlertTriangleIcon } from "lucide-react"
import { mensajeDeError } from "@/api/errores"

export function AvisoError({ error }: { error: unknown }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
    >
      <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>No se pudieron cargar los datos: {mensajeDeError(error)}</p>
    </div>
  )
}
