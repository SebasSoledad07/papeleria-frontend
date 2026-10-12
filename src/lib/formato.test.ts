import { describe, expect, it } from "vitest"
import { formatearDinero, formatearFecha, formatearFechaHora } from "./formato"

// RN-03: el dinero se muestra en pesos, sin decimales. Intl usa un espacio
// duro (U+00A0) entre el símbolo y la cifra.
describe("formatearDinero", () => {
  it("formatea $ 4.500", () => {
    expect(formatearDinero(4500)).toBe("$\u00a04.500")
  })

  it("formatea $ 125.000", () => {
    expect(formatearDinero(125000)).toBe("$\u00a0125.000")
  })

  it("formatea $ 0", () => {
    expect(formatearDinero(0)).toBe("$\u00a00")
  })

  it("no muestra decimales", () => {
    expect(formatearDinero(4500)).not.toContain(",")
  })
})

// RN-39: fechas y horas en America/Bogota.
describe("formato de fechas", () => {
  it("formatea fecha y hora en zona de Bogotá", () => {
    const salida = formatearFechaHora("2026-01-15T15:30:00Z")
    expect(salida).toContain("15/01/26")
    expect(salida).toContain("10:30")
  })

  it("formatea la fecha larga", () => {
    expect(formatearFecha("2026-01-15T15:30:00Z")).toContain("2026")
  })
})
