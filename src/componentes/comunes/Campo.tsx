import type { ReactNode } from "react"
import { Label } from "@/componentes/ui/label"

interface Props {
  etiqueta: string
  htmlPara?: string
  error?: string
  children: ReactNode
}

export function Campo({ etiqueta, htmlPara, error, children }: Props) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlPara}>{etiqueta}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}