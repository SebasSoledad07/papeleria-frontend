import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon } from "lucide-react"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
import type { EntradaProveedor, Proveedor } from "@/api/tipos"
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
import { useCrearProveedor } from "@/caracteristicas/proveedores/hooks/useCrearProveedor"
import { useEditarProveedor } from "@/caracteristicas/proveedores/hooks/useEditarProveedor"

const esquema = z.object({
  razonSocial: z
    .string()
    .trim()
    .min(1, "Escribe la razón social.")
    .max(150, "Máximo 150 caracteres."),
  nit: z
    .string()
    .trim()
    .min(1, "Escribe el NIT.")
    .max(20, "Máximo 20 caracteres."),
  telefono: z.string().trim().max(30, "Máximo 30 caracteres."),
  direccion: z.string().trim().max(150, "Máximo 150 caracteres."),
})

type Datos = z.infer<typeof esquema>

interface Props {
  proveedor?: Proveedor
  onCerrar: () => void
}

export function ProveedorDialogo({ proveedor, onCerrar }: Props) {
  const crear = useCrearProveedor()
  const editar = useEditarProveedor()
  const mutacion = proveedor ? editar : crear
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      razonSocial: proveedor?.razonSocial ?? "",
      nit: proveedor?.nit ?? "",
      telefono: proveedor?.telefono ?? "",
      direccion: proveedor?.direccion ?? "",
    },
  })

  function aEntrada(datos: Datos): EntradaProveedor {
    return {
      razonSocial: datos.razonSocial,
      nit: datos.nit,
      telefono: datos.telefono || undefined,
      direccion: datos.direccion || undefined,
    }
  }

  async function guardar(datos: Datos) {
    try {
      if (proveedor) {
        await editar.mutateAsync({ id: proveedor.id, entrada: aEntrada(datos) })
      } else {
        await crear.mutateAsync(aEntrada(datos))
      }
      onCerrar()
    } catch {
      // El error se muestra en el diálogo
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {proveedor ? "Editar proveedor" : "Nuevo proveedor"}
          </DialogTitle>
          <DialogDescription>
            Datos de la empresa que surte los productos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate>
          <div className="grid gap-4">
            <Campo
              etiqueta="Razón social"
              htmlPara="razonSocial"
              error={errors.razonSocial?.message}
            >
              <Input
                id="razonSocial"
                autoComplete="off"
                {...register("razonSocial")}
              />
            </Campo>
            <Campo etiqueta="NIT" htmlPara="nit" error={errors.nit?.message}>
              <Input id="nit" autoComplete="off" {...register("nit")} />
            </Campo>
            <Campo
              etiqueta="Teléfono"
              htmlPara="telefono"
              error={errors.telefono?.message}
            >
              <Input
                id="telefono"
                autoComplete="off"
                {...register("telefono")}
              />
            </Campo>
            <Campo
              etiqueta="Dirección"
              htmlPara="direccion"
              error={errors.direccion?.message}
            >
              <Input
                id="direccion"
                autoComplete="off"
                {...register("direccion")}
              />
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