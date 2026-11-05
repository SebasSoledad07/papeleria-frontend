import { LoaderCircleIcon, StoreIcon } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { mensajeDeError } from "@/api/errores"
import { useIniciarSesion } from "@/caracteristicas/autenticacion/hooks/useLogin"
import { Campo } from "@/componentes/comunes/Campo"
import { Button } from "@/componentes/ui/button"
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
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -bottom-28 size-96 rotate-12 rounded-[2rem] border border-primary-foreground/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 -bottom-10 size-64 -rotate-6 rounded-[2rem] border border-primary-foreground/15"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary-foreground/25 bg-primary-foreground/10">
            <StoreIcon className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-heading text-lg leading-tight font-semibold">
              Papelería
            </p>
            <p className="text-[0.65rem] tracking-[0.14em] uppercase opacity-70">
              Inventario y ventas
            </p>
          </div>
        </div>

        <div className="relative max-w-md space-y-4">
          <p className="text-xs font-medium tracking-[0.14em] uppercase opacity-70">
            Punto de venta
          </p>
          <h1 className="text-4xl leading-tight font-semibold">
            Tu papelería, en orden.
          </h1>
          <p className="text-sm leading-relaxed opacity-80">
            Controla inventario, precios y ventas desde un solo lugar, con la
            agilidad que necesita la caja.
          </p>
        </div>

        <p className="relative text-xs opacity-60">
          Comprobante de venta — no es factura electrónica
        </p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <StoreIcon className="size-5" aria-hidden />
            </div>
            <div>
              <p className="font-heading text-lg leading-tight font-semibold">
                Papelería
              </p>
              <p className="text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
                Inventario y ventas
              </p>
            </div>
          </div>

          <header className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold">Inicia sesión</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa con tu usuario para continuar.
            </p>
          </header>

          <form onSubmit={handleSubmit(entrar)} className="grid gap-4" noValidate>
            <Campo etiqueta="Usuario" htmlPara="usuario" error={errors.usuario?.message}>
              <Input
                id="usuario"
                autoComplete="username"
                autoFocus
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
              <p
                className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {mensajeDeError(iniciarSesion.error)}
              </p>
            ) : null}
            <Button type="submit" size="lg" disabled={iniciarSesion.isPending}>
              {iniciarSesion.isPending ? (
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
              ) : null}
              Entrar
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
