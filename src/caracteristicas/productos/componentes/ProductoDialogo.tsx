import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon, RefreshCcwIcon } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
import type {
  EntradaProducto,
  Producto,
  TarifaIva,
  Unidad,
} from "@/api/tipos"
import { useSesion } from "@/caracteristicas/autenticacion"
import { useCategorias } from "@/caracteristicas/categorias"
import { useProveedores } from "@/caracteristicas/proveedores"
import { Campo } from "@/componentes/comunes/Campo"
import { CampoDinero } from "@/componentes/comunes/CampoDinero"
import { Badge } from "@/componentes/ui/badge"
import { Button } from "@/componentes/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog"
import { Input } from "@/componentes/ui/input"
import { generarCodigoInterno } from "@/escaner"
import { formatearDinero } from "@/lib/formato"
import { useCrearProducto } from "@/caracteristicas/productos/hooks/useCrearProducto"
import { useEditarProducto } from "@/caracteristicas/productos/hooks/useEditarProducto"
import { useActivarProducto } from "@/caracteristicas/productos/hooks/useActivarProducto"

const UNIDADES: { valor: Unidad; etiqueta: string }[] = [
  { valor: "UNIDAD", etiqueta: "Unidad" },
  { valor: "PAQUETE", etiqueta: "Paquete" },
  { valor: "RESMA", etiqueta: "Resma" },
  { valor: "CAJA", etiqueta: "Caja" },
  { valor: "PLIEGO", etiqueta: "Pliego" },
  { valor: "METRO", etiqueta: "Metro" },
  { valor: "SERVICIO", etiqueta: "Servicio" },
]

const TARIFAS: { valor: TarifaIva; etiqueta: string }[] = [
  { valor: "19", etiqueta: "19 %" },
  { valor: "5", etiqueta: "5 %" },
  { valor: "0", etiqueta: "0 % (exento)" },
  { valor: "EXCLUIDO", etiqueta: "Excluido" },
]

const claseSelect =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

interface Props {
  producto?: Producto
  aviso?: string
  porDefecto?: Partial<EntradaProducto>
  onCerrar: () => void
}

function generarEsquema(esAdmin: boolean) {
  return z.object({
    codigoBarras: z.string().trim().max(13, "Máximo 13 caracteres."),
    nombre: z
      .string()
      .trim()
      .min(1, "Escribe el nombre.")
      .max(150, "Máximo 150 caracteres."),
    marca: z.string().trim().max(100, "Máximo 100 caracteres."),
    categoriaId: z.string().min(1, "Elige la categoría."),
    proveedorId: z.string(),
    unidad: z.string().min(1, "Elige la unidad."),
    tarifaIva: z.string().min(1, "Elige la tarifa de IVA."),
    // PRECIO <= 0 bloquea (RN-05); se calcula en local el subtotal sin
    // descuentos, el resto lo decide el servidor.
    precioVenta: z
      .string()
      .regex(/^\d+$/, "Escribe el precio de venta.")
      .refine((valor) => Number(valor) > 0, "El precio debe ser mayor a cero."),
    costo: z
      .string()
      .regex(esAdmin ? /^\d+$/ : /^\d*$/, esAdmin ? "Escribe el costo." : "Solo números."),
    stockInicial: z.string().regex(/^\d*$/, "Solo números."),
    stockMinimo: z.string().regex(/^\d*$/, "Solo números."),
  })
}

type DatosEsquema = z.infer<ReturnType<typeof generarEsquema>>

export function ProductoDialogo({ producto, aviso, porDefecto, onCerrar }: Props) {
  const sesion = useSesion()
  const esAdmin = sesion.data?.rol === "ADMIN"
  const categorias = useCategorias()
  const proveedores = useProveedores()
  const crear = useCrearProducto()
  const editar = useEditarProducto()
  const activar = useActivarProducto()
  const mutacion = producto ? editar : crear
  const [confirmarPrecio, setConfirmarPrecio] = useState<DatosEsquema | null>(null)

  const esquema = generarEsquema(esAdmin)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<DatosEsquema>({
    resolver: zodResolver(esquema),
    defaultValues: {
      codigoBarras: producto?.codigoBarras ?? porDefecto?.codigoBarras ?? "",
      nombre: producto?.nombre ?? porDefecto?.nombre ?? "",
      marca: producto?.marca ?? porDefecto?.marca ?? "",
      categoriaId: producto
        ? String(producto.categoriaId ?? "")
        : porDefecto?.categoriaId
          ? String(porDefecto.categoriaId)
          : "",
      proveedorId: producto ? String(producto.proveedorId ?? "") : "",
      unidad: producto?.unidad ?? "UNIDAD",
      tarifaIva: producto?.tarifaIva ?? "19",
      precioVenta: producto ? String(producto.precioVenta) : "",
      costo: producto ? String(producto.costo) : "",
      stockInicial: "",
      stockMinimo: producto?.stockMinimo != null ? String(producto.stockMinimo) : "",
    },
  })

  const precioVenta = useWatch({ control, name: "precioVenta" })
  const costo = useWatch({ control, name: "costo" })
  const stockInicial = useWatch({ control, name: "stockInicial" })
  const stockMinimo = useWatch({ control, name: "stockMinimo" })
  const precioNumerico = precioVenta ? Number(precioVenta) : 0
  const costoNumerico = costo ? Number(costo) : 0
  const avisoRn06 =
    precioNumerico > 0 && costoNumerico > 0 && precioNumerico <= costoNumerico

  function aEntrada(datos: DatosEsquema): EntradaProducto {
    const entrada: EntradaProducto = {
      codigoBarras: datos.codigoBarras || undefined,
      nombre: datos.nombre,
      marca: datos.marca || undefined,
      categoriaId: Number(datos.categoriaId),
      proveedorId: datos.proveedorId
        ? Number(datos.proveedorId)
        : undefined,
      unidad: datos.unidad as Unidad,
      tarifaIva: datos.tarifaIva as TarifaIva,
      precioVenta: Number(datos.precioVenta),
      // El costo solo lo ve el ADMIN (D-9). Al editar un BODEGUERO se
      // conserva el costo actual; al crear sin verlo, se registra en 0.
      costo: esAdmin
        ? Number(datos.costo)
        : producto
          ? producto.costo
          : 0,
    }
    if (datos.stockInicial) entrada.stockInicial = Number(datos.stockInicial)
    if (datos.stockMinimo) entrada.stockMinimo = Number(datos.stockMinimo)
    return entrada
  }

  async function guardar(datos: DatosEsquema) {
    try {
      if (producto) {
        await editar.mutateAsync({ id: producto.id, entrada: aEntrada(datos) })
      } else {
        await crear.mutateAsync(aEntrada(datos))
      }
      onCerrar()
    } catch {
      // El error de la mutación se muestra en el diálogo.
    }
  }

  // Al cambiar el precio se pide confirmación «antes → después» (RF-05, RN-07).
  async function alEnviar(datos: DatosEsquema) {
    if (producto && Number(datos.precioVenta) !== producto.precioVenta) {
      setConfirmarPrecio(datos)
      return
    }
    await guardar(datos)
  }

  async function reactivar() {
    if (!producto) return
    try {
      await activar.mutateAsync(producto.id)
      onCerrar()
    } catch {
      // El error se muestra en el diálogo
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>
              {producto ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
            {producto && !producto.activo ? (
              <Badge variant="outline">Inactivo</Badge>
            ) : null}
          </div>
          <DialogDescription>
            {producto
              ? "Actualiza los datos del producto."
              : "Registra el producto en el inventario."}
          </DialogDescription>
        </DialogHeader>

        {aviso ? (
          <p
            role="note"
            className="rounded-lg border border-border bg-muted p-3 text-sm"
          >
            {aviso}
          </p>
        ) : null}

        {confirmarPrecio ? (
          <div className="space-y-4">
            <p>Vas a cambiar el precio de venta:</p>
            <p className="font-medium">
              {formatearDinero(producto!.precioVenta)} →{" "}
              {formatearDinero(Number(confirmarPrecio.precioVenta))}
            </p>
            <p className="text-sm text-muted-foreground">
              El cambio queda registrado en el historial de precios (RN-07).
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmarPrecio(null)}
              >
                Volver
              </Button>
              <Button
                type="button"
                disabled={mutacion.isPending}
                onClick={() => void guardar(confirmarPrecio)}
              >
                {mutacion.isPending ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                ) : null}
                Confirmar cambio de precio
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(alEnviar)} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo
                  etiqueta="Código de barras"
                  htmlPara="codigoBarras"
                  error={errors.codigoBarras?.message}
                >
                  <Input
                    id="codigoBarras"
                    autoComplete="off"
                    placeholder="Si lo dejas vacío, se genera uno interno (RN-15)"
                    {...register("codigoBarras")}
                  />
                  {!producto ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-auto w-fit px-1 text-xs"
                      onClick={() =>
                        (setValue)(
                          "codigoBarras",
                          generarCodigoInterno(),
                        )
                      }
                    >
                      <RefreshCcwIcon className="size-3" aria-hidden />
                      Generar código interno
                    </Button>
                  ) : null}
                </Campo>
              </div>
              <div className="sm:col-span-2">
                <Campo etiqueta="Nombre" htmlPara="nombre" error={errors.nombre?.message}>
                  <Input
                    id="nombre"
                    autoComplete="off"
                    {...register("nombre")}
                  />
                </Campo>
              </div>
              <div className="sm:col-span-2">
                <Campo etiqueta="Marca" htmlPara="marca" error={errors.marca?.message}>
                  <Input id="marca" autoComplete="off" {...register("marca")} />
                </Campo>
              </div>
              <Campo etiqueta="Categoría" htmlPara="categoriaId" error={errors.categoriaId?.message}>
                <select
                  id="categoriaId"
                  className={claseSelect}
                  {...register("categoriaId")}
                >
                  <option value="">Elige…</option>
                  {(categorias.data ?? [])
                    .filter(
                      (categoria) =>
                        categoria.activo || categoria.id === producto?.categoriaId,
                    )
                    .map((categoria) => (
                      <option key={categoria.id} value={String(categoria.id)}>
                        {categoria.nombre}
                      </option>
                    ))}
                </select>
              </Campo>
              <Campo etiqueta="Proveedor" htmlPara="proveedorId">
                <select id="proveedorId" className={claseSelect} {...register("proveedorId")}>
                  <option value="">Sin proveedor</option>
                  {(proveedores.data ?? [])
                    .filter(
                      (proveedor) =>
                        proveedor.activo || proveedor.id === producto?.proveedorId,
                    )
                    .map((proveedor) => (
                      <option key={proveedor.id} value={String(proveedor.id)}>
                        {proveedor.razonSocial}
                      </option>
                    ))}
                </select>
              </Campo>
              <Campo etiqueta="Unidad" htmlPara="unidad" error={errors.unidad?.message}>
                <select id="unidad" className={claseSelect} {...register("unidad")}>
                  {UNIDADES.map((unidad) => (
                    <option key={unidad.valor} value={unidad.valor}>
                      {unidad.etiqueta}
                    </option>
                  ))}
                </select>
              </Campo>
              <div className="sm:col-span-2">
                <Campo etiqueta="Tarifa de IVA" htmlPara="tarifaIva" error={errors.tarifaIva?.message}>
                  <select
                    id="tarifaIva"
                    className={claseSelect}
                    {...register("tarifaIva")}
                  >
                    {TARIFAS.map((tarifa) => (
                      <option key={tarifa.valor} value={tarifa.valor}>
                        {tarifa.etiqueta}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valídala con el contador (RN-10).
                  </p>
                </Campo>
              </div>
              <Campo
                etiqueta="Precio de venta (IVA incluido)"
                htmlPara="precioVenta"
                error={errors.precioVenta?.message}
              >
                <CampoDinero
                  id="precioVenta"
                  valor={precioVenta}
                  onChange={(valor) =>
                    (setValue)("precioVenta", valor)
                  }
                />
              </Campo>
              {esAdmin ? (
                <Campo etiqueta="Costo" htmlPara="costo" error={errors.costo?.message}>
                  <CampoDinero
                    id="costo"
                    valor={costo}
                    onChange={(valor) =>
                      (setValue)("costo", valor)
                    }
                  />
                </Campo>
              ) : null}
              {!producto ? (
                <Campo
                  etiqueta="Stock inicial"
                  htmlPara="stockInicial"
                  error={errors.stockInicial?.message}
                >
                  <CampoDinero
                    id="stockInicial"
                    valor={stockInicial}
                    onChange={(valor) =>
                      (setValue)(
                        "stockInicial",
                        valor,
                      )
                    }
                  />
                </Campo>
              ) : null}
              <Campo
                etiqueta="Stock mínimo"
                htmlPara="stockMinimo"
                error={errors.stockMinimo?.message}
              >
                <CampoDinero
                  id="stockMinimo"
                  valor={stockMinimo}
                  onChange={(valor) =>
                    (setValue)(
                      "stockMinimo",
                      valor,
                    )
                  }
                />
              </Campo>
              {avisoRn06 ? (
                <p
                  role="note"
                  className="text-sm text-amber-600 sm:col-span-2"
                >
                  El precio de venta es menor o igual al costo. Revisa el margen (RN-06).
                </p>
              ) : null}
            </div>
            {mutacion.isError ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {mensajeDeError(mutacion.error)}
              </p>
            ) : null}
            <DialogFooter className="mt-4">
              {producto && !producto.activo ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={activar.isPending}
                  onClick={() => void reactivar()}
                >
                  {activar.isPending ? (
                    <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  Reactivar producto
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={onCerrar}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutacion.isPending}>
                {mutacion.isPending ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                ) : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}