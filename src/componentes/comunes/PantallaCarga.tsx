import { LoaderCircleIcon } from "lucide-react"

export function PantallaCarga() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}