# Integración con la API

El contrato completo está en [`../../docs/04-contrato-api.md`](../../docs/04-contrato-api.md). Este documento explica **cómo lo consume el frontend**.

## Direcciones por entorno

| Entorno | Frontend | API | Cómo se llega |
|---|---|---|---|
| Desarrollo | `http://localhost:5173` | `http://localhost:8080` | Proxy de Vite: el navegador llama a `/api/...` en el mismo origen y Vite lo reenvía. No hay CORS ni problemas de cookies. `VITE_API_URL` queda vacío. |
| Producción | `https://app.tupapeleria.com` | `https://api.tupapeleria.com` | Llamadas directas con CORS y cookie compartida entre subdominios. `VITE_API_URL=https://api.tupapeleria.com`. |

`vite.config.ts` (referencia):

```ts
server: {
  proxy: { '/api': 'http://localhost:8080' },
}
```

## Cliente de la API (`src/api/cliente.ts`)

Un solo cliente para toda la aplicación, con tipos generados desde OpenAPI:

- **`openapi-typescript`** genera `src/api/esquema.d.ts` a partir de `/v3/api-docs` del backend (`npm run api:tipos`). Ese archivo **se sube a Git** para que el frontend compile sin necesidad del backend.
- **`openapi-fetch`** da un cliente tipado (`cliente.GET('/api/productos', ...)`): si el contrato cambia, TypeScript marca los usos incorrectos.

Comportamiento obligatorio del cliente (verifica la forma exacta de los *middlewares* en la documentación de la versión instalada):

1. **`credentials: 'include'`** en todas las peticiones.
2. **CSRF:** en `POST`, `PUT`, `PATCH` y `DELETE`, añade el encabezado `X-XSRF-TOKEN` con el token guardado en memoria (`api/csrf.ts`). Si no hay token, lo pide primero con `GET /api/auth/csrf`.
3. **`403 CSRF_INVALIDO`:** pide un token nuevo y **reintenta una sola vez** la petición. Es el único reintento automático permitido, y solo para este caso; nunca para una venta ya confirmada que dio otro error.
4. **`401`:** limpia el caché de TanStack Query y redirige a `/login` recordando la ruta actual.
5. **Errores:** toda respuesta de error se convierte en un `ProblemaApi` (ver abajo) y se lanza.
6. **Tiempo de espera:** 15 segundos en peticiones normales (`AbortController`); sin reintento automático en mutaciones.

### Token CSRF

```
inicio de la app ─► GET /api/auth/me ─► (hay sesión) ─► GET /api/auth/csrf ─► token en memoria
login correcto  ─► GET /api/auth/csrf ─► token nuevo
logout          ─► se borra el token
```

El token vive en una variable de módulo. **No** se guarda en `localStorage`, `sessionStorage` ni cookies.

## Errores (`src/api/errores.ts`)

```ts
class ProblemaApi extends Error {
  estado: number            // status HTTP
  codigo: string            // 'STOCK_INSUFICIENTE', 'VALIDACION', ...
  datos?: Record<string, unknown>
  errores?: { campo: string; mensaje: string }[]   // solo en VALIDACION
}
```

`mensajePorCodigo(problema)` devuelve el texto que ve la persona. Ejemplos:

| `codigo` | Mensaje en pantalla |
|---|---|
| `STOCK_INSUFICIENTE` | «Solo hay {disponible} unidades de {producto}.» |
| `CAJA_NO_ABIERTA` | «Abre la caja antes de vender.» |
| `CAJA_YA_ABIERTA` | «Ya tienes una caja abierta.» |
| `CODIGO_DUPLICADO` | «Ese código de barras ya está registrado.» |
| `PAGO_INSUFICIENTE` | «Los pagos no cubren el total.» |
| `PAGO_EXCEDE_TOTAL` | «Solo el efectivo puede ser mayor al total.» |
| `DESCUENTO_REQUIERE_AUTORIZACION` | «Este descuento necesita la autorización de un administrador.» |
| `AUTORIZACION_INVALIDA` | «Usuario o clave de administrador incorrectos.» |
| `ANULACION_NO_PERMITIDA` | «Esta venta no se puede anular porque su caja ya está cerrada.» |
| `SIN_PERMISO` | «No tienes permiso para hacer esto.» |
| `CREDENCIALES_INVALIDAS` | «Usuario o clave incorrectos.» |
| `CATALOGO_NO_DISPONIBLE` | «No se pudo consultar el catálogo externo. Completa los datos a mano.» |
| (otro código o sin código) | El `detail` del servidor y, si no hay, «Ocurrió un error. Inténtalo de nuevo.» |

Reglas:

- **La lógica se decide por `codigo`**, nunca comparando el texto de `detail`.
- Un **error de red** (sin respuesta) es distinto de un error de la API: activa el aviso de «Sin conexión» y **no** se trata como si la operación hubiera fallado en el servidor. En una venta, significa «no sabemos si se guardó» (ver [`pantallas-y-flujos.md`](pantallas-y-flujos.md)).
- Los errores `VALIDACION` se asignan a los campos del formulario con `setError` de React Hook Form usando `errores[].campo`.

## TanStack Query

### Configuración global

```ts
new QueryClient({
  defaultOptions: {
    queries:   { retry: 1, refetchOnWindowFocus: true, staleTime: 30_000 },
    mutations: { retry: false },          // nunca reintentar una escritura
  },
})
```

### Claves de consulta

| Clave | Contenido | `staleTime` |
|---|---|---|
| `['usuario']` | `GET /api/auth/me` | 5 min |
| `['configuracion-publica']` | Datos del negocio y límite de descuento | 10 min |
| `['panel']` | Indicadores | 30 s |
| `['productos', filtros]` | Listado y búsqueda | 30 s |
| `['producto', id]` | Detalle | 30 s |
| `['producto-codigo', codigo]` | Búsqueda por código escaneado | **0**: el precio y el stock deben ser los vigentes (RN-08) |
| `['historial-precios', id]` | Historial | 60 s |
| `['kardex', productoId, pagina]` | Movimientos | 30 s |
| `['caja-actual']` | Caja abierta del usuario | 30 s |
| `['ventas', filtros]`, `['venta', id]` | Ventas | 30 s |
| `['reporte', nombre, filtros]` | Reportes | 0 (siempre frescos) |
| `['categorias']`, `['proveedores']`, `['usuarios']` | Catálogos | 5 min |

Las claves se centralizan en un archivo por característica (por ejemplo, `caracteristicas/productos/hooks/claves.ts`) para no escribirlas a mano en cada uso.

### Invalidaciones después de una mutación

| Mutación | Invalida |
|---|---|
| Confirmar venta | `['panel']`, `['productos']`, `['producto']`, `['caja-actual']`, `['ventas']` |
| Anular venta | las mismas que confirmar venta, más `['venta', id]` |
| Cerrar caja | `['caja-actual']`, `['panel']` |
| Compra, ajuste o conteo | `['panel']`, `['productos']`, `['producto']`, `['kardex']` |
| Crear o editar producto | `['productos']`, `['producto', id]`, `['historial-precios', id]` si cambió el precio |
| Activar o inactivar producto | `['productos']`, `['producto', id]` |
| Cambiar configuración | `['configuracion-publica']` |

## Cotizar y confirmar una venta

```
Carrito (local) ──► POST /api/ventas/calcular ──► totales oficiales (se muestran)
                          │
Cobrar (F9) ───────► calcular de nuevo ──► ventana de pago
                          │
Confirmar (Enter) ─► POST /api/ventas   (Idempotency-Key: <uuid del intento>)
```

- El cuerpo de `calcular` y de `ventas` lleva **solo** ids de producto, cantidades, descuentos, `autorizacionId`, `clienteId` y pagos. **Nunca precios ni totales.**
- `useVentaCotizada` lanza `calcular` cuando cambian los descuentos o se abre el cobro. Mientras no haya descuentos, no hace falta llamarlo para mostrar el subtotal.
- El `Idempotency-Key` es un UUID (`crypto.randomUUID()`) **generado una vez por ventana de cobro** y reutilizado si el cajero vuelve a pulsar «confirmar» sobre el mismo intento. Si el cajero cambia el carrito o los pagos, se genera uno nuevo. (Depende de D-10.)

## Descargas (reportes Excel y PDF)

`lib/descargas.ts` hace `fetch` con credenciales a `GET /api/reportes/{nombre}?...&formato=xlsx|pdf`, convierte la respuesta en un `Blob` y dispara la descarga con el nombre que venga en `Content-Disposition`. Esto incluye la cookie de sesión, cosa que un simple enlace entre subdominios podría no hacer en todos los navegadores.

## Pruebas con MSW

Las pruebas de componentes no llaman al backend: **MSW** intercepta las peticiones y responde con los ejemplos del contrato (`src/pruebas/mocks/`). Cada vez que cambia el contrato, se actualizan los mocks junto con `npm run api:tipos`. Casos mínimos que deben simularse: éxito, `VALIDACION`, `STOCK_INSUFICIENTE`, `NO_AUTENTICADO`, `SIN_PERMISO` y error de red.
