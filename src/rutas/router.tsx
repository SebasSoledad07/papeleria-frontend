import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "@/App"
import { Login } from "@/caracteristicas/autenticacion/paginas/Login"
import { Categorias } from "@/caracteristicas/categorias/paginas/Categorias"
import { Configuracion } from "@/caracteristicas/configuracion/paginas/Configuracion"
import { Ajustes } from "@/caracteristicas/inventario/paginas/Ajustes"
import { Reporte } from "@/caracteristicas/reportes/paginas/Reporte"
import { Reportes } from "@/caracteristicas/reportes/paginas/Reportes"
import { Preferencias } from "@/caracteristicas/preferencias/paginas/Preferencias"
import { Caja } from "@/caracteristicas/caja/paginas/Caja"
import { CierreCaja } from "@/caracteristicas/caja/paginas/CierreCaja"
import { VentaDetalle } from "@/caracteristicas/caja/paginas/VentaDetalle"
import { Ventas } from "@/caracteristicas/caja/paginas/Ventas"
import { Compras } from "@/caracteristicas/inventario/paginas/Compras"
import { Conteo } from "@/caracteristicas/inventario/paginas/Conteo"
import { Kardex } from "@/caracteristicas/inventario/paginas/Kardex"
import { NoEncontrado } from "@/caracteristicas/errores/paginas/NoEncontrado"
import { Panel } from "@/caracteristicas/panel/paginas/Panel"
import { NuevoProducto } from "@/caracteristicas/productos/paginas/NuevoProducto"
import { Productos } from "@/caracteristicas/productos/paginas/Productos"
import { Proveedores } from "@/caracteristicas/proveedores/paginas/Proveedores"
import { Usuarios } from "@/caracteristicas/usuarios/paginas/Usuarios"
import { RutaProtegida } from "@/rutas/RutaProtegida"

function Redirigir() {
  return <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <RutaProtegida />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Panel /> },
          { path: "productos", element: <Productos /> },
          {
            path: "productos/nuevo",
            element: (
              <RutaProtegida roles={["ADMIN", "BODEGUERO"]}>
                <NuevoProducto />
              </RutaProtegida>
            ),
          },
          {
            path: "productos/:id/kardex",
            element: (
              <RutaProtegida roles={["ADMIN", "BODEGUERO"]}>
                <Kardex />
              </RutaProtegida>
            ),
          },
          {
            path: "inventario/compras",
            element: (
              <RutaProtegida roles={["ADMIN", "BODEGUERO"]}>
                <Compras />
              </RutaProtegida>
            ),
          },
          {
            path: "inventario/ajustes",
            element: (
              <RutaProtegida roles={["ADMIN", "BODEGUERO"]}>
                <Ajustes />
              </RutaProtegida>
            ),
          },
          {
            path: "inventario/conteo",
            element: (
              <RutaProtegida roles={["ADMIN", "BODEGUERO"]}>
                <Conteo />
              </RutaProtegida>
            ),
          },
          {
            path: "caja",
            element: (
              <RutaProtegida roles={["ADMIN", "CAJERO"]}>
                <Caja />
              </RutaProtegida>
            ),
          },
          {
            path: "caja/cierre",
            element: (
              <RutaProtegida roles={["ADMIN", "CAJERO"]}>
                <CierreCaja />
              </RutaProtegida>
            ),
          },
          {
            path: "ventas",
            element: (
              <RutaProtegida roles={["ADMIN", "CAJERO"]}>
                <Ventas />
              </RutaProtegida>
            ),
          },
          {
            path: "ventas/:id",
            element: (
              <RutaProtegida roles={["ADMIN", "CAJERO"]}>
                <VentaDetalle />
              </RutaProtegida>
            ),
          },
          {
            path: "reportes",
            element: (
              <RutaProtegida roles={["ADMIN", "BODEGUERO"]}>
                <Reportes />
              </RutaProtegida>
            ),
          },
          {
            path: "reportes/:nombre",
            element: (
              <RutaProtegida roles={["ADMIN", "BODEGUERO"]}>
                <Reporte />
              </RutaProtegida>
            ),
          },
          {
            path: "usuarios",
            element: (
              <RutaProtegida roles={["ADMIN"]}>
                <Usuarios />
              </RutaProtegida>
            ),
          },
          {
            path: "categorias",
            element: (
              <RutaProtegida roles={["ADMIN"]}>
                <Categorias />
              </RutaProtegida>
            ),
          },
          {
            path: "proveedores",
            element: (
              <RutaProtegida roles={["ADMIN"]}>
                <Proveedores />
              </RutaProtegida>
            ),
          },
          {
            path: "preferencias",
            element: <Preferencias />,
          },
          {
            path: "preferencias",
            element: <Preferencias />,
          },
          {
            path: "configuracion",
            element: (
              <RutaProtegida roles={["ADMIN"]}>
                <Configuracion />
              </RutaProtegida>
            ),
          },
        ],
      },
    ],
  },
  { path: "404", element: <NoEncontrado /> },
  { path: "*", element: <Redirigir /> },
])