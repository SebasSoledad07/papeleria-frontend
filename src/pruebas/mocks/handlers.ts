import { http, HttpResponse } from "msw"
import type { Categoria, Producto, Proveedor } from "@/api/tipos"

export const productosEjemplo: Producto[] = [
  {
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
  },
  {
    id: 2,
    codigoBarras: "7709876543210",
    nombre: "Cuaderno cosido",
    marca: null,
    categoriaId: 2,
    categoriaNombre: "Cuadernos",
    proveedorId: null,
    proveedorNombre: null,
    unidad: "UNIDAD",
    tarifaIva: "5",
    precioVenta: 23800,
    costo: 18000,
    stock: 0,
    stockMinimo: 5,
    activo: true,
  },
]

export const categoriasEjemplo: Categoria[] = [
  { id: 1, nombre: "Escritura", activo: true },
  { id: 2, nombre: "Cuadernos", activo: true },
]

export const proveedoresEjemplo: Proveedor[] = [
  {
    id: 1,
    razonSocial: "Distribuidora Escolar",
    nit: "900123456",
    telefono: null,
    direccion: null,
    activo: true,
  },
]

export const handlers = [
  http.get("/api/auth/sesion", () =>
    HttpResponse.json({ nombre: "Administrador", rol: "ADMIN" }),
  ),
  http.post("/api/auth/logout", () => new HttpResponse(null, { status: 204 })),
  http.get("/api/producto", () => HttpResponse.json(productosEjemplo)),
  http.get("/api/producto/buscar", ({ request }) => {
    const q = new URL(request.url).searchParams.get("q")?.toLowerCase() ?? ""
    return HttpResponse.json(
      productosEjemplo.filter((producto) =>
        producto.nombre.toLowerCase().includes(q),
      ),
    )
  }),
  http.get("/api/producto/codigo/:codigo", ({ params }) => {
    const encontrado = productosEjemplo.find(
      (producto) => producto.codigoBarras === params.codigo,
    )
    if (!encontrado) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(encontrado)
  }),
  http.get("/api/categoria", () => HttpResponse.json(categoriasEjemplo)),
  http.get("/api/proveedor", () => HttpResponse.json(proveedoresEjemplo)),
]
