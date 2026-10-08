import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon } from "lucide-react"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
import type { EdicionUsuario, Usuario } from "@/api/tipos"
import { Campo } from "@/componentes/comunes/Campo"
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
import { SelectorRol } from "@/caracteristicas/usuarios/componentes/SelectorRol"
import { useEditarUsuario } from "@/caracteristicas/usuarios/hooks/useEditarUsuario"

const esquema = z.object({
  nombre: z.string().max(120, "Máximo 120 caracteres."),
  rol: z.enum(["ADMIN", "CAJERO", "BODEGUERO"]),
  activo: z.boolean(),
})

type Datos = z.infer<typeof esquema>

interface Props {
  usuario: Usuario
  onCerrar: () => void
}

export function EditarUsuarioDialogo({ usuario, onCerrar }: Props) {
  const editar = useEditarUsuario()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
    },
  })

  async function guardar(datos: Datos) {
    const edicion: EdicionUsuario = { rol: datos.rol, activo: datos.activo }
    const nombre = datos.nombre.trim()
    if (nombre) edicion.nombre = nombre
    try {
      await editar.mutateAsync({ id: usuario.id, edicion })
      onCerrar()
    } catch {
      // El error se muestra en el diálogo
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>{usuario.usuario}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate>
          <div className="grid gap-4">
            <Campo
              etiqueta="Nombre completo"
              htmlPara="nombre"
              error={errors.nombre?.message}
            >
              <Input id="nombre" autoComplete="off" {...register("nombre")} />
            </Campo>
            <Campo etiqueta="Rol" htmlPara="rol" error={errors.rol?.message}>
              <Controller
                control={control}
                name="rol"
                render={({ field }) => (
                  <SelectorRol id="rol" value={field.value} onChange={field.onChange} />
                )}
              />
            </Campo>
            <Controller
              control={control}
              name="activo"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(evento) => field.onChange(evento.target.checked)}
                    className="size-4 rounded border-input accent-[color:var(--primary)]"
                  />
                  Usuario activo
                </label>
              )}
            />
            {editar.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {mensajeDeError(editar.error)}
              </p>
            ) : null}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={editar.isPending}>
              {editar.isPending ? (
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
              ) : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}