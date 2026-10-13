import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { servidor } from "@/pruebas/mocks/servidor"
import { Productos } from "./Productos"

function responderSesion(rol: "ADMIN" | "CAJERO") {
  servidor.use(
    http.get("/api/auth/sesion", () =>
      HttpResponse.json({ nombre: "Prueba", rol }),
    ),
  )
}

function renderProductos() {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("Productos", () => {
  it("lista los productos con precio formateado y estado de stock", async () => {
    responderSesion("ADMIN")
    renderProductos()

    expect(await screen.findByText("Lápiz Mirado N°2")).toBeInTheDocument()
    expect(screen.getByText("$ 1.000")).toBeInTheDocument()
    expect(screen.getByText("Cuaderno cosido")).toBeInTheDocument()
    expect(screen.getByText("Agotado")).toBeInTheDocument()
  })

  it("muestra la columna de costo solo al administrador", async () => {
    responderSesion("ADMIN")
    renderProductos()

    expect(await screen.findByText("Lápiz Mirado N°2")).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Costo" }),
    ).toBeInTheDocument()
  })

  it("oculta la columna de costo al cajero", async () => {
    responderSesion("CAJERO")
    renderProductos()

    expect(await screen.findByText("Lápiz Mirado N°2")).toBeInTheDocument()
    expect(
      screen.queryByRole("columnheader", { name: "Costo" }),
    ).not.toBeInTheDocument()
  })

  it("busca por nombre tras el retardo de escritura", async () => {
    responderSesion("ADMIN")
    const usuario = userEvent.setup()
    renderProductos()

    await screen.findByText("Lápiz Mirado N°2")
    await usuario.type(
      screen.getByRole("textbox", { name: "Buscar producto" }),
      "cuaderno",
    )

    await waitFor(
      () => {
        expect(screen.queryByText("Lápiz Mirado N°2")).not.toBeInTheDocument()
        expect(screen.queryByText("Cargando…")).not.toBeInTheDocument()
      },
      { timeout: 3000 },
    )
    expect(screen.getByText("Cuaderno cosido")).toBeInTheDocument()
  })
})
