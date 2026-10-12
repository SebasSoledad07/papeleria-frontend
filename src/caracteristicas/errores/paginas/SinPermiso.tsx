import { ShieldXIcon } from "lucide-react"

export function SinPermiso() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <ShieldXIcon className="size-5" aria-hidden />
        </div>
        <h1 className="mt-3 font-heading text-lg font-medium">
          No tienes permiso
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu rol no puede acceder a esta sección.
        </p>
      </div>
    </div>
  )
}
