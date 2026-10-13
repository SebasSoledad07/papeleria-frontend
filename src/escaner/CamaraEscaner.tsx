import { useCallback, useEffect, useRef, useState } from "react"
import { CameraIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import { BarcodeDetector } from "barcode-detector/ponyfill"
import type { BarcodeFormat, DetectedBarcode } from "barcode-detector/ponyfill"
import { Button } from "@/componentes/ui/button"
import { bipError, bipExito, prepararSonido } from "@/escaner/bip"

const FORMATOS: BarcodeFormat[] = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
]

const INTERVALO_MS = 200
const ANTIRREBOTE_MS = 2000

type Estado = "iniciando" | "activo" | "error"

interface Props {
  onCodigo: (codigo: string) => void
  cerrarTrasLectura?: boolean
  alCerrar?: () => void
  className?: string
}

function mensajeDeCamara(fallo: unknown): string {
  if (fallo instanceof DOMException) {
    if (fallo.name === "NotAllowedError") {
      return "Permiso de cámara denegado. Habilítalo o usa una foto."
    }
    if (fallo.name === "NotFoundError") {
      return "No se encontró ninguna cámara. Usa una foto."
    }
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "La cámara solo funciona en una conexión segura (HTTPS)."
  }
  return "No se pudo abrir la cámara. Usa una foto."
}

export function CamaraEscaner({
  onCodigo,
  cerrarTrasLectura = false,
  alCerrar,
  className,
}: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const flujo = useRef<MediaStream | null>(null)
  const intervalo = useRef<number | null>(null)
  const ultimoCodigo = useRef<string | null>(null)
  const ultimoMomento = useRef(0)
  const alLeer = useRef(onCodigo)
  const [estado, setEstado] = useState<Estado>("iniciando")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    alLeer.current = onCodigo
  }, [onCodigo])

  const detener = useCallback(() => {
    if (intervalo.current !== null) {
      window.clearInterval(intervalo.current)
      intervalo.current = null
    }
    flujo.current?.getTracks().forEach((pista) => pista.stop())
    flujo.current = null
  }, [])

  const dibujar = useCallback((detecciones: DetectedBarcode[]) => {
    const canvas = lienzo.current
    const videoActual = video.current
    if (!canvas || !videoActual) return
    canvas.width = videoActual.videoWidth
    canvas.height = videoActual.videoHeight
    const contexto = canvas.getContext("2d")
    if (!contexto) return
    contexto.clearRect(0, 0, canvas.width, canvas.height)
    contexto.strokeStyle = "#22c55e"
    contexto.lineWidth = 4
    for (const deteccion of detecciones) {
      const caja = deteccion.boundingBox
      contexto.strokeRect(caja.x, caja.y, caja.width, caja.height)
    }
  }, [])

  useEffect(() => {
    let activo = true

    async function iniciar() {
      prepararSonido()
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setEstado("error")
        setError(
          typeof window !== "undefined" && !window.isSecureContext
            ? "La cámara solo funciona en una conexión segura (HTTPS)."
            : "Este dispositivo no tiene cámara disponible. Usa una foto.",
        )
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        })
        if (!activo) {
          stream.getTracks().forEach((pista) => pista.stop())
          return
        }
        flujo.current = stream
        if (video.current) {
          video.current.srcObject = stream
          await video.current.play()
        }
        const detector = new BarcodeDetector({ formats: FORMATOS })
        setEstado("activo")
        intervalo.current = window.setInterval(async () => {
          const videoActual = video.current
          if (!videoActual || videoActual.readyState < 2) return
          try {
            const detecciones = await detector.detect(videoActual)
            dibujar(detecciones)
            const primera = detecciones[0]
            if (!primera) return
            const ahora = Date.now()
            if (
              primera.rawValue === ultimoCodigo.current &&
              ahora - ultimoMomento.current < ANTIRREBOTE_MS
            ) {
              return
            }
            ultimoCodigo.current = primera.rawValue
            ultimoMomento.current = ahora
            bipExito()
            alLeer.current(primera.rawValue)
            if (cerrarTrasLectura) alCerrar?.()
          } catch {
            bipError()
          }
        }, INTERVALO_MS)
      } catch (fallo) {
        if (!activo) return
        setEstado("error")
        setError(mensajeDeCamara(fallo))
      }
    }

    void iniciar()
    return () => {
      activo = false
      detener()
    }
  }, [cerrarTrasLectura, alCerrar, detener, dibujar])

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-lg bg-black">
        <video
          ref={video}
          className="block h-auto w-full"
          playsInline
          muted
          aria-label="Vista de la cámara"
        />
        <canvas
          ref={lienzo}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        {estado === "iniciando" ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <LoaderCircleIcon className="size-6 animate-spin" aria-hidden />
          </div>
        ) : null}
      </div>
      {estado === "error" ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <CameraIcon className="size-4" aria-hidden />
          Apunta la cámara al código de barras.
        </p>
      )}
      {alCerrar ? (
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={alCerrar}
        >
          <XIcon className="size-4" aria-hidden />
          Cerrar cámara
        </Button>
      ) : null}
    </div>
  )
}
