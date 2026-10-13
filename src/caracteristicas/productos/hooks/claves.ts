export const claveProductos = (texto: string) => ["productos", texto] as const

export const claveProductoCodigo = (codigo: string) =>
  ["producto-codigo", codigo] as const

export const claveProducto = (id: number) => ["producto", id] as const
