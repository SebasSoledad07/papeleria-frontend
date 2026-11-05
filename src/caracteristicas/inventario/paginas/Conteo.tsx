import { useState } from "react"
import type { Producto } from "@/api/tipos"
import { apiGet } from "@/api/cliente"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"

import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table"
import { CampoCodigo } from "@/escaner/CampoCodigo"

import { useConteoFisico } from "../hooks/useConteoFisico"

interface LineaConteoLocal {
  productoId: number
  nombre: string
  codigoBarras: string
  stockSistema: number
  cantidadContada: number
}

export function Conteo() {
  const conteo = useConteoFisico()
  const [lineas, setLineas] = useState<LineaConteoLocal[]>([])
  const [confirmando, setConfirmando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  async function agregarProducto(codigo: string) {
    try {
      const producto = await apiGet<Producto>(
        `/api/producto/codigo/${encodeURIComponent(codigo)}`,
      )
      setLineas((actuales) => {
        const existe = actuales.find((l) => l.productoId === producto.id)
        if (existe) {
          return actuales.map((l) =>
            l.productoId === producto.id
              ? { ...l, cantidadContada: l.cantidadContada + 1 }
              : l,
          )
        }
        return [
          ...actuales,
          {
            productoId: producto.id,
            nombre: producto.nombre,
            codigoBarras: producto.codigoBarras,
            stockSistema: producto.stock,
            cantidadContada: 1,
          },
        ]
      })
      setAviso(null)
    } catch {
      setAviso("Producto no registrado.")
    }
  }

  function actualizarConteo(productoId: number, valor: string) {
    const cantidad = Number(valor.replace(/\D/g, ""))
    setLineas((actuales) =>
      actuales.map((l) =>
        l.productoId === productoId ? { ...l, cantidadContada: cantidad } : l,
      ),
    )
  }

  async function confirmar() {
    try {
      const resultado = await conteo.mutateAsync(
        lineas.map((l) => ({
          productoId: l.productoId,
          cantidadContada: l.cantidadContada,
        })),
      )
      setAviso(`Conteo aplicado: ${resultado.ajustesAplicados} ajustes.`)
      setLineas([])
      setConfirmando(false)
    } catch {
      // error abajo
    }
  }

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Conteo físico"
        descripcion="Escanea los productos y registra la cantidad contada (RF-18)."
      />
      {conteo.isError ? <AvisoError error={conteo.error} /> : null}
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

      {lineas.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Aún no hay productos contados.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Sistema</TableHead>
              <TableHead>Contado</TableHead>
              <TableHead>Diferencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineas.map((linea) => (
              <TableRow key={linea.productoId}>
                <TableCell>{linea.nombre}</TableCell>
                <TableCell className="font-mono text-xs">
                  {linea.codigoBarras}
                </TableCell>
                <TableCell>{linea.stockSistema}</TableCell>
                <TableCell>
                  <Input
                    inputMode="numeric"
                    value={String(linea.cantidadContada)}
                    onChange={(e) =>
                      actualizarConteo(linea.productoId, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  {linea.cantidadContada - linea.stockSistema}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {lineas.length > 0 ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setConfirmando(true)}>
            Finalizar conteo
          </Button>
        </div>
      ) : null}

      {confirmando ? (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <p className="font-medium">Confirmar conteo físico</p>
          <p className="text-sm text-muted-foreground">
            Se generarán ajustes por las diferencias mostradas.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmando(false)}>
              Volver
            </Button>
            <Button
              disabled={conteo.isPending}
              onClick={() => void confirmar()}
            >
              {conteo.isPending ? "Aplicando…" : "Confirmar"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}