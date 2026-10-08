import type { Rol } from "@/api/tipos"

const opciones: { valor: Rol; etiqueta: string }[] = [
  { valor: "ADMIN", etiqueta: "Administrador" },
  { valor: "CAJERO", etiqueta: "Cajero" },
  { valor: "BODEGUERO", etiqueta: "Bodeguero" },
]

interface Props {
  id?: string
  value: Rol
  onChange: (rol: Rol) => void
}

export function SelectorRol({ id, value, onChange }: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(evento) => onChange(evento.target.value as Rol)}
      className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    >
      {opciones.map((opcion) => (
        <option key={opcion.valor} value={opcion.valor}>
          {opcion.etiqueta}
        </option>
      ))}
    </select>
  )
}