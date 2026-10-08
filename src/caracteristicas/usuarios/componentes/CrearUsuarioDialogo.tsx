import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon } from "lucide-react"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
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
import { useCrearUsuario } from "@/caracteristicas/usuarios/hooks/useCrearUsuario"

const esquema = z.object({
  usuario: z
    .string()
    .min(3, "Mínimo 3 caracteres.")
    .max(60, "Máximo 60 caracteres."),
  nombre: z
    .string()
    .min(1, "Escribe el nombre completo.")
    .max(120, "Máximo 120 caracteres."),
  clave: z
    .string()
    .min(8, "Mínimo 8 caracteres.")
    .max(100, "Máximo 100 caracteres."),
  rol: z.enum(["ADMIN", "CAJERO", "BODEGUERO"]),
})

type Datos = z.infer<typeof esquema>

interface Props {
  onCerrar: () => void
}

export function CrearUsuarioDialogo({ onCerrar }: Props) {
  const crear = useCrearUsuario()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { usuario: "", nombre: "", clave: "", rol: "CAJERO" },
  })

  async function guardar(datos: Datos) {
    try {
      await crear.mutateAsync({
        usuario: datos.usuario.trim(),
        nombre: datos.nombre.trim(),
        clave: datos.clave,
        rol: datos.rol,
      })
      reset()
      onCerrar()
    } catch {
      // El error se muestra en el diálogo
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Asigna el usuario, la contraseña y el rol de acceso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate>
          <div className="grid gap-4">
            <Campo
              etiqueta="Usuario"
              htmlPara="usuario"
              error={errors.usuario?.message}
            >
              <Input id="usuario" autoComplete="off" {...register("usuario")} />
            </Campo>
            <Campo
              etiqueta="Nombre completo"
              htmlPara="nombre"
              error={errors.nombre?.message}
            >
              <Input id="nombre" autoComplete="off" {...register("nombre")} />
            </Campo>
            <Campo
              etiqueta="Contraseña"
              htmlPara="clave"
              error={errors.clave?.message}
            >
              <Input
                id="clave"
                type="password"
                autoComplete="new-password"
                {...register("clave")}
              />
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
            {crear.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {mensajeDeError(crear.error)}
              </p>
            ) : null}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? (
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