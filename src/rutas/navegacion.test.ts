import { describe, expect, it } from "vitest"
import { menu, menuPorRol } from "./navegacion"

describe("menuPorRol", () => {
  it("el administrador ve todo el menú", () => {
    expect(menuPorRol("ADMIN")).toHaveLength(menu.length)
  })

  it("el cajero solo ve el panel mientras no existan sus pantallas", () => {
    const rutas = menuPorRol("CAJERO").map((item) => item.ruta)
    expect(rutas).toEqual(["/"])
  })

  it("el bodeguero solo ve el panel mientras no existan sus pantallas", () => {
    const rutas = menuPorRol("BODEGUERO").map((item) => item.ruta)
    expect(rutas).toEqual(["/"])
  })

  it("sin rol no muestra nada", () => {
    expect(menuPorRol(undefined)).toEqual([])
  })

  it("ninguna ruta de administración aparece para el cajero", () => {
    const rutas = menuPorRol("CAJERO").map((item) => item.ruta)
    expect(rutas).not.toContain("/usuarios")
    expect(rutas).not.toContain("/configuracion")
  })
})
