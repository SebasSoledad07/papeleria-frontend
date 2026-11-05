import { useState } from "react"
import { PlusIcon, TruckIcon } from "lucide-react"
import type { Proveedor } from "@/api/tipos"
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
import { ProveedorDialogo } from "@/caracteristicas/proveedores/componentes/ProveedorDialogo"
import { useInactivarProveedor } from "@/caracteristicas/proveedores/hooks/useInactivarProveedor"
import { useProveedores } from "@/caracteristicas/proveedores/hooks/useProveedores"

export function Proveedores() {
  const proveedores = useProveedores()
  const inactivar = useInactivarProveedor()
  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Proveedor | null>(null)

  if (proveedores.isPending) return <PantallaCarga />

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Proveedores"
        descripcion="Empresas que surten los productos de la papelería."
        acciones={
          <Button onClick={() => setCreando(true)}>
            <PlusIcon className="size-4" aria-hidden />
            Nuevo proveedor
          </Button>
        }
      />
      {inactivar.isError ? <AvisoError error={inactivar.error} /> : null}
      {proveedores.isError ? (
        <AvisoError error={proveedores.error} />
      ) : proveedores.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/40 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <TruckIcon className="size-5" aria-hidden />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Aún no hay proveedores registrados.
          </p>
          <Button variant="outline" size="sm" onClick={() => setCreando(true)}>
            <PlusIcon className="size-3.5" aria-hidden />
            Nuevo proveedor
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proveedor</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="hidden lg:table-cell">Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proveedores.data.map((proveedor) => (
              <TableRow key={proveedor.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <TruckIcon className="size-4" aria-hidden />
                    </div>
                    <span className="font-medium">{proveedor.razonSocial}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {proveedor.nit}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {proveedor.telefono ?? "—"}
                </TableCell>
                <TableCell className="hidden max-w-56 truncate lg:table-cell">
                  {proveedor.direccion ?? "—"}
                </TableCell>
                <TableCell>
                  {proveedor.activo ? (
                    <Badge variant="success">Activo</Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!proveedor.activo}
                      onClick={() => setEditando(proveedor)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={!proveedor.activo}
                      onClick={() => inactivar.mutate(proveedor.id)}
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
      {creando ? (
        <ProveedorDialogo onCerrar={() => setCreando(false)} />
      ) : null}
      {editando ? (
        <ProveedorDialogo
          proveedor={editando}
          onCerrar={() => setEditando(null)}
        />
      ) : null}
    </div>
  )
}
