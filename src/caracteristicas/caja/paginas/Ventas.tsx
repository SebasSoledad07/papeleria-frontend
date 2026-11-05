import { useState } from "react"
import { Link } from "react-router-dom"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import { formatearDinero } from "@/lib/formato"
import { useVentas } from "../hooks/useVentas"

export function Ventas() {
  const [consecutivo, setConsecutivo] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [filtros, setFiltros] = useState<{
    desde?: string
    hasta?: string
    consecutivo?: number
  }>({})

  const ventas = useVentas(filtros)

  if (ventas.isPending) return <PantallaCarga />

  return (
    <div className="space-y-6">
      <PaginaTitulo titulo="Ventas" descripcion="Consulta de ventas registradas." />
      {ventas.isError ? <AvisoError error={ventas.error} /> : null}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Consecutivo"
          value={consecutivo}
          onChange={(e) => setConsecutivo(e.target.value.replace(/\D/g, ""))}
        />
        <Input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
        <Input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
        <Button
          onClick={() =>
            setFiltros({
              consecutivo: consecutivo ? Number(consecutivo) : undefined,
              desde: desde || undefined,
              hasta: hasta || undefined,
            })
          }
        >
          Buscar
        </Button>
      </div>
      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Cajero</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {(ventas.data ?? []).map((v) => (
              <tr key={v.id} className="border-b last:border-0">
                <td className="p-2">{v.consecutivo}</td>
                <td className="p-2">{new Date(v.fecha).toLocaleString("es-CO")}</td>
                <td className="p-2">{v.usuarioNombre}</td>
                <td className="p-2 text-right">{formatearDinero(v.total)}</td>
                <td className="p-2">{v.estado}</td>
                <td className="p-2">
                  <Link to={`/ventas/${v.id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}