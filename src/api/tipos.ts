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

export interface Producto {
  id: number
  codigo: string
  nombre: string
  categoria: string
  precioVenta: number
  stock: number
  activo: boolean
}