import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { PantallaCarga } from "@/componentes/comunes/PantallaCarga"
import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import { apiGet } from "@/api/cliente"
import { formatearDinero } from "@/lib/formato"

function esDinero(clave: string) {
  return /cop|total|valor|costo|utilidad|precio|ticket|iva/i.test(clave)
}

function TablaGenerica({ filas }: { filas: Record<string, unknown>[] }) {
  if (filas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 p-10 text-center text-sm text-muted-foreground">
        Sin datos.
      </div>
    )
  }
  const columnas = Object.keys(filas[0])
  return (
    <div className="overflow-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columnas.map((c) => (
              <th key={c} className="p-2 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-b last:border-0">
              {columnas.map((c) => {
                const valor = fila[c]
                const texto =
                  typeof valor === "number" && esDinero(c)
                    ? formatearDinero(valor)
                    : String(valor ?? "")
                return (
                  <td key={c} className="p-2">
                    {texto}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Reporte() {
  const params = useParams<{ nombre: string }>()
  const nombre = params.nombre ?? ""
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [aplicados, setAplicados] = useState({ desde: "", hasta: "" })

  const consulta = useQuery({
    queryKey: ["reporte", nombre, aplicados.desde, aplicados.hasta],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (aplicados.desde) qs.set("desde", aplicados.desde)
      if (aplicados.hasta) qs.set("hasta", aplicados.hasta)
      const url = `/api/reporte/${nombre}${qs.toString() ? `?${qs}` : ""}`
      return apiGet<unknown>(url)
    },
  })

  async function exportar(formato: "xlsx" | "pdf") {
    try {
      const qs = new URLSearchParams({ reporte: nombre, formato })
      if (aplicados.desde) qs.set("desde", aplicados.desde)
      if (aplicados.hasta) qs.set("hasta", aplicados.hasta)
      const respuesta = await fetch(`/api/reporte/exportar?${qs}`, {
        credentials: "include",
      })
      const blob = await respuesta.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${nombre}.${formato === "pdf" ? "pdf" : "xlsx"}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }

  if (consulta.isPending) return <PantallaCarga />

  const datos = consulta.data
  let filas: Record<string, unknown>[] = []
  let extra: React.ReactNode = null
  if (Array.isArray(datos)) {
    filas = datos as Record<string, unknown>[]
  } else if (datos && typeof datos === "object") {
    const obj = datos as Record<string, unknown>
    if (Array.isArray(obj.periodos)) {
      filas = obj.periodos as Record<string, unknown>[]
      if (Array.isArray(obj.pagos)) {
        extra = (
          <div className="space-y-2">
            <h3 className="font-medium">Pagos</h3>
            <TablaGenerica filas={obj.pagos as Record<string, unknown>[]} />
          </div>
        )
      }
    } else {
      filas = [obj]
    }
  }

  return (
    <div className="space-y-6">
      <PaginaTitulo titulo={nombre} descripcion="Reporte" />
      {consulta.isError ? (
        <AvisoError error={consulta.error as Error} />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
        <Input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
        <Button
          onClick={() => setAplicados({ desde, hasta })}
        >
          Aplicar
        </Button>
        <Button variant="outline" onClick={() => void exportar("xlsx")}>
          Excel
        </Button>
        <Button variant="outline" onClick={() => void exportar("pdf")}>
          PDF
        </Button>
      </div>
      <TablaGenerica filas={filas} />
      {extra}
    </div>
  )
}