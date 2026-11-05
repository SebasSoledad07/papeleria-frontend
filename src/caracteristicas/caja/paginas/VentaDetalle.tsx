import { useState } from "react"
import { PrinterIcon } from "lucide-react"
import { useParams } from "react-router-dom"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import { formatearDinero } from "@/lib/formato"
import { useAnularVenta } from "../hooks/useAnularVenta"
import { useVenta } from "../hooks/useVenta"

export function VentaDetalle() {
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : null
  const venta = useVenta(id)
  const anular = useAnularVenta()
  const [motivo, setMotivo] = useState("")
  const [confirmando, setConfirmando] = useState(false)

  if (venta.isPending) return <PantallaCarga />
  if (venta.isError || !venta.data) {
    return (
      <div className="space-y-6">
        <PaginaTitulo titulo="Venta" descripcion="No encontrada." />
        {venta.isError ? <AvisoError error={venta.error} /> : null}
      </div>
    )
  }

  const v = venta.data

  async function enviarAnulacion() {
    if (!id) return
    try {
      await anular.mutateAsync({ id, motivo })
      setConfirmando(false)
      setMotivo("")
    } catch {
      // error abajo
    }
  }

  function reimprimir() {
    if (!id) return
    window.open(`/api/venta/${id}/tirilla`, "_blank")
  }

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo={`Venta #${v.consecutivo}`}
        descripcion={v.estado}
      />
      {anular.isError ? <AvisoError error={anular.error} /> : null}
      <div className="space-y-1 text-sm">
        <p>Fecha: {new Date(v.fecha).toLocaleString("es-CO")}</p>
        <p>Cajero: {v.usuarioNombre}</p>
        <p>Cliente: {v.clienteNombre ?? "—"}</p>
        <p>Subtotal: {formatearDinero(v.subtotal)}</p>
        <p>Descuento: {formatearDinero(v.descuentoTotal)}</p>
        <p>IVA: {formatearDinero(v.ivaTotal)}</p>
        <p>Total: {formatearDinero(v.total)}</p>
        <p>Cambio: {formatearDinero(v.cambio)}</p>
      </div>
      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-right">Cant.</th>
              <th className="p-2 text-right">Precio</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {v.detalle.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="p-2">{d.productoNombre}</td>
                <td className="p-2 text-right">{d.cantidad}</td>
                <td className="p-2 text-right">{formatearDinero(d.precioUnitario)}</td>
                <td className="p-2 text-right">{formatearDinero(d.totalLinea)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reimprimir}>
          <PrinterIcon className="size-4" aria-hidden />
          Reimprimir tirilla
        </Button>
        {v.estado !== "ANULADA" ? (
          <Button variant="destructive" onClick={() => setConfirmando(true)}>
            Anular
          </Button>
        ) : null}
      </div>
      {confirmando ? (
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <label className="text-sm font-medium" htmlFor="motivo">
            Motivo de anulación
          </label>
          <Input
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button
              disabled={anular.isPending || !motivo.trim()}
              onClick={() => void enviarAnulacion()}
            >
              {anular.isPending ? "Anulando…" : "Confirmar anulación"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}