import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"
import type { Rol } from "@/api/tipos"
import { servidor } from "@/pruebas/mocks/servidor"
import { RutaProtegida } from "./RutaProtegida"

function responderSesion(rol: Rol) {
  servidor.use(
    http.get("/api/auth/sesion", () =>
      HttpResponse.json({ nombre: "Prueba", rol }),
    ),
  )
}

function responderSinSesion() {
  servidor.use(
    http.get("/api/auth/sesion", () => new HttpResponse(null, { status: 401 })),
  )
}

function renderEn(ruta: string) {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route path="/" element={<RutaProtegida />}>
            <Route index element={<p>Panel</p>} />
            <Route
              path="usuarios"
              element={
                <RutaProtegida roles={["ADMIN"]}>
                  <p>Pantalla de usuarios</p>
                </RutaProtegida>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("RutaProtegida", () => {
  it("deja pasar al administrador a una pantalla de administración", async () => {
    responderSesion("ADMIN")
    renderEn("/usuarios")

    expect(await screen.findByText("Pantalla de usuarios")).toBeInTheDocument()
    expect(screen.queryByText("No tienes permiso")).not.toBeInTheDocument()
  })

  it("muestra «No tienes permiso» al cajero que entra a administración", async () => {
    responderSesion("CAJERO")
    renderEn("/usuarios")

    expect(await screen.findByText("No tienes permiso")).toBeInTheDocument()
    expect(screen.queryByText("Pantalla de usuarios")).not.toBeInTheDocument()
  })

  it("deja pasar al cajero al panel", async () => {
    responderSesion("CAJERO")
    renderEn("/")

    expect(await screen.findByText("Panel")).toBeInTheDocument()
  })

  it("redirige al login si no hay sesión", async () => {
    responderSinSesion()
    renderEn("/usuarios")

    expect(await screen.findByText("Pantalla de login")).toBeInTheDocument()
  })
})
