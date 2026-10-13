import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "@/App"
import { Login } from "@/caracteristicas/autenticacion/paginas/Login"
import { Categorias } from "@/caracteristicas/categorias/paginas/Categorias"
import { Configuracion } from "@/caracteristicas/configuracion/paginas/Configuracion"
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