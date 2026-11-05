import { useEffect, useMemo, useState } from "react"
import { BanIcon, LoaderCircleIcon, PackageIcon, PencilIcon, PlusIcon, SearchIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { mensajeDeError } from "@/api/errores"
import type { Producto } from "@/api/tipos"
import { useSesion } from "@/caracteristicas/autenticacion"
import { useCategorias } from "@/caracteristicas/categorias"
import { useProveedores } from "@/caracteristicas/proveedores"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button, buttonVariants } from "@/componentes/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog"
import { Input } from "@/componentes/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table"
import { formatearDinero } from "@/lib/formato"
import { cn } from "@/lib/utils"
import { InsigniaStock } from "../componentes/InsigniaStock"
import { ProductoDialogo } from "../componentes/ProductoDialogo"
import { useInactivarProducto } from "../hooks/useInactivarProducto"
import { useProductos } from "../hooks/useProductos"

const ESTADOS = [
  { valor: "", etiqueta: "Todos" },
  { valor: "agotado", etiqueta: "Agotados" },
  { valor: "bajo", etiqueta: "Stock bajo" },
  { valor: "disponible", etiqueta: "Disponibles" },
] as const

type EstadoFiltro = (typeof ESTADOS)[number]["valor"]

const claseSelect =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function Productos() {
  const [texto, setTexto] = useState("")
  const [textoBuscado, setTextoBuscado] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [proveedorId, setProveedorId] = useState("")
  const [estado, setEstado] = useState<EstadoFiltro>("")
  const [editando, setEditando] = useState<Producto | null>(null)
  const [inactivar, setInactivar] = useState<Producto | null>(null)

  useEffect(() => {
    const temporizador = window.setTimeout(() => setTextoBuscado(texto), 300)
    return () => window.clearTimeout(temporizador)
  }, [texto])

  const productos = useProductos(textoBuscado)
  const categorias = useCategorias()
  const proveedores = useProveedores()
  const sesion = useSesion()
  const esAdmin = sesion.data?.rol === "ADMIN"
  // Escribir productos es ADMIN | BODEGUERO (matriz de SecurityConfig).
  const puedeEditar =
    sesion.data?.rol === "ADMIN" || sesion.data?.rol === "BODEGUERO"
  const inactivarMutation = useInactivarProducto()

  const visibles = useMemo(() => {
    const lista = productos.data ?? []
    return lista.filter((producto) => {
      if (categoriaId && String(producto.categoriaId) !== categoriaId) {
        return false
      }
      if (proveedorId && String(producto.proveedorId) !== proveedorId) {
        return false
      }
      if (estado === "agotado" && producto.stock > 0) return false
      if (
        estado === "bajo" &&
        !(
          producto.stock > 0 &&
          producto.stockMinimo != null &&
          producto.stock <= producto.stockMinimo
        )
      ) {
        return false
      }
      if (estado === "disponible" && producto.stock <= 0) return false
      return true
    })
  }, [productos.data, categoriaId, proveedorId, estado])

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Productos"
        descripcion="Busca por código, nombre, marca o categoría."
        acciones={
          puedeEditar ? (
            <Link to="/productos/nuevo" className={buttonVariants()}>
              <PlusIcon className="size-4" aria-hidden />
              Nuevo producto
            </Link>
          ) : null
        }
      />

      <div className="rounded-xl border bg-card/60 p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              className="bg-background pl-8"
              placeholder="Buscar producto…"
              aria-label="Buscar producto"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
            />
          </div>
          <select
            className={cn(claseSelect, "bg-background")}
            aria-label="Filtrar por categoría"
            value={categoriaId}
            onChange={(evento) => setCategoriaId(evento.target.value)}
          >
            <option value="">Todas las categorías</option>
            {(categorias.data ?? [])
              .filter((categoria) => categoria.activo)
              .map((categoria) => (
                <option key={categoria.id} value={String(categoria.id)}>
                  {categoria.nombre}
                </option>
              ))}
          </select>
          <select
            className={cn(claseSelect, "bg-background")}
            aria-label="Filtrar por proveedor"
            value={proveedorId}
            onChange={(evento) => setProveedorId(evento.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {(proveedores.data ?? [])
              .filter((proveedor) => proveedor.activo)
              .map((proveedor) => (
                <option key={proveedor.id} value={String(proveedor.id)}>
                  {proveedor.razonSocial}
                </option>
              ))}
          </select>
          <select
            className={cn(claseSelect, "bg-background")}
            aria-label="Filtrar por estado de stock"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value as EstadoFiltro)}
          >
            {ESTADOS.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {productos.isPending ? (
        <PantallaCarga />
      ) : productos.isError ? (
        <AvisoError error={productos.error} />
      ) : visibles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/40 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PackageIcon className="size-5" aria-hidden />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            {textoBuscado || categoriaId || proveedorId || estado
              ? "No se encontraron productos con esos criterios."
              : "Aún no hay productos registrados."}
          </p>
          {puedeEditar ? (
            <Link
              to="/productos/nuevo"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <PlusIcon className="size-3.5" aria-hidden />
              Nuevo producto
            </Link>
          ) : null}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="hidden lg:table-cell">Proveedor</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              {esAdmin ? (
                <TableHead className="hidden text-right md:table-cell">
                  Costo
                </TableHead>
              ) : null}
              {puedeEditar ? (
                <TableHead className="text-right">Acciones</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell className="font-mono text-xs">
                  {producto.codigoBarras}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                      {producto.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{producto.nombre}</div>
                      {producto.marca ? (
                        <div className="text-xs text-muted-foreground">
                          {producto.marca}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {producto.categoriaNombre ?? "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {producto.proveedorNombre ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatearDinero(producto.precioVenta)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="tabular-nums">{producto.stock}</span>
                    <InsigniaStock
                      stock={producto.stock}
                      stockMinimo={producto.stockMinimo}
                    />
                  </div>
                </TableCell>
                {esAdmin ? (
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {formatearDinero(producto.costo)}
                  </TableCell>
                ) : null}
                {puedeEditar ? (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/productos/${producto.id}/kardex`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Kárdex
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Editar ${producto.nombre}`}
                        onClick={() => setEditando(producto)}
                      >
                        <PencilIcon className="size-3.5" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Inactivar ${producto.nombre}`}
                        className="text-destructive hover:text-destructive"
                        onClick={() => setInactivar(producto)}
                      >
                        <BanIcon className="size-3.5" aria-hidden />
                        Inactivar
                      </Button>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {editando ? (
        <ProductoDialogo producto={editando} onCerrar={() => setEditando(null)} />
      ) : null}

      {inactivar ? (
        <Dialog open onOpenChange={(abierto) => !abierto && setInactivar(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Inactivar producto</DialogTitle>
              <DialogDescription>
                «{inactivar.nombre}» se ocultará del catálogo de venta y del
                listado (RF-07, RN-17).
              </DialogDescription>
            </DialogHeader>
            {inactivarMutation.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {mensajeDeError(inactivarMutation.error)}
              </p>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setInactivar(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={inactivarMutation.isPending}
                onClick={() => {
                  void inactivarMutation
                    .mutateAsync(inactivar.id)
                    .then(() => setInactivar(null))
                }}
              >
                {inactivarMutation.isPending ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                ) : null}
                Inactivar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
