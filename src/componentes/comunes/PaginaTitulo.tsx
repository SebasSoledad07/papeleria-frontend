import type { ReactNode } from "react"

interface Props {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}

export function PaginaTitulo({ titulo, descripcion, acciones }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">{titulo}</h1>
        {descripcion ? (
          <p className="text-sm text-muted-foreground">{descripcion}</p>
        ) : null}
      </header>
      {acciones}
    </div>
  )
}