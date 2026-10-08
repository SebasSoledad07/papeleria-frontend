import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon } from "lucide-react"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
import type { Categoria } from "@/api/tipos"
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
import { useCrearCategoria } from "@/caracteristicas/categorias/hooks/useCrearCategoria"
import { useEditarCategoria } from "@/caracteristicas/categorias/hooks/useEditarCategoria"

const esquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre.")
    .max(100, "Máximo 100 caracteres."),
})

type Datos = z.infer<typeof esquema>

interface Props {
  categoria?: Categoria
  onCerrar: () => void
}

export function CategoriaDialogo({ categoria, onCerrar }: Props) {
  const crear = useCrearCategoria()
  const editar = useEditarCategoria()
  const mutacion = categoria ? editar : crear
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: categoria?.nombre ?? "" },
  })

  async function guardar(datos: Datos) {
    try {
      if (categoria) {
        await editar.mutateAsync({ id: categoria.id, nombre: datos.nombre })
      } else {
        await crear.mutateAsync(datos.nombre)
      }
      onCerrar()
    } catch {
      // El error se muestra en el diálogo
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {categoria ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {categoria
              ? "Cambia el nombre de la categoría."
              : "Clasifica los productos de la papelería."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate>
          <div className="grid gap-4">
            <Campo
              etiqueta="Nombre"
              htmlPara="nombre"
              error={errors.nombre?.message}
            >
              <Input id="nombre" autoComplete="off" {...register("nombre")} />
            </Campo>
            {mutacion.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {mensajeDeError(mutacion.error)}
              </p>
            ) : null}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutacion.isPending}>
              {mutacion.isPending ? (
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