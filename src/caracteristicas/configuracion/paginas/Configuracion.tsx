import { useState } from "react"
import { LoaderCircleIcon, SettingsIcon } from "lucide-react"
import type { Configuracion } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { Campo } from "@/componentes/comunes/Campo"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button } from "@/componentes/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/componentes/ui/card"
import { Input } from "@/componentes/ui/input"
import { useConfiguracion } from "@/caracteristicas/configuracion/hooks/useConfiguracion"
import { useGuardarConfiguracion } from "@/caracteristicas/configuracion/hooks/useGuardarConfiguracion"

function ConfiguracionForma({ configuracion }: { configuracion: Configuracion[] }) {
  const guardar = useGuardarConfiguracion()
  const [valores, setValores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      configuracion.map((item) => [item.clave, item.valor ?? ""]),
    ),
  )

  const hayCambios = configuracion.some(
    (item) => (valores[item.clave] ?? "") !== (item.valor ?? ""),
  )

  function cambiaValor(clave: string, valor: string) {
    setValores((previos) => ({ ...previos, [clave]: valor }))
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault()
        guardar.mutate(valores)
      }}
      className="max-w-2xl space-y-4"
    >
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <SettingsIcon className="size-4" aria-hidden />
            </div>
            <CardTitle>Datos del negocio</CardTitle>
          </div>
          <CardDescription>
            Esta información aparece en comprobantes y reportes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 py-5">
          {configuracion.map((item) => (
            <Campo key={item.clave} etiqueta={item.descripcion} htmlPara={item.clave}>
              <Input
                id={item.clave}
                value={valores[item.clave] ?? ""}
                onChange={(evento) => cambiaValor(item.clave, evento.target.value)}
                autoComplete="off"
              />
            </Campo>
          ))}
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          {guardar.isSuccess ? (
            <p className="text-sm font-medium text-success" role="status">
              Cambios guardados.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Los cambios se aplican al guardar.
            </p>
          )}
          <Button type="submit" disabled={!hayCambios || guardar.isPending}>
            {guardar.isPending ? (
              <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
            ) : null}
            Guardar cambios
          </Button>
        </CardFooter>
      </Card>
      {guardar.isError ? <AvisoError error={guardar.error} /> : null}
    </form>
  )
}

export function Configuracion() {
  const consulta = useConfiguracion()

  if (consulta.isPending) return <PantallaCarga />

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Configuración"
        descripcion="Parámetros generales del negocio: nombre y fecha de la empresa."
      />
      {consulta.isError ? (
        <AvisoError error={consulta.error} />
      ) : (
        <ConfiguracionForma configuracion={consulta.data} />
      )}
    </div>
  )
}
