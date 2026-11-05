import { useState } from "react"
import { TrashIcon } from "lucide-react"
import type { EntradaCompra, Producto, Proveedor } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
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
import { formatearDinero } from "@/lib/formato"
import { useProveedores } from "@/caracteristicas/proveedores/hooks/useProveedores"
import { apiGet } from "@/api/cliente"
import { useRegistrarCompra } from "../hooks/useRegistrarCompra"

interface Linea {
  productoId: number
  nombre: string
  codigoBarras: string
  cantidad: number
  costoUnitario: string
}

export function Compras() {
  const proveedores = useProveedores()
  const registrar = useRegistrarCompra()
  const [proveedorId, setProveedorId] = useState("")
  const [numeroFactura, setNumeroFactura] = useState("")
  const [observacion, setObservacion] = useState("")
  const [lineas, setLineas] = useState<Linea[]>([])
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
              ? { ...l, cantidad: l.cantidad + 1 }
              : l,
          )
        }
        return [
          ...actuales,
          {
            productoId: producto.id,
            nombre: producto.nombre,
            codigoBarras: producto.codigoBarras,
            cantidad: 1,
            costoUnitario: String(producto.costo ?? 0),
          },
        ]
      })
      setAviso(null)
    } catch {
      setAviso("Producto no registrado.")
    }
  }

  if (proveedores.isPending) return <PantallaCarga />

  function quitarLinea(productoId: number) {
    setLineas((actuales) => actuales.filter((l) => l.productoId !== productoId))
  }

  function actualizarCantidad(productoId: number, valor: string) {
    const cantidad = Number(valor.replace(/\D/g, "")) || 0
    setLineas((actuales) =>
      actuales.map((l) =>
        l.productoId === productoId ? { ...l, cantidad } : l,
      ),
    )
  }

  function actualizarCosto(productoId: number, valor: string) {
    setLineas((actuales) =>
      actuales.map((l) =>
        l.productoId === productoId ? { ...l, costoUnitario: valor } : l,
      ),
    )
  }

  async function guardar() {
    if (!proveedorId || !numeroFactura.trim() || lineas.length === 0) return
    const entrada: EntradaCompra = {
      proveedorId: Number(proveedorId),
      numeroFactura: numeroFactura.trim(),
      observacion: observacion.trim() || undefined,
      detalle: lineas.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
        costoUnitario: Number(l.costoUnitario) || 0,
      })),
    }
    try {
      await registrar.mutateAsync(entrada)
      setLineas([])
      setNumeroFactura("")
      setObservacion("")
      setAviso("Compra registrada. El stock se actualizó.")
    } catch {
      // El error se muestra abajo.
    }
  }

  const total = lineas.reduce(
    (suma, l) => suma + (Number(l.costoUnitario) || 0) * l.cantidad,
    0,
  )

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Entrada de mercancía"
        descripcion="Registra una compra a proveedor. Escanea cada producto para agregarlo."
      />
      {registrar.isError ? <AvisoError error={registrar.error} /> : null}
      {aviso ? (
        <p role="status" className="text-sm text-muted-foreground">
          {aviso}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="proveedor">
            Proveedor
          </label>
          <select
            id="proveedor"
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-2 py-1 text-sm"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
          >
            <option value="">Elige…</option>
            {(proveedores.data ?? [])
              .filter((p: Proveedor) => p.activo)
              .map((p: Proveedor) => (
                <option key={p.id} value={String(p.id)}>
                  {p.razonSocial}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="factura">
            Número de factura
          </label>
          <Input
            id="factura"
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
          />
        </div>
      </div>
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
      <div>
        <label className="text-sm font-medium" htmlFor="observacion">
          Observación
        </label>
        <Input
          id="observacion"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
        />
      </div>

      {lineas.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Aún no hay productos. Escanea el primero.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Costo unitario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineas.map((linea) => (
              <TableRow key={linea.productoId}>
                <TableCell>{linea.nombre}</TableCell>
                <TableCell className="font-mono text-xs">
                  {linea.codigoBarras}
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="numeric"
                    value={String(linea.cantidad)}
                    onChange={(e) =>
                      actualizarCantidad(linea.productoId, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="numeric"
                    value={linea.costoUnitario}
                    onChange={(e) =>
                      actualizarCosto(linea.productoId, e.target.value.replace(/\D/g, ""))
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => quitarLinea(linea.productoId)}
                  >
                    <TrashIcon className="size-4" aria-hidden />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between">
        <p className="font-medium">Total: {formatearDinero(total)}</p>
        <Button disabled={registrar.isPending || lineas.length === 0} onClick={() => void guardar()}>
          {registrar.isPending ? "Guardando…" : "Registrar compra"}
        </Button>
      </div>
    </div>
  )
}