import { useEffect, useRef, useState } from "react"
import { Input } from "@/componentes/ui/input"
import { esCodigoDeBarras } from "./codigos"

interface Props {
  onCodigo?: (codigo: string) => void
  onTexto?: (texto: string) => void
  id?: string
  marcador?: string
  deshabilitado?: boolean
  autoFocus?: boolean
  className?: string
}

export function CampoCodigo({
  onCodigo,
  onTexto,
  id,
  marcador,
  deshabilitado = false,
  autoFocus = true,
  className,
}: Props) {
  const [valor, setValor] = useState("")
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  function entregar() {
    const texto = valor.trim()
    setValor("")
    if (texto.length <= 1) return
    if (esCodigoDeBarras(texto)) {
      onCodigo?.(texto)
    } else if (onTexto) {
      onTexto(texto)
    } else {
      onCodigo?.(texto)
    }
  }

  function alPerderFoco() {
    // Conserva el foco (RNF-05) salvo que el foco haya pasado a otro control
    // de forma intencional o haya una ventana modal abierta.
    window.setTimeout(() => {
      if (document.querySelector('[role="dialog"]')) return
      if (document.activeElement === document.body) ref.current?.focus()
    }, 0)
  }

  return (
    <Input
      ref={ref}
      id={id}
      className={className}
      placeholder={marcador}
      value={valor}
      disabled={deshabilitado}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      onChange={(evento) => setValor(evento.target.value)}
      onBlur={alPerderFoco}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") {
          evento.preventDefault()
          entregar()
        }
      }}
    />
  )
}
