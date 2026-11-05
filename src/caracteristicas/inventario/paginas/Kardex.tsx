import { useParams } from "react-router-dom"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table"
import { useKardex } from "../hooks/useKardex"

export function Kardex() {
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : null
  const kardex = useKardex(id)

  if (kardex.isPending) return <PantallaCarga />

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Kárdex"
        descripcion="Movimientos de inventario del producto."
      />
      {kardex.isError ? <AvisoError error={kardex.error} /> : null}
      {!kardex.data || kardex.data.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Aún no hay movimientos.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Stock resultante</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kardex.data.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{new Date(m.fecha).toLocaleString("es-CO")}</TableCell>
                <TableCell>{m.tipo}</TableCell>
                <TableCell>{m.cantidad}</TableCell>
                <TableCell>{m.stockResultante}</TableCell>
                <TableCell>{m.usuarioNombre ?? m.usuarioId}</TableCell>
                <TableCell>{m.referencia ?? ""}</TableCell>
                <TableCell>{m.motivo ?? ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}