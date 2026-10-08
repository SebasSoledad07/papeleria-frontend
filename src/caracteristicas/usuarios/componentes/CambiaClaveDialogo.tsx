import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon } from "lucide-react"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
import type { Usuario } from "@/api/tipos"
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
import { useCambiarClave } from "@/caracteristicas/usuarios/hooks/useCambiarClave"

const esquema = z.object({
  clave: z
    .string()
    .min(8, "Mínimo 8 caracteres.")
    .max(100, "Máximo 100 caracteres."),
})

type Datos = z.infer<typeof esquema>

interface Props {
  usuario: Usuario
  onCerrar: () => void
}

export function CambiaClaveDialogo({ usuario, onCerrar }: Props) {
  const cambiarClave = useCambiarClave()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { clave: "" },
  })

  async function guardar(datos: Datos) {
    try {
      await cambiarClave.mutateAsync({ id: usuario.id, clave: datos.clave })
      onCerrar()
    } catch {
      // El error se muestra en el diálogo
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Nueva contraseña para {usuario.usuario}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate>
          <div className="grid gap-4">
            <Campo
              etiqueta="Contraseña nueva"
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
            {cambiarClave.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {mensajeDeError(cambiarClave.error)}
              </p>
            ) : null}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cambiarClave.isPending}>
              {cambiarClave.isPending ? (
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