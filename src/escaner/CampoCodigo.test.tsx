import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CampoCodigo } from "./CampoCodigo"
import { esCodigoDeBarras } from "./codigos"

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
