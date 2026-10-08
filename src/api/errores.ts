export class ProblemaApi extends Error {
  readonly estado: number
  readonly codigo?: string
  readonly ruta?: string

  constructor(estado: number, mensaje: string, codigo?: string, ruta?: string) {
    super(mensaje)
    this.name = "ProblemaApi"
    this.estado = estado
    this.codigo = codigo
    this.ruta = ruta
  }
}

export class ErrorSinConexion extends Error {
  constructor() {
    super("Sin conexión con el servidor.")
    this.name = "ErrorSinConexion"
  }
}

interface CuerpoError {
  mensaje?: string
  codigo?: string
  ruta?: string
}

export async function aProblemaApi(respuesta: Response): Promise<ProblemaApi> {
  let cuerpo: CuerpoError | null
  try {
    cuerpo = (await respuesta.json()) as CuerpoError
  } catch {
    cuerpo = null
  }
  const mensaje =
    cuerpo?.mensaje || `Ocurrió un error inesperado (${respuesta.status}).`
  return new ProblemaApi(respuesta.status, mensaje, cuerpo?.codigo, cuerpo?.ruta)
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof ProblemaApi || error instanceof ErrorSinConexion) {
    return error.message
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo."
}