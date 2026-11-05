export type Rol = "ADMIN" | "CAJERO" | "BODEGUERO"

export interface Sesion {
  nombre: string
  rol: Rol
}

export interface Usuario {
  id: number
  usuario: string
  nombre: string
  rol: Rol
  activo: boolean
}

export interface EntradaUsuario {
  usuario: string
  nombre: string
  clave: string
  rol: Rol
}

export interface EdicionUsuario {
  nombre?: string
  rol?: Rol
  activo?: boolean
}

export interface Configuracion {
  clave: string
  valor: string
  descripcion: string
}

export interface Categoria {
  id: number
  nombre: string
  activo: boolean
}

export interface EntradaCategoria {
  nombre: string
}

export interface Proveedor {
  id: number
  razonSocial: string
  nit: string
  telefono: string | null
  direccion: string | null
  activo: boolean
}

export interface EntradaProveedor {
  razonSocial: string
  nit: string
  telefono?: string
  direccion?: string
}

// Unidad de venta (RN-18).
export type Unidad =
  | "UNIDAD"
  | "PAQUETE"
  | "RESMA"
  | "CAJA"
  | "PLIEGO"
  | "METRO"
  | "SERVICIO"

// Tarifa de IVA (RN-09); precio de venta incluye IVA (RN-04).
export type TarifaIva = "19" | "5" | "0" | "EXCLUIDO"

// Espeja ProductoDto del backend (../inventario-papeleria/**/api/ProductoDto.java).
export interface Producto {
  id: number
  codigoBarras: string
  nombre: string
  marca: string | null
  categoriaId: number | null
  categoriaNombre: string | null
  proveedorId: number | null
  proveedorNombre: string | null
  unidad: Unidad
  tarifaIva: TarifaIva
  precioVenta: number
  costo: number
  stock: number
  stockMinimo: number | null
  activo: boolean
}

// Cuerpo de POST /api/producto y PUT /api/producto/{id} (ProductoRequest).
// Si codigoBarras va vacío, el backend genera un código interno EAN-13 (RN-15).
export interface EntradaProducto {
  codigoBarras?: string
  nombre: string
  marca?: string
  categoriaId: number
  proveedorId?: number
  unidad: Unidad
  tarifaIva: TarifaIva
  precioVenta: number
  costo: number
  stockInicial?: number
  stockMinimo?: number
}

// SugerenciaProducto del catálogo externo (RN-16). Sin datos: campos en null.
export interface SugerenciaProducto {
  codigo: string
  nombre: string | null
  marca: string | null
  categoria: string | null
}

// Respuesta de POST /api/codigos/decodificar (RF-11/RF-12).
export interface LecturaCodigo {
  codigo: string
  formato: string
}

// Movimiento del kárdex de un producto (RF-17).
export interface MovimientoKardex {
  id: number
  productoId: number
  tipo: string
  cantidad: number
  stockResultante: number
  referencia: string | null
  motivo: string | null
  usuarioId: number | null
  usuarioNombre: string | null
  fecha: string
}

// Línea de una entrada de mercancía (RF-14).
export interface DetalleCompra {
  productoId: number
  codigoBarras: string
  productoNombre: string
  cantidad: number
  costoUnitario: number
}

// Entrada de mercancía (RF-14, RN-23).
export interface Compra {
  id: number
  proveedorId: number
  proveedorRazonSocial: string
  numeroFactura: string
  fecha: string
  observacion: string | null
  detalle: DetalleCompra[]
}

export interface EntradaDetalleCompra {
  productoId: number
  cantidad: number
  costoUnitario: number
}

export interface EntradaCompra {
  proveedorId: number
  numeroFactura: string
  observacion?: string
  detalle: EntradaDetalleCompra[]
}

// Línea del conteo físico (RF-18, RN-46).
export interface LineaConteo {
  productoId: number
  cantidadContada: number
}

export interface ConteoFisicoResultado {
  ajustesAplicados: number
}
