import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import type { Producto } from "@/api/tipos"
import { servidor } from "@/pruebas/mocks/servidor"
import { ProductoDialogo } from "./ProductoDialogo"

const productoEjemplo: Producto = {
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

function responderSesion(rol: "ADMIN" | "BODEGUERO") {
  servidor.use(
    http.get("/api/auth/sesion", () =>
      HttpResponse.json({ nombre: "Prueba", rol }),
    ),
  )
}

let cuerpoEnviado: unknown

function capturar(ruta: string) {
  servidor.use(
    http.post(ruta, async ({ request }) => {
      cuerpoEnviado = await request.json()
      return HttpResponse.json({ ...productoEjemplo, id: 99 })
    }),
    http.put(ruta, async ({ request }) => {
      cuerpoEnviado = await request.json()
      return HttpResponse.json({ ...productoEjemplo, precioVenta: 1500 })
    }),
  )
}

function renderDialogo(props: Partial<Parameters<typeof ProductoDialogo>[0]> = {}) {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={cliente}>
      <MemoryRouter>
        <ProductoDialogo onCerrar={vi.fn()} {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("ProductoDialogo", () => {
  it("edita un producto cambiando el precio con confirmación (RF-05, RN-07)", async () => {
    responderSesion("ADMIN")
    const usuario = userEvent.setup()
    const onCerrar = vi.fn()
    capturar("/api/producto/1")
    renderDialogo({ producto: productoEjemplo, onCerrar })

    const precio = await screen.findByLabelText("Precio de venta (IVA incluido)")
    expect(precio).toHaveValue("1000")
    await usuario.clear(precio)
    await usuario.type(precio, "1500")
    await usuario.click(screen.getByRole("button", { name: "Guardar" }))

    expect(
      screen.getByText("$ 1.000 → $ 1.500"),
    ).toBeInTheDocument()
    await usuario.click(
      screen.getByRole("button", { name: "Confirmar cambio de precio" }),
    )

    await waitFor(() => {
      expect(cuerpoEnviado).toEqual(
        expect.objectContaining({ precioVenta: 1500, costo: 600 }),
      )
      expect(onCerrar).toHaveBeenCalled()
    })
  })

  it("no pide confirmación si el precio no cambió", async () => {
    responderSesion("ADMIN")
    const usuario = userEvent.setup()
    const onCerrar = vi.fn()
    capturar("/api/producto/1")
    renderDialogo({ producto: productoEjemplo, onCerrar })

    await usuario.click(await screen.findByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(onCerrar).toHaveBeenCalled())
    expect(cuerpoEnviado).toEqual(
      expect.objectContaining({ precioVenta: 1000 }),
    )
  })

  it("crea un producto y avisa si el precio es menor o igual al costo (RN-06)", async () => {
    responderSesion("ADMIN")
    const usuario = userEvent.setup()
    capturar("/api/producto")
    renderDialogo()

    await usuario.type(screen.getByLabelText("Nombre"), "Regla escolar")
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "Escritura")
    const precio = screen.getByLabelText("Precio de venta (IVA incluido)")
    await usuario.type(precio, "4500")
    await usuario.type(screen.getByLabelText("Costo"), "6000")
    await usuario.click(screen.getByRole("button", { name: "Guardar" }))

    expect(
      await screen.findByText(
        "El precio de venta es menor o igual al costo. Revisa el margen (RN-06).",
      ),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(cuerpoEnviado).toEqual(
        expect.objectContaining({
          nombre: "Regla escolar",
          categoriaId: 1,
          unidad: "UNIDAD",
          tarifaIva: "19",
          precioVenta: 4500,
          costo: 6000,
        }),
      )
    })
    expect(cuerpoEnviado).not.toHaveProperty("codigoBarras")
    expect(cuerpoEnviado).not.toHaveProperty("stockInicial")
  })

  it("oculta el costo al bodeguero y registra 0 en la creación (D-9)", async () => {
    responderSesion("BODEGUERO")
    const usuario = userEvent.setup()
    capturar("/api/producto")
    renderDialogo()

    expect(screen.queryByLabelText("Costo")).not.toBeInTheDocument()
    await usuario.type(screen.getByLabelText("Nombre"), "Resma carta")
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "Cuadernos")
    await usuario.type(
      screen.getByLabelText("Precio de venta (IVA incluido)"),
      "12000",
    )
    await usuario.click(screen.getByRole("button", { name: "Guardar" }))

    await waitFor(() => {
      expect(cuerpoEnviado).toEqual(
        expect.objectContaining({ nombre: "Resma carta", costo: 0 }),
      )
    })
  })

  it("preserva el costo actual al editar como bodeguero (D-9)", async () => {
    responderSesion("BODEGUERO")
    const usuario = userEvent.setup()
    capturar("/api/producto/1")
    renderDialogo({ producto: productoEjemplo })

    expect(screen.queryByLabelText("Costo")).not.toBeInTheDocument()
    await usuario.click(screen.getByRole("button", { name: "Guardar" }))

    await waitFor(() => {
      expect(cuerpoEnviado).toEqual(
        expect.objectContaining({ precioVenta: 1000, costo: 600 }),
      )
    })
  })
})