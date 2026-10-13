import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it } from "vitest"
import { reiniciarCatalogo } from "@/pruebas/mocks/handlers"
import { servidor } from "@/pruebas/mocks/servidor"
import { Productos } from "./Productos"

function responderSesion(rol: "ADMIN" | "CAJERO" | "BODEGUERO") {
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
  beforeEach(() => reiniciarCatalogo())
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

  it("ofrece el alta al ADMIN por la ruta de nuevo producto", async () => {
    responderSesion("ADMIN")
    renderProductos()

    const enlace = await screen.findByRole("link", { name: "Nuevo producto" })
    expect(enlace).toHaveAttribute("href", "/productos/nuevo")
  })

  it("oculta crear y editar al cajero", async () => {
    responderSesion("CAJERO")
    renderProductos()

    await screen.findByText("Lápiz Mirado N°2")
    expect(
      screen.queryByRole("link", { name: "Nuevo producto" }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Editar/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Inactivar/ }),
    ).not.toBeInTheDocument()
  })

  it("inactiva un producto tras confirmar (RF-07, RN-17)", async () => {
    responderSesion("ADMIN")
    const usuario = userEvent.setup()
    renderProductos()

    await screen.findByText("Lápiz Mirado N°2")
    await usuario.click(
      screen.getByRole("button", { name: "Inactivar Lápiz Mirado N°2" }),
    )

    const dialogo = await screen.findByRole("dialog")
    await usuario.click(within(dialogo).getByRole("button", { name: "Inactivar" }))

    await waitFor(() => {
      expect(screen.queryByText("Lápiz Mirado N°2")).not.toBeInTheDocument()
    })
    expect(screen.getByText("Cuaderno cosido")).toBeInTheDocument()
  })

  it("abre la edición de un producto en diálogo", async () => {
    responderSesion("ADMIN")
    const usuario = userEvent.setup()
    renderProductos()

    await screen.findByText("Lápiz Mirado N°2")
    await usuario.click(
      screen.getByRole("button", { name: "Editar Lápiz Mirado N°2" }),
    )

    const dialogo = await screen.findByRole("dialog")
    expect(within(dialogo).getByText("Editar producto")).toBeInTheDocument()
    expect(within(dialogo).getByLabelText("Nombre")).toHaveValue(
      "Lápiz Mirado N°2",
    )
  })
})
