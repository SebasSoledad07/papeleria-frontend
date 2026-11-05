import { http, HttpResponse } from "msw"
import type {
  Categoria,
  EntradaProducto,
  Producto,
  Proveedor,
} from "@/api/tipos"

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

// Almacén mutable que espeja la base de datos del backend. Los handlers de
// producto leen y escriben aquí; reiniciarCatalogo() restaura los ejemplos
// (se usa en beforeEach para no contaminar pruebas entre sí).
const catalogoProductos: Producto[] = productosEjemplo.map((p) => ({ ...p }))
let siguienteId = 3

export function reiniciarCatalogo() {
  catalogoProductos.length = 0
  catalogoProductos.push(...productosEjemplo.map((p) => ({ ...p })))
  siguienteId = 3
}

function aProducto(entrada: EntradaProducto, codigoBarras: string): Producto {
  const categoria = categoriasEjemplo.find(
    (c) => c.id === entrada.categoriaId,
  )
  const proveedor = proveedoresEjemplo.find(
    (p) => p.id === entrada.proveedorId,
  )
  return {
    id: siguienteId++,
    codigoBarras,
    nombre: entrada.nombre,
    marca: entrada.marca ?? null,
    categoriaId: entrada.categoriaId,
    categoriaNombre: categoria?.nombre ?? null,
    proveedorId: entrada.proveedorId ?? null,
    proveedorNombre: proveedor?.razonSocial ?? null,
    unidad: entrada.unidad,
    tarifaIva: entrada.tarifaIva,
    precioVenta: entrada.precioVenta,
    costo: entrada.costo,
    stock: entrada.stockInicial ?? 0,
    stockMinimo: entrada.stockMinimo ?? null,
    activo: true,
  }
}

export const handlers = [
  http.get("/api/auth/sesion", () =>
    HttpResponse.json({ nombre: "Administrador", rol: "ADMIN" }),
  ),
  http.post("/api/auth/logout", () => new HttpResponse(null, { status: 204 })),
  http.get("/api/producto", () =>
    HttpResponse.json(catalogoProductos.filter((p) => p.activo)),
  ),
  http.get("/api/producto/buscar", ({ request }) => {
    const q = new URL(request.url).searchParams.get("q")?.toLowerCase() ?? ""
    return HttpResponse.json(
      catalogoProductos.filter(
        (p) => p.activo && p.nombre.toLowerCase().includes(q),
      ),
    )
  }),
  http.get("/api/producto/codigo/:codigo", ({ params }) => {
    // Busca también inactivos, como el backend (RN-17): así se puede
    // detectar «ya registrado» y reactivar desde /productos/nuevo.
    const encontrado = catalogoProductos.find(
      (p) => p.codigoBarras === params.codigo,
    )
    if (!encontrado) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(encontrado)
  }),
  http.get("/api/categoria", () => HttpResponse.json(categoriasEjemplo)),
  http.get("/api/proveedor", () => HttpResponse.json(proveedoresEjemplo)),
  http.get("/api/catalogo/codigo/:codigo", ({ params }) => {
    // Los códigos que empiezan por 880 simulan datos externos (RN-16);
    // cualquier otro devuelve la sugerencia vacía.
    const codigo = String(params.codigo)
    if (codigo.startsWith("880")) {
      return HttpResponse.json({
        codigo,
        nombre: "Borrador tinto",
        marca: "Papelería Central",
        categoria: "Útiles",
      })
    }
    return HttpResponse.json({ codigo, nombre: null, marca: null, categoria: null })
  }),
  http.post("/api/producto", async ({ request }) => {
    const entrada = (await request.json()) as EntradaProducto
    const codigoBarras = entrada.codigoBarras || `2${Date.now().toString().slice(3, 13)}`
    const creado = aProducto(entrada, codigoBarras)
    catalogoProductos.push(creado)
    return HttpResponse.json(creado)
  }),
  http.put("/api/producto/:id", async ({ params, request }) => {
    const id = Number(params.id)
    const entrada = (await request.json()) as EntradaProducto
    const encontrado = catalogoProductos.find((p) => p.id === id)
    if (!encontrado) return new HttpResponse(null, { status: 404 })
    const actualizado = {
      ...encontrado,
      ...aProducto(entrada, entrada.codigoBarras || encontrado.codigoBarras),
      id,
      activo: encontrado.activo,
    }
    actualizado.costo = entrada.costo
    const indice = catalogoProductos.indexOf(encontrado)
    catalogoProductos[indice] = actualizado
    return HttpResponse.json(actualizado)
  }),
  http.delete("/api/producto/:id", ({ params }) => {
    const id = Number(params.id)
    const encontrado = catalogoProductos.find((p) => p.id === id)
    if (!encontrado) return new HttpResponse(null, { status: 404 })
    const inactivo = { ...encontrado, activo: false }
    catalogoProductos[catalogoProductos.indexOf(encontrado)] = inactivo
    return HttpResponse.json(inactivo)
  }),
  http.put("/api/producto/:id/activar", ({ params }) => {
    const id = Number(params.id)
    const encontrado = catalogoProductos.find((p) => p.id === id)
    if (!encontrado) return new HttpResponse(null, { status: 404 })
    const activo = { ...encontrado, activo: true }
    catalogoProductos[catalogoProductos.indexOf(encontrado)] = activo
    return HttpResponse.json(activo)
  }),
  http.get("/api/inventario/productos/:id/kardex", () =>
    HttpResponse.json([]),
  ),
  http.post("/api/inventario/compras", async ({ request }) => {
    const entrada = (await request.json()) as {
      proveedorId: number
      numeroFactura: string
      observacion?: string
      detalle: { productoId: number; cantidad: number; costoUnitario: number }[]
    }
    const detalle = entrada.detalle.map((d) => {
      const producto = catalogoProductos.find((p) => p.id === d.productoId)
      if (producto) {
        producto.stock += d.cantidad
      }
      return {
        productoId: d.productoId,
        codigoBarras: producto?.codigoBarras ?? "",
        productoNombre: producto?.nombre ?? "",
        cantidad: d.cantidad,
        costoUnitario: d.costoUnitario,
      }
    })
    return HttpResponse.json({
      id: Date.now(),
      proveedorId: entrada.proveedorId,
      proveedorRazonSocial: "Proveedor",
      numeroFactura: entrada.numeroFactura,
      fecha: new Date().toISOString(),
      observacion: entrada.observacion ?? null,
      detalle,
    })
  }),
  http.post("/api/inventario/:id/ajuste-positivo", async ({ params, request }) => {
    const id = Number(params.id)
    const body = (await request.json()) as { cantidad: number; motivo: string }
    const producto = catalogoProductos.find((p) => p.id === id)
    if (producto) producto.stock += body.cantidad
    return new HttpResponse(null, { status: 204 })
  }),
  http.post("/api/inventario/:id/ajuste-negativo", async ({ params, request }) => {
    const id = Number(params.id)
    const body = (await request.json()) as { cantidad: number; motivo: string }
    const producto = catalogoProductos.find((p) => p.id === id)
    if (producto) producto.stock -= body.cantidad
    return new HttpResponse(null, { status: 204 })
  }),
  http.post("/api/inventario/conteo-fisico", async ({ request }) => {
    const body = (await request.json()) as {
      lineas: { productoId: number; cantidadContada: number }[]
    }
    let ajustes = 0
    for (const linea of body.lineas) {
      const producto = catalogoProductos.find((p) => p.id === linea.productoId)
      if (producto && producto.stock !== linea.cantidadContada) {
        producto.stock = linea.cantidadContada
        ajustes += 1
      }
    }
    return HttpResponse.json({ ajustesAplicados: ajustes })
  }),
]