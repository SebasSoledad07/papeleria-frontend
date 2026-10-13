import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CampoCodigo } from "./CampoCodigo"
import { esCodigoDeBarras, generarCodigoInterno } from "./codigos"

describe("esCodigoDeBarras", () => {
  it("acepta de 8 a 14 dígitos", () => {
    expect(esCodigoDeBarras("12345678")).toBe(true)
    expect(esCodigoDeBarras("7701234567890")).toBe(true)
  })

  it("rechaza texto o longitudes fuera de rango", () => {
    expect(esCodigoDeBarras("lapiz")).toBe(false)
    expect(esCodigoDeBarras("1234567")).toBe(false)
    expect(esCodigoDeBarras("123456789012345")).toBe(false)
  })
})

describe("generarCodigoInterno (RN-15)", () => {
  it("devuelve 13 dígitos que empiezan por 2 y cumplen el dígito de control EAN-13", () => {
    const codigo = generarCodigoInterno()
    expect(codigo).toMatch(/^2\d{12}$/)

    let suma = 0
    for (let i = 0; i < 12; i++) {
      const digito = Number(codigo[i])
      suma += i % 2 === 0 ? digito : digito * 3
    }
    const control = (10 - (suma % 10)) % 10
    expect(Number(codigo[12])).toBe(control)
  })

  it("depende del instante truncado a 12 dígitos (RN-15)", () => {
    const reloj = vi.spyOn(Date, "now")
    reloj.mockReturnValueOnce(1_700_000_000_001)
    const a = generarCodigoInterno()
    reloj.mockReturnValueOnce(1_600_000_000_001)
    const b = generarCodigoInterno()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^2\d{12}$/)
    expect(b).toMatch(/^2\d{12}$/)
    reloj.mockRestore()
  })
})

describe("CampoCodigo", () => {
  it("entrega un código de barras al presionar Enter", async () => {
    const onCodigo = vi.fn()
    const onTexto = vi.fn()
    const usuario = userEvent.setup()
    render(<CampoCodigo onCodigo={onCodigo} onTexto={onTexto} />)

    await usuario.type(screen.getByRole("textbox"), "7701234567890{Enter}")

    expect(onCodigo).toHaveBeenCalledWith("7701234567890")
    expect(onTexto).not.toHaveBeenCalled()
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("entrega texto de búsqueda cuando no es un código de barras", async () => {
    const onCodigo = vi.fn()
    const onTexto = vi.fn()
    const usuario = userEvent.setup()
    render(<CampoCodigo onCodigo={onCodigo} onTexto={onTexto} />)

    await usuario.type(screen.getByRole("textbox"), "cuaderno{Enter}")

    expect(onTexto).toHaveBeenCalledWith("cuaderno")
    expect(onCodigo).not.toHaveBeenCalled()
  })

  it("ignora un valor de una sola letra", async () => {
    const onCodigo = vi.fn()
    const usuario = userEvent.setup()
    render(<CampoCodigo onCodigo={onCodigo} />)

    await usuario.type(screen.getByRole("textbox"), "a{Enter}")

    expect(onCodigo).not.toHaveBeenCalled()
  })
})
