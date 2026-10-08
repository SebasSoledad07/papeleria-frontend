# Arquitectura del frontend

## Decisión

**SPA con React + TypeScript + Vite**, organizada **por característica** (como los módulos del backend), servida como archivos estáticos desde un hosting con CDN. Habla con el backend solo a través de la API REST descrita en [`../../docs/04-contrato-api.md`](../../docs/04-contrato-api.md).

Principios:

1. **El servidor decide.** El frontend presenta y captura datos; no es fuente de verdad de totales, IVA, stock ni permisos.
2. **La caja es la pantalla crítica.** Se diseña primero para teclado y lector; el resto de pantallas son formularios y tablas comunes.
3. **Pocas piezas.** Cada librería que se añade es algo que mantener sola una persona. Ver [`dependencias-y-entorno.md`](dependencias-y-entorno.md).

## Estructura de carpetas

```
frontend/
├── AGENTS.md
├── package.json
├── vite.config.ts                 # proxy /api → http://localhost:8080 en desarrollo
├── tsconfig.json                  # "strict": true
├── index.html
├── .env.example                   # VITE_API_URL
├── public/
│   └── _redirects                 # /* /index.html 200   (rutas de la SPA)
├── docs/                          # esta documentación
└── src/
    ├── main.tsx                   # QueryClientProvider, RouterProvider
    ├── App.tsx                    # estructura general: barra lateral, aviso sin conexión
    ├── rutas/
    │   ├── router.tsx             # definición de rutas
    │   ├── RutaProtegida.tsx      # exige sesión y, si aplica, un rol
    │   └── navegacion.ts          # qué menú ve cada rol
    ├── api/
    │   ├── esquema.d.ts           # GENERADO desde OpenAPI. No se edita.
    │   ├── cliente.ts             # openapi-fetch: credenciales, CSRF, errores, Idempotency-Key
    │   ├── errores.ts             # ProblemaApi, mensajePorCodigo()
    │   └── csrf.ts                # token en memoria
    ├── lib/
    │   ├── formato.ts             # ÚNICO lugar que formatea dinero, fechas y números
    │   ├── teclas.ts              # atajos de teclado
    │   └── descargas.ts           # descarga de archivos (xlsx, pdf)
    ├── componentes/
    │   ├── ui/                    # generados por shadcn/ui
    │   └── comunes/               # CampoDinero, CampoCodigo, TablaReporte, InsigniaEstadoStock...
    ├── escaner/
    │   ├── CampoCodigo.tsx        # campo con foco permanente para el lector USB
    │   ├── CamaraEscaner.tsx      # cámara en vivo con barcode-detector
    │   ├── FotoEscaner.tsx        # respaldo: subir foto
    │   └── bip.ts                 # sonido de lectura (Web Audio)
    ├── impresion/
    │   ├── Tirilla.tsx            # comprobante 58/80 mm
    │   ├── HojaEtiquetas.tsx
    │   ├── imprimir.ts            # window.print() con la zona de impresión
    │   └── impresion.css          # @media print, @page
    ├── caracteristicas/
    │   ├── autenticacion/         # login, sesión actual, cierre de sesión
    │   ├── panel/                 # indicadores del día, alertas de stock
    │   ├── caja/                  # apertura, carrito, cobro, cierre
    │   │   ├── paginas/
    │   │   ├── componentes/
    │   │   ├── hooks/             # useVentaCotizada, useConfirmarVenta...
    │   │   └── estado/carrito.ts  # reducer puro + pruebas
    │   ├── ventas/                # consulta, detalle, anulación
    │   ├── productos/             # listado, alta con escaneo, edición, etiquetas
    │   ├── inventario/            # compras, ajustes, kárdex, conteo físico
    │   ├── reportes/              # catálogo de reportes, filtros, exportación
    │   ├── usuarios/
    │   └── configuracion/
    └── pruebas/
        ├── preparacion.ts         # configuración de Vitest
        └── mocks/                 # MSW: respuestas simuladas de la API
```

Cada carpeta de `caracteristicas/` sigue la misma forma interna: `paginas/` (lo que enruta el router), `componentes/` (piezas de esa característica), `hooks/` (consultas y mutaciones con TanStack Query), `esquemas.ts` (validación con Zod de sus formularios) y un `index.ts` que expone lo que otras características pueden usar.

## Dependencias entre carpetas

| Carpeta | Puede importar de | No debe importar de |
|---|---|---|
| `caracteristicas/*` | `api/`, `lib/`, `componentes/`, `escaner/`, `impresion/` | otra característica, salvo por su `index.ts` |
| `caracteristicas/caja` | además, `productos` (búsqueda) y `ventas` (tirilla) por su `index.ts` | `inventario`, `reportes` |
| `componentes/` | `lib/` | `api/`, `caracteristicas/` (son piezas puras) |
| `api/` | nada de la aplicación | `caracteristicas/`, `componentes/` |
| `lib/` | nada de la aplicación | todo lo demás |

## Estado: qué va dónde

| Tipo de dato | Dónde vive |
|---|---|
| Datos del servidor (productos, ventas, reportes) | **TanStack Query** (caché, recarga, invalidación) |
| Formularios | **React Hook Form** + validación **Zod** |
| Carrito de la caja | `useReducer` en `caja/estado/carrito.ts`, con borrador en `sessionStorage` (solo ids y cantidades) para sobrevivir a una recarga accidental |
| Usuario y rol | Consulta `GET /api/auth/me` (TanStack Query), nunca copiado a `localStorage` |
| Token CSRF | Variable en memoria (`api/csrf.ts`) |
| Preferencias del equipo (ancho de tirilla, sonido, imprimir automático) | `localStorage`, bajo una sola clave `papeleria:preferencias` |
| Estado de una ventana o pestaña | `useState` local |

No hay Redux ni otro almacén global.

## Rutas y permisos

`RutaProtegida` recibe los roles permitidos. Sin sesión redirige a `/login` recordando la ruta pedida; con sesión pero sin rol adecuado muestra «No tienes permiso». `navegacion.ts` define el menú por rol. Todo esto es comodidad: el backend vuelve a validar cada petición. La tabla de rutas está en [`pantallas-y-flujos.md`](pantallas-y-flujos.md).

## Manejo de errores y carga

- Cada consulta y mutación muestra estado de carga y de error; ninguna pantalla se queda en blanco.
- Los errores de la API se traducen con `mensajePorCodigo(codigo, datos)` a mensajes en español. Detalle en [`integracion-api.md`](integracion-api.md).
- Un `ErrorBoundary` por página evita que una falla de una pantalla tumbe toda la aplicación.
- **Sin conexión:** un aviso fijo y visible en toda la aplicación; en la caja, el botón de cobrar queda deshabilitado.

## Interfaz

- **Tailwind CSS v4** con **shadcn/ui** (componentes copiados al proyecto, basados en Radix).
- Diseño pensado para tres usos: computador de caja (teclado y lector), computador de administración, y celular (escanear con la cámara, consultar precios y stock).
- Sin modo oscuro en la versión 1. Español de Colombia en todos los textos (RNF-03).
- Navegadores objetivo: Chrome, Edge, Safari y Firefox actuales (RNF-02).

## Pruebas

| Qué | Con qué | Qué cubre |
|---|---|---|
| Lógica pura | Vitest | `formato.ts`, reducer del carrito, `mensajePorCodigo`, normalización de entradas |
| Componentes | Vitest + Testing Library + MSW | `CampoCodigo`, `CampoDinero`, formularios, permisos por rol |
| Flujo completo de la caja | Playwright | Escanear → carrito → cobrar (mixto) → tirilla, solo con teclado |

Las pruebas de componentes usan MSW para simular el backend con las respuestas del contrato; las pruebas E2E corren contra el backend real de desarrollo.
