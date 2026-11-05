import { LoaderCircleIcon } from "lucide-react"

export function PantallaCarga() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex size-11 items-center justify-center rounded-full border border-border bg-card">
        <LoaderCircleIcon className="size-5 animate-spin text-primary" />
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
