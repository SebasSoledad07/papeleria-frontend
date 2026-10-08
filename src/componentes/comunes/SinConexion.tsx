import { useEffect, useState } from "react"
import { WifiOffIcon } from "lucide-react"

export function SinConexion() {
  const [enLinea, setEnLinea] = useState(navigator.onLine)

  useEffect(() => {
    const alConectar = () => setEnLinea(true)
    const alDesconectar = () => setEnLinea(false)
    window.addEventListener("online", alConectar)
    window.addEventListener("offline", alDesconectar)
    return () => {
      window.removeEventListener("online", alConectar)
      window.removeEventListener("offline", alDesconectar)
    }
  }, [])

  if (enLinea) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sticky top-0 z-50 flex items-center gap-2 border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive"
    >
      <WifiOffIcon className="size-4 shrink-0" />
      Sin conexión. No se guardarán los cambios hasta que se restablezca la conexión.
    </div>
  )
}