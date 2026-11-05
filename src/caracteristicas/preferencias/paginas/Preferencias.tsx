import { useState } from "react"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { Button } from "@/componentes/ui/button"
import { cn } from "@/lib/utils"

interface Preferencias {
  anchoTirilla: "58" | "80"
  imprimirAutomatico: boolean
  sonidoLectura: boolean
  camara: "auto" | "trasera"
}

const CLAVE = "preferencias-papeleria"

function cargar(): Preferencias {
  try {
    const raw = localStorage.getItem(CLAVE)
    if (raw) return JSON.parse(raw) as Preferencias
  } catch {
    // ignore
  }
  return {
    anchoTirilla: "80",
    imprimirAutomatico: true,
    sonidoLectura: true,
    camara: "auto",
  }
}

export function Preferencias() {
  const [prefs, setPrefs] = useState<Preferencias>(cargar())
  const [guardado, setGuardado] = useState(false)

  function guardar() {
    localStorage.setItem(CLAVE, JSON.stringify(prefs))
    setGuardado(true)
    window.setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Preferencias de este equipo"
        descripcion="Se guardan en este navegador."
      />
      <div className="max-w-md space-y-4 rounded-xl border bg-card p-4">
        <div>
          <label className="text-sm font-medium">Ancho de tirilla</label>
          <div className="mt-1 flex gap-2">
            {(["58", "80"] as const).map((ancho) => (
              <button
                key={ancho}
                type="button"
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm",
                  prefs.anchoTirilla === ancho
                    ? "bg-primary text-primary-foreground"
                    : "bg-background",
                )}
                onClick={() =>
                  setPrefs((p) => ({ ...p, anchoTirilla: ancho }))
                }
              >
                {ancho} mm
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.imprimirAutomatico}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                imprimirAutomatico: e.target.checked,
              }))
            }
          />
          Imprimir tirilla automáticamente
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.sonidoLectura}
            onChange={(e) =>
              setPrefs((p) => ({ ...p, sonidoLectura: e.target.checked }))
            }
          />
          Sonido de lectura
        </label>
        <div>
          <label className="text-sm font-medium">Cámara preferida</label>
          <select
            className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-2 py-1 text-sm"
            value={prefs.camara}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                camara: e.target.value as Preferencias["camara"],
              }))
            }
          >
            <option value="auto">Automática</option>
            <option value="trasera">Trasera</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={guardar}>Guardar</Button>
          {guardado ? (
            <span className="text-sm text-muted-foreground">Guardado.</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}