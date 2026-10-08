import { LoaderCircleIcon, StoreIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
import { useIniciarSesion } from "@/caracteristicas/autenticacion/hooks/useLogin"
import { Campo } from "@/componentes/comunes/Campo"
import { Button } from "@/componentes/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componentes/ui/card"
import { Input } from "@/componentes/ui/input"

const esquema = z.object({
  usuario: z.string().min(1, "Escribe tu usuario."),
  clave: z.string().min(1, "Escribe tu contraseña."),
})

type DatosLogin = z.infer<typeof esquema>

export function Login() {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const iniciarSesion = useIniciarSesion()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosLogin>({
    resolver: zodResolver(esquema),
  })

  const origen = (ubicacion.state as { desde?: string } | null)?.desde ?? "/"

  async function entrar(datos: DatosLogin) {
    try {
      await iniciarSesion.mutateAsync(datos)
      navegar(origen, { replace: true })
    } catch {
      // El error se muestra en el formulario
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <StoreIcon className="size-5" />
          </div>
          <CardTitle className="text-xl">Papelería</CardTitle>
          <CardDescription>Inicia sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(entrar)} className="grid gap-4" noValidate>
            <Campo etiqueta="Usuario" htmlPara="usuario" error={errors.usuario?.message}>
              <Input
                id="usuario"
                autoComplete="username"
                {...register("usuario")}
              />
            </Campo>
            <Campo etiqueta="Contraseña" htmlPara="clave" error={errors.clave?.message}>
              <Input
                id="clave"
                type="password"
                autoComplete="current-password"
                {...register("clave")}
              />
            </Campo>
            {iniciarSesion.isError ? (
              <p className="text-sm text-destructive" role="alert">
                {mensajeDeError(iniciarSesion.error)}
              </p>
            ) : null}
            <Button type="submit" disabled={iniciarSesion.isPending}>
              {iniciarSesion.isPending ? (
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
              ) : null}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}