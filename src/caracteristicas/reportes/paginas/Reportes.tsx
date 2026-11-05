import { Link } from "react-router-dom"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { useSesion } from "@/caracteristicas/autenticacion"

const grupos = [
  {
    titulo: "Stock",
    items: [
      { nombre: "stock-bajo", etiqueta: "Stock bajo" },
      { nombre: "agotados", etiqueta: "Agotados" },
      { nombre: "por-agotarse", etiqueta: "Por agotarse" },
      { nombre: "pedido-proveedor", etiqueta: "Pedido por proveedor" },
    ],
  },
  {
    titulo: "Ventas",
    items: [
      { nombre: "ventas-periodo", etiqueta: "Ventas por periodo" },
      { nombre: "productos-mas-vendidos", etiqueta: "Productos más vendidos" },
      {
        nombre: "productos-sin-movimiento",
        etiqueta: "Productos sin movimiento",
      },
    ],
  },
  {
    titulo: "Dinero",
    items: [
      { nombre: "utilidad-periodo", etiqueta: "Utilidad por periodo" },
      { nombre: "utilidad-categoria", etiqueta: "Utilidad por categoría" },
      { nombre: "utilidad-producto", etiqueta: "Utilidad por producto" },
      { nombre: "valor-inventario", etiqueta: "Valor del inventario" },
      { nombre: "cierres-caja", etiqueta: "Cierres de caja" },
    ],
    soloAdmin: true,
  },
]

export function Reportes() {
  const sesion = useSesion()
  const esAdmin = sesion.data?.rol === "ADMIN"

  return (
    <div className="space-y-6">
      <PaginaTitulo
        titulo="Reportes"
        descripcion="Consulta y exporta la información del negocio (RF-30 a RF-41)."
      />
      <div className="space-y-6">
        {grupos
          .filter((g) => !g.soloAdmin || esAdmin)
          .map((grupo) => (
            <section key={grupo.titulo} className="space-y-3">
              <h2 className="text-lg font-semibold">{grupo.titulo}</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {grupo.items.map((item) => (
                  <Link
                    key={item.nombre}
                    to={`/reportes/${item.nombre}`}
                    className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
                  >
                    <p className="font-medium">{item.etiqueta}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  )
}