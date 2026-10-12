import { describe, expect, it } from "vitest"
import { aProblemaApi, ErrorSinConexion, mensajeDeError, ProblemaApi } from "./errores"

describe("aProblemaApi", () => {
  it("toma mensaje, codigo y ruta del cuerpo", async () => {
    const respuesta = new Response(
      JSON.stringify({
        mensaje: "Stock insuficiente.",
        codigo: "STOCK_INSUFICIENTE",
        ruta: "/api/ventas",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )

    const problema = await aProblemaApi(respuesta)

    expect(problema.estado).toBe(400)
    expect(problema.codigo).toBe("STOCK_INSUFICIENTE")
    expect(problema.ruta).toBe("/api/ventas")
    expect(problema.message).toBe("Stock insuficiente.")
  })

  it("usa un mensaje por defecto si el cuerpo no es JSON", async () => {
    const respuesta = new Response("no soy json", { status: 500 })

    const problema = await aProblemaApi(respuesta)

    expect(problema.estado).toBe(500)
    expect(problema.message).toContain("500")
  })
})

describe("mensajeDeError", () => {
  it("devuelve el mensaje de un ProblemaApi", () => {
    expect(mensajeDeError(new ProblemaApi(403, "No tienes permiso."))).toBe(
      "No tienes permiso.",
    )
  })

  it("devuelve el aviso de sin conexión", () => {
    expect(mensajeDeError(new ErrorSinConexion())).toBe(
      "Sin conexión con el servidor.",
    )
  })

  it("devuelve un mensaje genérico para errores desconocidos", () => {
    expect(mensajeDeError("cualquier cosa")).toBe(
      "Ocurrió un error inesperado. Inténtalo de nuevo.",
    )
  })
})
