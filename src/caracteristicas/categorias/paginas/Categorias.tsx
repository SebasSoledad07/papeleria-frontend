import { useState } from "react"
import { PlusIcon } from "lucide-react"
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
                <TableCell className="font-medium">{categoria.nombre}</TableCell>
                <TableCell>
                  {categoria.activo ? (
                    <Badge variant="secondary">Activa</Badge>
                  ) : (
                    <Badge variant="outline">Inactiva</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
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