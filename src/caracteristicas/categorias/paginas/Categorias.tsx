import { useState } from "react"
import { PlusIcon, TagsIcon } from "lucide-react"
import type { Categoria } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Badge } from "@/componentes/ui/badge"
import { Button } from "@/componentes/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table"
import { CategoriaDialogo } from "@/caracteristicas/categorias/componentes/CategoriaDialogo"
import { useCategorias } from "@/caracteristicas/categorias/hooks/useCategorias"
import { useInactivarCategoria } from "@/caracteristicas/categorias/hooks/useInactivarCategoria"

export function Categorias() {
  const categorias = useCategorias()
  const inactivar = useInactivarCategoria()
  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)

  if (categorias.isPending) return <PantallaCarga />

  function desactivar(categoria: Categoria) {
    inactivar.mutate(categoria.id)
  }

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Categorías"
        descripcion="Clasifica los productos para facilitar su búsqueda."
        acciones={
          <Button onClick={() => setCreando(true)}>
            <PlusIcon className="size-4" aria-hidden />
            Nueva categoría
          </Button>
        }
      />
      {inactivar.isError ? <AvisoError error={inactivar.error} /> : null}
      {categorias.isError ? (
        <AvisoError error={categorias.error} />
      ) : categorias.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/40 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <TagsIcon className="size-5" aria-hidden />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Aún no hay categorías. Crea la primera para organizar el catálogo.
          </p>
          <Button variant="outline" size="sm" onClick={() => setCreando(true)}>
            <PlusIcon className="size-3.5" aria-hidden />
            Nueva categoría
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.data.map((categoria) => (
              <TableRow key={categoria.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <TagsIcon className="size-4" aria-hidden />
                    </div>
                    <span className="font-medium">{categoria.nombre}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {categoria.activo ? (
                    <Badge variant="success">Activa</Badge>
                  ) : (
                    <Badge variant="outline">Inactiva</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!categoria.activo}
                      onClick={() => setEditando(categoria)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={!categoria.activo}
                      onClick={() => desactivar(categoria)}
                    >
                      Desactivar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {creando ? <CategoriaDialogo onCerrar={() => setCreando(false)} /> : null}
      {editando ? (
        <CategoriaDialogo
          categoria={editando}
          onCerrar={() => setEditando(null)}
        />
      ) : null}
    </div>
  )
}
