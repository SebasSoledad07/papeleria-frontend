import { Input } from "@/componentes/ui/input"

interface Props {
  id?: string
  valor: string
  onChange: (valor: string) => void
  marcador?: string
  deshabilitado?: boolean
  autoFocus?: boolean
  className?: string
}

// Dinero siempre como entero COP en el frontend (RN-03): acepta solo dígitos,
// sin puntos de miles ni decimales.
export function CampoDinero({
  id,
  valor,
  onChange,
  marcador,
  deshabilitado,
  autoFocus,
  className,
}: Props) {
  return (
    <Input
      id={id}
      className={className}
      inputMode="numeric"
      autoComplete="off"
      placeholder={marcador}
      value={valor}
      disabled={deshabilitado}
      autoFocus={autoFocus}
      onChange={(evento) => onChange(evento.target.value.replace(/\D/g, ""))}
    />
  )
}