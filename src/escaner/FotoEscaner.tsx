import { useRef, useState } from "react"
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react"
import { apiSubir } from "@/api/cliente"
import { mensajeDeError } from "@/api/errores"
import type { LecturaCodigo } from "@/api/tipos"
import { Button } from "@/componentes/ui/button"

const LADO_MAXIMO = 1600

async function reducirImagen(archivo: File): Promise<Blob> {
  try {
    const mapaBits = await createImageBitmap(archivo)
    const escala = Math.min(1, LADO_MAXIMO / Math.max(mapaBits.width, mapaBits.height))
    if (escala === 1) {
      mapaBits.close()
      return archivo
    }
    const lienzo = document.createElement("canvas")
    lienzo.width = Math.round(mapaBits.width * escala)
    lienzo.height = Math.round(mapaBits.height * escala)
    const contexto = lienzo.getContext("2d")
    if (!contexto) {
      mapaBits.close()
      return archivo
    }
    contexto.drawImage(mapaBits, 0, 0, lienzo.width, lienzo.height)
    mapaBits.close()
    return await new Promise<Blob>((resolver) =>
      lienzo.toBlob((blob) => resolver(blob ?? archivo), "image/jpeg", 0.85),
    )
  } catch {
    return archivo
  }
}

interface Props {
  onCodigo: (codigo: string) => void
  deshabilitado?: boolean
  className?: string
}

export function FotoEscaner({ onCodigo, deshabilitado, className }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar(archivo: File) {
    setCargando(true)
    setError(null)
    try {
      const reducida = await reducirImagen(archivo)
      const datos = new FormData()
      datos.append("archivo", reducida, archivo.name || "foto.jpg")
      const lectura = await apiSubir<LecturaCodigo>("/api/codigos/decodificar", datos)
      onCodigo(lectura.codigo)
    } catch (fallo) {
      setError(mensajeDeError(fallo))
    } finally {
      setCargando(false)
      if (entrada.current) entrada.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(evento) => {
          const archivo = evento.target.files?.[0]
          if (archivo) void enviar(archivo)
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={deshabilitado || cargando}
        onClick={() => entrada.current?.click()}
      >
        {cargando ? (
          <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
        ) : (
          <ImageUpIcon className="size-4" aria-hidden />
        )}
        Leer código de una foto
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
