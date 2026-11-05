import type { ReactNode } from "react"

interface Props {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}

export function PaginaTitulo({ titulo, descripcion, acciones }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{descripcion}</p>
        ) : null}
      </header>
      {acciones}
    </div>
  )
}
