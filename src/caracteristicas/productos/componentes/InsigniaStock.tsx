import { Badge } from "@/componentes/ui/badge"

interface Props {
  stock: number
  stockMinimo: number | null
}

// Muestra el estado de stock con color y texto (no solo color).
export function InsigniaStock({ stock, stockMinimo }: Props) {
  if (stock <= 0) {
    return <Badge variant="destructive">Agotado</Badge>
  }
  if (stockMinimo != null && stockMinimo > 0 && stock <= stockMinimo) {
    return <Badge variant="outline">Stock bajo</Badge>
  }
  return <Badge variant="secondary">Disponible</Badge>
}
