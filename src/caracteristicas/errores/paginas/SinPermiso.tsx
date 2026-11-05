import { ShieldXIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "cn"
import { buttonVariants } from "@/componentes/ui/button"

export function SinPermiso() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldXIcon className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 font-heading text-xl font-medium">
          No tienes permiso
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu rol no puede acceder a esta sección. Si necesitas entrar, pide a un
          administrador que revise tus permisos.
        </p>
        <Link to="/" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
          Ir al panel
        </Link>
      </div>
    </div>
  )
}
