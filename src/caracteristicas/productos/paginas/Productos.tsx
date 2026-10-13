import { useEffect, useMemo, useState } from "react"
import { PackageIcon, SearchIcon } from "lucide-react"
import { useSesion } from "@/caracteristicas/autenticacion"
import { useCategorias } from "@/caracteristicas/categorias"
import { useProveedores } from "@/caracteristicas/proveedores"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
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
import { InsigniaStock } from "../componentes/InsigniaStock"
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

  useEffect(() => {
    const temporizador = window.setTimeout(() => setTextoBuscado(texto), 300)
    return () => window.clearTimeout(temporizador)
  }, [texto])

  const productos = useProductos(textoBuscado)
  const categorias = useCategorias()
  const proveedores = useProveedores()
  const sesion = useSesion()
  const esAdmin = sesion.data?.rol === "ADMIN"

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
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-8"
            placeholder="Buscar producto…"
            aria-label="Buscar producto"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        </div>
        <select
          className={claseSelect}
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
          className={claseSelect}
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
          className={claseSelect}
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

      {productos.isPending ? (
        <PantallaCarga />
      ) : productos.isError ? (
        <AvisoError error={productos.error} />
      ) : visibles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          <PackageIcon className="size-6" aria-hidden />
          {textoBuscado || categoriaId || proveedorId || estado
            ? "No se encontraron productos con esos criterios."
            : "Aún no hay productos registrados."}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              {esAdmin ? <TableHead className="text-right">Costo</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell className="font-mono text-xs">
                  {producto.codigoBarras}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{producto.nombre}</div>
                  {producto.marca ? (
                    <div className="text-xs text-muted-foreground">
                      {producto.marca}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>{producto.categoriaNombre ?? "—"}</TableCell>
                <TableCell>{producto.proveedorNombre ?? "—"}</TableCell>
                <TableCell className="text-right">
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
                  <TableCell className="text-right tabular-nums">
                    {formatearDinero(producto.costo)}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
