import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import type { Rol } from "@/api/tipos"
import { servidor } from "@/pruebas/mocks/servidor"
import { Panel } from "./Panel"

function responderSesion(rol: Rol) {
  servidor.use(
    http.get("/api/auth/sesion", () =>
      HttpResponse.json({ nombre: "Prueba", rol }),
    ),
  )
}

function renderPanel() {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter>
        <Panel />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("Panel", () => {
  it("muestra los accesos de administración al ADMIN", async () => {
    responderSesion("ADMIN")
    renderPanel()

    expect(await screen.findByRole("link", { name: /Productos/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Usuarios/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Configuración/ })).toBeInTheDocument()
  })

  it("oculta los accesos de administración al CAJERO", async () => {
    responderSesion("CAJERO")
    renderPanel()

    expect(await screen.findByRole("link", { name: /Productos/ })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Usuarios/ })).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: /Configuración/ }),
    ).not.toBeInTheDocument()
  })
})
