import { useState } from "react"
import type { Producto } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"

import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import { CampoCodigo } from "@/escaner/CampoCodigo"
import { apiGet } from "@/api/cliente"
import {
  useAjusteNegativo,
  useAjustePositivo,
} from "../hooks/useAjusteInventario"

const MOTIVOS = [
  "CONTEO_FISICO",
  "PRODUCTO_DANADO",
  "PERDIDA",
  "VENCIMIENTO",
  "OTRO",
]

export function Ajustes() {
  const positivo = useAjustePositivo()
  const negativo = useAjusteNegativo()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState("")
  const [tipo, setTipo] = useState<"entrada" | "salida">("entrada")
  const [motivo, setMotivo] = useState(MOTIVOS[0])
  const [otroMotivo, setOtroMotivo] = useState("")
  const [aviso, setAviso] = useState<string | null>(null)

  async function agregarProducto(codigo: string) {
    try {
      const prod = await apiGet<Producto>(
        `/api/producto/codigo/${encodeURIComponent(codigo)}`,
      )
      setProducto(prod)
      setAviso(null)
    } catch {
      setAviso("Producto no registrado.")
    }
  }

  async function enviar() {
    if (!producto) return
    const cant = Number(cantidad.replace(/\D/g, ""))
    if (cant <= 0) return
    const motivoFinal = motivo === "OTRO" ? otroMotivo.trim() : motivo
    if (!motivoFinal) return
    try {
      if (tipo === "entrada") {
        await positivo.mutateAsync({
          productoId: producto.id,
          cantidad: cant,
          motivo: motivoFinal,
        })
      } else {
        await negativo.mutateAsync({
          productoId: producto.id,
          cantidad: cant,
          motivo: motivoFinal,
        })
      }
      setAviso("Ajuste aplicado.")
      setCantidad("")
    } catch {
      // error abajo
    }
  }

  const mutacion = tipo === "entrada" ? positivo : negativo

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Ajuste de inventario"
        descripcion="Corrige el stock por conteo, daño, pérdida o vencimiento (RF-16)."
      />
      {mutacion.isError ? <AvisoError error={mutacion.error} /> : null}
      {aviso ? (
        <p role="status" className="text-sm text-muted-foreground">{aviso}</p>
      ) : null}

      <div>
        <label className="text-sm font-medium" htmlFor="escaneo">
          Escanear producto
        </label>
        <CampoCodigo
          id="escaneo"
          marcador="Escanea o escribe el código…"
          onCodigo={(codigo) => void agregarProducto(codigo)}
        />
      </div>

      {producto ? (
        <div className="rounded-xl border bg-card p-4">
          <p className="font-medium">{producto.nombre}</p>
          <p className="text-sm text-muted-foreground">
            Stock actual: {producto.stock}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <div className="mt-1 flex gap-2">
            <Button
              variant={tipo === "entrada" ? "default" : "outline"}
              size="sm"
              onClick={() => setTipo("entrada")}
            >
              Entrada (+)
            </Button>
            <Button
              variant={tipo === "salida" ? "default" : "outline"}
              size="sm"
              onClick={() => setTipo("salida")}
            >
              Salida (−)
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="cantidad">
            Cantidad
          </label>
          <Input
            id="cantidad"
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="motivo">
            Motivo
          </label>
          <select
            id="motivo"
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-2 py-1 text-sm"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            {MOTIVOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        {motivo === "OTRO" ? (
          <div>
            <label className="text-sm font-medium" htmlFor="otro">
              Descripción
            </label>
            <Input
              id="otro"
              value={otroMotivo}
              onChange={(e) => setOtroMotivo(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!producto || mutacion.isPending}
          onClick={() => void enviar()}
        >
          {mutacion.isPending ? "Aplicando…" : "Aplicar ajuste"}
        </Button>
      </div>
    </div>
  )
}