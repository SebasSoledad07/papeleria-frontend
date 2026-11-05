import { useState } from "react"
import { PlusIcon, UsersIcon } from "lucide-react"
import type { VariantProps } from "class-variance-authority"
import type { Usuario } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Badge, badgeVariants } from "@/componentes/ui/badge"
import { Button } from "@/componentes/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table"
import { CambiaClaveDialogo } from "@/caracteristicas/usuarios/componentes/CambiaClaveDialogo"
import { CrearUsuarioDialogo } from "@/caracteristicas/usuarios/componentes/CrearUsuarioDialogo"
import { EditarUsuarioDialogo } from "@/caracteristicas/usuarios/componentes/EditarUsuarioDialogo"
import { useEditarUsuario } from "@/caracteristicas/usuarios/hooks/useEditarUsuario"
import { useUsuarios } from "@/caracteristicas/usuarios/hooks/useUsuarios"

type VarianteBadge = VariantProps<typeof badgeVariants>["variant"]

const etiquetasRol: Record<string, string> = {
  ADMIN: "Administrador",
  CAJERO: "Cajero",
  BODEGUERO: "Bodeguero",
}

const varianteRol: Record<string, VarianteBadge> = {
  ADMIN: "default",
  CAJERO: "secondary",
  BODEGUERO: "outline",
}

export function Usuarios() {
  const usuarios = useUsuarios()
  const editar = useEditarUsuario()
  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [claveDe, setClaveDe] = useState<Usuario | null>(null)

  if (usuarios.isPending) return <PantallaCarga />

  function alternarEstado(usuario: Usuario) {
    editar.mutate({ id: usuario.id, edicion: { activo: !usuario.activo } })
  }

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Usuarios"
        descripcion="Personas que usan el sistema y su rol de acceso."
        acciones={
          <Button onClick={() => setCreando(true)}>
            <PlusIcon className="size-4" aria-hidden />
            Nuevo usuario
          </Button>
        }
      />
      {editar.isError ? <AvisoError error={editar.error} /> : null}
      {usuarios.isError ? (
        <AvisoError error={usuarios.error} />
      ) : usuarios.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card/40 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UsersIcon className="size-5" aria-hidden />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Aún no hay usuarios registrados.
          </p>
          <Button variant="outline" size="sm" onClick={() => setCreando(true)}>
            <PlusIcon className="size-3.5" aria-hidden />
            Nuevo usuario
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.data.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{usuario.nombre}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {usuario.usuario}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={varianteRol[usuario.rol]}>
                    {etiquetasRol[usuario.rol] ?? usuario.rol}
                  </Badge>
                </TableCell>
                <TableCell>
                  {usuario.activo ? (
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
                      onClick={() => setEditando(usuario)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setClaveDe(usuario)}
                    >
                      Contraseña
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        usuario.activo ? "text-destructive hover:text-destructive" : ""
                      }
                      onClick={() => alternarEstado(usuario)}
                    >
                      {usuario.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {creando ? <CrearUsuarioDialogo onCerrar={() => setCreando(false)} /> : null}
      {editando ? (
        <EditarUsuarioDialogo usuario={editando} onCerrar={() => setEditando(null)} />
      ) : null}
      {claveDe ? (
        <CambiaClaveDialogo usuario={claveDe} onCerrar={() => setClaveDe(null)} />
      ) : null}
    </div>
  )
}
