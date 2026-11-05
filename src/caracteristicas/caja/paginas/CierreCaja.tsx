import { useState } from "react"
import type { Caja } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import { formatearDinero } from "@/lib/formato"
import { useCajaAbierta } from "../hooks/useCajaAbierta"
import { useCerrarCaja } from "../hooks/useCerrarCaja"

export function CierreCaja() {
  const caja = useCajaAbierta()
  const cerrar = useCerrarCaja()
  const [contado, setContado] = useState("")
  const [resultado, setResultado] = useState<Caja | null>(null)

  async function enviar() {
    if (!caja.data) return
    try {
      const r = await cerrar.mutateAsync({
        id: caja.data.id,
        entrada: { efectivoContado: Number(contado) || 0 },
      })
      setResultado(r)
    } catch {
      // error abajo
    }
  }

  if (caja.isPending) return <PantallaCarga />

  if (caja.isError || !caja.data) {
    return (
      <div className="space-y-6">
        <PaginaTitulo titulo="Cierre de caja" descripcion="No hay caja abierta." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Cierre de caja"
        descripcion="Cuenta el efectivo y confirma (RF-29, RN-41)."
      />
      {cerrar.isError ? <AvisoError error={cerrar.error} /> : null}
      {resultado ? (
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <p>Efectivo esperado: {formatearDinero(Number(resultado.baseEfectivo))}</p>
          <p>Efectivo contado: {formatearDinero(Number(resultado.efectivoContado))}</p>
          <p>Diferencia: {formatearDinero(Number(resultado.diferencia))}</p>
        </div>
      ) : (
        <div className="max-w-sm space-y-3">
          <label className="text-sm font-medium" htmlFor="contado">
            Efectivo contado
          </label>
          <Input
            id="contado"
            inputMode="numeric"
            value={contado}
            onChange={(e) => setContado(e.target.value.replace(/\D/g, ""))}
          />
          <Button disabled={cerrar.isPending} onClick={() => void enviar()}>
            {cerrar.isPending ? "Cerrando…" : "Cerrar caja"}
          </Button>
        </div>
      )}
    </div>
  )
}