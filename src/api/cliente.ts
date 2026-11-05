import { aProblemaApi, ErrorSinConexion } from "./errores"

const BASE = import.meta.env.VITE_API_URL ?? ""

type Encabezados = Record<string, string>

export type OpcionesPeticion = Omit<RequestInit, "headers"> & {
  headers?: Encabezados
}

export async function peticionApi<T>(
  ruta: string,
  opciones: OpcionesPeticion = {},
): Promise<T> {
  const { headers, ...rest } = opciones
  const esFormData = rest.body instanceof FormData
  let respuesta: Response
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      ...rest,
      credentials: "include",
      headers: {
        ...(esFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
    })
  } catch {
    throw new ErrorSinConexion()
  }
  if (!respuesta.ok) throw await aProblemaApi(respuesta)
  if (respuesta.status === 204) return undefined as T
  const texto = await respuesta.text()
  if (texto.trim() === "") return undefined as T
  return JSON.parse(texto) as T
}

export function apiGet<T>(ruta: string): Promise<T> {
  return peticionApi<T>(ruta)
}

export function apiPost<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return peticionApi<T>(ruta, { method: "POST", body: JSON.stringify(cuerpo) })
}

export function apiPut<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return peticionApi<T>(ruta, { method: "PUT", body: JSON.stringify(cuerpo) })
}

export function apiDelete(ruta: string): Promise<void> {
  return peticionApi<void>(ruta, { method: "DELETE" })
}

export function apiSubir<T>(ruta: string, datos: FormData): Promise<T> {
  return peticionApi<T>(ruta, { method: "POST", body: datos })
}