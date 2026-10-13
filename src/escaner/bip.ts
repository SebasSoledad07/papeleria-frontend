interface Preferencias {
  sonido?: boolean
}

const CLAVE_PREFERENCIAS = "papeleria:preferencias"

let contexto: AudioContext | null = null

function sonidoActivo(): boolean {
  if (typeof localStorage === "undefined") return true
  try {
    const crudo = localStorage.getItem(CLAVE_PREFERENCIAS)
    if (!crudo) return true
    const preferencias = JSON.parse(crudo) as Preferencias
    return preferencias.sonido !== false
  } catch {
    return true
  }
}

function obtenerContexto(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (contexto) {
    if (contexto.state === "suspended") void contexto.resume()
    return contexto
  }
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  contexto = new Ctor()
  return contexto
}

function tono(frecuencia: number, duracionSegundos: number, volumen: number) {
  if (!sonidoActivo()) return
  const audio = obtenerContexto()
  if (!audio) return
  const oscilador = audio.createOscillator()
  const ganancia = audio.createGain()
  oscilador.type = "sine"
  oscilador.frequency.value = frecuencia
  ganancia.gain.value = volumen
  oscilador.connect(ganancia)
  ganancia.connect(audio.destination)
  const ahora = audio.currentTime
  oscilador.start(ahora)
  ganancia.gain.setValueAtTime(volumen, ahora)
  ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + duracionSegundos)
  oscilador.stop(ahora + duracionSegundos)
}

// Bip de lectura correcta (RF-13): tono agudo y corto.
export function bipExito() {
  tono(880, 0.08, 0.2)
}

// Tono mas grave y largo para errores (producto no registrado).
export function bipError() {
  tono(300, 0.18, 0.2)
}

// Desbloquea el AudioContext en la primera interaccion del usuario.
export function prepararSonido() {
  obtenerContexto()
}
