import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it } from "vitest"
import type { Producto } from "@/api/tipos"
import { reiniciarCatalogo } from "@/pruebas/mocks/handlers"
import { servidor } from "@/pruebas/mocks/servidor"
import { NuevoProducto } from "./NuevoProducto"

const productoInactivo: Producto = {
  ...productoEsperado(),
  activo: false,
}

function productoEsperado(): Producto {
  return {
    id: 1,
    codigoBarras: "7701234567890",
    nombre: "Lápiz Mirado N°2",
    marca: "Mirado",
    categoriaId: 1,
    categoriaNombre: "Escritura",
    proveedorId: 1,
    proveedorNombre: "Distribuidora Escolar",
    unidad: "UNIDAD",
    tarifaIva: "19",
    precioVenta: 1000,
    costo: 600,
    stock: 50,
    stockMinimo: 10,
    activo: true,
  }
}

function renderNuevoProducto() {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter>
        <NuevoProducto />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function escanear(usuario: ReturnType<typeof userEvent.setup>, codigo: string) {
  const campo = screen.getByPlaceholderText("Escanea o escribe el código de barras…")
  await usuario.type(campo, codigo)
  await usuario.keyboard("{Enter}")
}

describe("NuevoProducto", () => {
  beforeEach(() => reiniciarCatalogo())

  it("abre la edición al escanear un código ya registrado (RN-13)", async () => {
    const usuario = userEvent.setup()
    renderNuevoProducto()

    await escanear(usuario, "7701234567890")

    const dialogo = await screen.findByRole("dialog")
    expect(within(dialogo).getByText("Editar producto")).toBeInTheDocument()
    expect(
      within(dialogo).getByText("Este código ya está registrado. Puedes editarlo aquí."),
    ).toBeInTheDocument()
    const nombre = within(dialogo).getByLabelText("Nombre")
    expect(nombre).toHaveValue("Lápiz Mirado N°2")
  })

  it("prellena el alta con la sugerencia del catálogo externo (RF-02, RN-16)", async () => {
    const usuario = userEvent.setup()
    renderNuevoProducto()

    await escanear(usuario, "8807654321098")

    const dialogo = await screen.findByRole("dialog")
    expect(within(dialogo).getByText("Nuevo producto")).toBeInTheDocument()
    expect(
      within(dialogo).getByText(
        "Datos sugeridos del catálogo externo: revísalos y completa el precio (RN-16).",
      ),
    ).toBeInTheDocument()
    expect(within(dialogo).getByLabelText("Código de barras")).toHaveValue(
      "8807654321098",
    )
    expect(within(dialogo).getByLabelText("Nombre")).toHaveValue("Borrador tinto")
    expect(within(dialogo).getByLabelText("Marca")).toHaveValue(
      "Papelería Central",
    )
  })

  it("permite reactivar un producto inactivo escaneado (RN-17)", async () => {
    const usuario = userEvent.setup()
    let reactivado = false
    servidor.use(
      http.get("/api/producto/codigo/:codigo", () =>
        HttpResponse.json(productoInactivo),
      ),
      http.put("/api/producto/1/activar", () => {
        reactivado = true
        return HttpResponse.json({ ...productoInactivo, activo: true })
      }),
    )
    renderNuevoProducto()

    await escanear(usuario, "7701234567890")

    const dialogo = await screen.findByRole("dialog")
    expect(
      within(dialogo).getByText(
        "Este código ya está registrado y el producto está inactivo. Edítalo o reactívalo.",
      ),
    ).toBeInTheDocument()
    await usuario.click(
      within(dialogo).getByRole("button", { name: "Reactivar producto" }),
    )

    await waitFor(() => expect(reactivado).toBe(true))
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("no abre un diálogo nuevo tras cerrar el anterior hasta un nuevo escaneo", async () => {
    const usuario = userEvent.setup()
    renderNuevoProducto()

    await escanear(usuario, "7701234567890")
    const dialogo = await screen.findByRole("dialog")
    await usuario.click(within(dialogo).getByRole("button", { name: "Cancelar" }))

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})