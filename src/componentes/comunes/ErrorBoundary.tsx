import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { AlertTriangleIcon } from "lucide-react"
import { Button } from "@/componentes/ui/button"

interface Props {
  children: ReactNode
}

interface Estado {
  huboError: boolean
}

export class ErrorBoundary extends Component<Props, Estado> {
  state: Estado = { huboError: false }

  static getDerivedStateFromError(): Estado {
    return { huboError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info)
  }

  render() {
    if (this.state.huboError) {
      return (
        <div className="flex min-h-dvh items-center justify-center p-6">
          <div className="max-w-md space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangleIcon className="size-5" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold">Algo salió mal</h1>
              <p className="text-sm text-muted-foreground">
                Recarga la página para continuar trabajando.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>Recargar</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
