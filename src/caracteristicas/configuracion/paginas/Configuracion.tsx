import { useState } from "react"
import { LoaderCircleIcon } from "lucide-react"
import type { Configuracion } from "@/api/tipos"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button } from "@/componentes/ui/button"
import { Card, CardContent } from "@/componentes/ui/card"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
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
      className="max-w-xl"
    >
      <Card>
        <CardContent className="grid gap-5 py-4">
          {configuracion.map((item) => (
            <div key={item.clave} className="grid gap-1.5">
              <Label htmlFor={item.clave}>{item.descripcion}</Label>
              <Input
                id={item.clave}
                value={valores[item.clave] ?? ""}
                onChange={(evento) => cambiaValor(item.clave, evento.target.value)}
                autoComplete="off"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      {guardar.isError ? <AvisoError error={guardar.error} /> : null}
      {guardar.isSuccess ? (
        <p className="mt-3 text-sm text-foreground" role="status">
          Cambios guardados.
        </p>
      ) : null}
      <Button
        className="mt-4"
        disabled={!hayCambios || guardar.isPending}
        type="submit"
      >
        {guardar.isPending ? (
          <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
        ) : null}
        Guardar cambios
      </Button>
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