import { useState } from "react"
import { PlusIcon } from "lucide-react"
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
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razón social</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proveedores.data.map((proveedor) => (
              <TableRow key={proveedor.id}>
                <TableCell className="font-medium">
                  {proveedor.razonSocial}
                </TableCell>
                <TableCell>{proveedor.nit}</TableCell>
                <TableCell>{proveedor.telefono ?? "—"}</TableCell>
                <TableCell>{proveedor.direccion ?? "—"}</TableCell>
                <TableCell>
                  {proveedor.activo ? (
                    <Badge variant="secondary">Activo</Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
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