import { FileQuestionIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "cn"
import { buttonVariants } from "@/componentes/ui/button"

export function NoEncontrado() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileQuestionIcon className="size-5" aria-hidden />
        </div>
        <p className="mt-4 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Error 404
        </p>
        <h1 className="mt-1 font-heading text-xl font-medium">
          Página no encontrada
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          La dirección que buscas no existe o fue movida.
        </p>
        <Link to="/" className={cn(buttonVariants(), "mt-6")}>
          Volver al panel
        </Link>
      </div>
    </div>
  )
}
