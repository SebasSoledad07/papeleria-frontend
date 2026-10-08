import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "@/App"
import { Login } from "@/caracteristicas/autenticacion/paginas/Login"
import { Categorias } from "@/caracteristicas/categorias/paginas/Categorias"
import { Configuracion } from "@/caracteristicas/configuracion/paginas/Configuracion"
import { NoEncontrado } from "@/caracteristicas/errores/paginas/NoEncontrado"
import { Panel } from "@/caracteristicas/panel/paginas/Panel"
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
          { path: "usuarios", element: <Usuarios /> },
          { path: "categorias", element: <Categorias /> },
          { path: "proveedores", element: <Proveedores /> },
          { path: "configuracion", element: <Configuracion /> },
        ],
      },
    ],
  },
  { path: "404", element: <NoEncontrado /> },
  { path: "*", element: <Redirigir /> },
])