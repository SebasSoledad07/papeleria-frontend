import { useState } from "react"
import { ShoppingCartIcon } from "lucide-react"
import type { Caja, EntradaVenta, Producto } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import { CampoCodigo } from "@/escaner/CampoCodigo"
import { apiGet } from "@/api/cliente"
import { formatearDinero } from "@/lib/formato"
import { useAbrirCaja } from "../hooks/useAbrirCaja"
import { useCajaAbierta } from "../hooks/useCajaAbierta"
import { useConfirmarVenta } from "../hooks/useConfirmarVenta"

interface LineaCarrito {
  productoId: number
  nombre: string
  cantidad: number
  precioVenta: number
}

export function Caja() {
  const caja = useCajaAbierta()
  const abrir = useAbrirCaja()
  const confirmar = useConfirmarVenta()

  const [base, setBase] = useState("")
  const [carrito, setCarrito] = useState<LineaCarrito[]>([])
  const [descuentoTotal, setDescuentoTotal] = useState("")
  const [cobrando, setCobrando] = useState(false)
  const [pagos, setPagos] = useState<{ medio: string; valor: string }[]>([
    { medio: "EFECTIVO", valor: "" },
  ])
  const [consecutivo, setConsecutivo] = useState<number | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function agregarProducto(codigo: string) {
    try {
      const producto = await apiGet<Producto>(
        `/api/producto/codigo/${encodeURIComponent(codigo)}`,
      )
      setCarrito((actuales) => {
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
            cantidad: 1,
            precioVenta: producto.precioVenta,
          },
        ]
      })
    } catch {
      setAviso("Producto no registrado.")
    }
  }

  function cambiarCantidad(productoId: number, delta: number) {
    setCarrito((actuales) =>
      actuales
        .map((l) =>
          l.productoId === productoId
            ? { ...l, cantidad: Math.max(0, l.cantidad + delta) }
            : l,
        )
        .filter((l) => l.cantidad > 0),
    )
  }

  const subtotal = carrito.reduce(
    (s, l) => s + l.precioVenta * l.cantidad,
    0,
  )
  const descuento = Number(descuentoTotal) || 0
  const total = Math.max(0, subtotal - descuento)

  async function abrirCaja() {
    try {
      await abrir.mutateAsync({ baseEfectivo: Number(base) || 0 })
      setBase("")
    } catch {
      // error abajo
    }
  }

  async function confirmarVenta() {
    if (!caja.data) return
    const entrada: EntradaVenta = {
      cajaId: caja.data.id,
      descuentoTotal: descuento > 0 ? descuento : undefined,
      items: carrito.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
      })),
      pagos: pagos.map((p) => ({
        medio: p.medio,
        valor: Number(p.valor) || 0,
      })),
    }
    try {
      const venta = await confirmar.mutateAsync(entrada)
      setConsecutivo(venta.consecutivo)
      setCarrito([])
      setDescuentoTotal("")
      setPagos([{ medio: "EFECTIVO", valor: "" }])
      setCobrando(false)
    } catch {
      // error abajo
    }
  }

  if (caja.isPending) return <PantallaCarga />

  // Sin caja abierta.
  if (caja.isError || !caja.data) {
    return (
      <div className="space-y-6">
        <PaginaTitulo
          titulo="Caja"
          descripcion="Abre una caja para empezar a vender (RF-19, RN-30)."
        />
        {abrir.isError ? <AvisoError error={abrir.error} /> : null}
        <div className="max-w-sm space-y-3">
          <label className="text-sm font-medium" htmlFor="base">
            Base inicial en efectivo
          </label>
          <Input
            id="base"
            inputMode="numeric"
            value={base}
            onChange={(e) => setBase(e.target.value.replace(/\D/g, ""))}
          />
          <Button disabled={abrir.isPending} onClick={() => void abrirCaja()}>
            {abrir.isPending ? "Abriendo…" : "Abrir caja"}
          </Button>
        </div>
      </div>
    )
  }

  const cajaAbierta: Caja = caja.data

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Caja"
        descripcion={`Caja abierta · ${cajaAbierta.usuarioNombre}`}
      />
      {confirmar.isError ? <AvisoError error={confirmar.error} /> : null}
      {aviso ? (
        <p role="status" className="text-sm text-muted-foreground">{aviso}</p>
      ) : null}
      {consecutivo ? (
        <p role="status" className="text-sm font-medium text-primary">
          Venta #{consecutivo} registrada.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
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

          {carrito.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/40 p-10 text-center">
              <ShoppingCartIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Escanea un producto para agregarlo al carrito.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-center">Cant.</th>
                    <th className="p-2 text-right">Precio</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((l) => (
                    <tr key={l.productoId} className="border-b last:border-0">
                      <td className="p-2">{l.nombre}</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cambiarCantidad(l.productoId, -1)}
                          >
                            −
                          </Button>
                          <span className="w-6 text-center">{l.cantidad}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cambiarCantidad(l.productoId, 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        {formatearDinero(l.precioVenta)}
                      </td>
                      <td className="p-2 text-right">
                        {formatearDinero(l.precioVenta * l.cantidad)}
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setCarrito((a) =>
                              a.filter((x) => x.productoId !== l.productoId),
                            )
                          }
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatearDinero(subtotal)}</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Descuento total
            </label>
            <Input
              inputMode="numeric"
              value={descuentoTotal}
              onChange={(e) =>
                setDescuentoTotal(e.target.value.replace(/\D/g, ""))
              }
            />
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatearDinero(total)}</span>
          </div>
          <Button
            className="w-full"
            disabled={carrito.length === 0}
            onClick={() => setCobrando(true)}
          >
            Cobrar (F9)
          </Button>
        </div>
      </div>

      {cobrando ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-3 rounded-xl bg-background p-4">
            <h2 className="font-semibold">Cobro</h2>
            {pagos.map((p, i) => (
              <div key={i} className="flex gap-2">
                <select
                  className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={p.medio}
                  onChange={(e) =>
                    setPagos((a) =>
                      a.map((x, j) =>
                        j === i ? { ...x, medio: e.target.value } : x,
                      ),
                    )
                  }
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="NEQUI">Nequi</option>
                  <option value="DAVIPLATA">Daviplata</option>
                </select>
                <Input
                  inputMode="numeric"
                  value={p.valor}
                  onChange={(e) =>
                    setPagos((a) =>
                      a.map((x, j) =>
                        j === i
                          ? { ...x, valor: e.target.value.replace(/\D/g, "") }
                          : x,
                      ),
                    )
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagos((a) => [...a, { medio: "EFECTIVO", valor: "" }])
              }
            >
              + Pago
            </Button>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCobrando(false)}>
                Cancelar
              </Button>
              <Button
                disabled={confirmar.isPending}
                onClick={() => void confirmarVenta()}
              >
                {confirmar.isPending ? "Confirmando…" : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}