# Frontend — Inventario y Ventas para Papelería

SPA de caja, inventario y reportes para una papelería en Colombia. **Solo el cliente:** la API es el backend hermano `../inventario-papeleria` (Spring Boot 4 + PostgreSQL; reglas y arranque en su `AGENTS.md`). Moneda **COP en enteros**, interfaz en **español de Colombia**.

Stack: React 19 · TypeScript ~6.0 · Vite 8 · Tailwind v4 + shadcn (**Base UI**, no Radix) · React Router 7 · TanStack Query 5 · React Hook Form + Zod · `barcode-detector` · recharts · vitest 5 + Testing Library + jsdom + MSW.

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173 (proxy /api → :8080)
npm run build    # tsc -b + vite build → dist/  (el typecheck corre aquí)
npm run lint     # eslint (.agents y dist ignorados)
npm test         # vitest run (jsdom + MSW)
npx tsc -b       # typecheck estricto
npx vitest run src/lib/formato.test.ts   # una sola prueba/archivo
```

No hay CI, Prettier, pre-commit, `test:e2e` ni `api:tipos`. Node ≥ 22.12. `.gitignore` ignora `.env.example` (existe en disco, no en Git).

## Estado actual (verificado)

- Frontend: fases 0, 1 y 2 **completas**; la 3 es la siguiente. `npm test` = 9 archivos / 46 pruebas; `npm run lint` y `npx tsc -b` pasan. Hecho: login/logout/sesión, menú y permisos por rol, usuarios, categorías, proveedores, configuración, panel, escáner (`src/escaner/`), productos (listado/búsqueda/filtros + CRUD con escaneo, sugerencia de catálogo y reactivación). **No hay aún pantallas de inventario, caja/ventas, clientes ni reportes.**
- Backend (`../inventario-papeleria`): fases 1 a 5 **completas** (inventario, caja/ventas, clientes, reportes y panel). No hay bloqueo para empezar Fase 3; los endpoints ya existen (ver «El contrato hoy»). Fase 6 (DIAN) fuera de v1.
- **D-4 sigue bloqueada**: `SesionDto` es solo `{nombre, rol}`, sin flag de primer inicio; no lo inventes. **D-7** (presentaciones por caja) se omite en v1. **D-9**: ocultar costos/campos por rol en inventario.
- Decisiones pendientes en backend: D-1, D-2, D-4, D-5, D-6 (D-3 resuelta → RN-46). D-7, D-9, D-10 son del frontend y **no están registradas** en `../inventario-papeleria/docs/08-decisiones-pendientes.md`.
- Backend de prueba: `./mvnw spring-boot:run` en `../inventario-papeleria`; PostgreSQL en :5435 vía su `docker-compose.yml`; API en :8080. Requiere Docker Desktop y JDK 21 (el `java` del sistema es 1.8).

## Arquitectura y convenciones

- `src/` → `api/` (`cliente.ts`, `errores.ts`, `tipos.ts`), `lib/formato.ts`, `escaner/`, `rutas/`, `componentes/` (`ui/` shadcn + `comunes/`), `caracteristicas/<feature>/` con `paginas/`, `componentes/`, `hooks/`.
- Organización **por característica**, no por tipo. Varias exponen un `index.ts` de barril, pero el código actual suele importar por ruta directa (p. ej. `App.tsx` → `autenticacion/hooks/useSesion`); `productos` no tiene barril. Lo compartido vive en `componentes/` o `lib/`.
- Estado del servidor con TanStack Query; formularios con RHF + Zod; estado de interfaz con `useState`. Todas las mutaciones con `retry: false`.
- Código, archivos de pantalla y textos en **español**; `PascalCase` componentes, `camelCase` hooks/funciones. Un componente por archivo.
- Commits pequeños citando la regla: `feat(caja): ... (RN-32)`.
- `vite.config.ts` define alias `@/*` → `./src` y el bloque `test` (setup `src/pruebas/preparacion.ts`).
- El tema Tailwind/shadcn (`@import "tailwindcss"` + `@theme inline` + `:root`/`.dark`) vive en **`src/App.css`**, importado por `src/main.tsx`; `src/index.css` solo importa `tailwindcss`.
- Diseño **«Papel y tinta»**: fondo cálido y acento terracota en `App.css`; títulos `Fraunces`, interfaz `Geist` y códigos `Geist Mono`, todas vía `@fontsource-variable` (locales, sin CDN). No volver al gris neutro ni usar fuentes remotas.
- `components.json`: aliases `@/componentes` y `@/componentes/ui`. El paquete `shadcn` de `dependencies` es un placeholder vacío; **no** añadas `@import "shadcn/tailwind.css"` (rompe el build).

## El contrato hoy

La fuente de verdad son los controllers: `../inventario-papeleria/src/main/java/com/soledad/inventariopapeleria/**/api/*Controller.java`. `docs/04-contrato-api.md` es un borrador incompleto y desactualizado.

- Rutas reales **casi todas en singular**, salvo `/api/codigos`. Existen: `/api/auth/login|logout|sesion`; `/api/usuario` (+ `PUT /{id}`, `DELETE /{id}`, `PUT /{id}/clave`); `/api/configuracion` (`GET`, `PUT`); `/api/categoria`; `/api/proveedor`; `/api/producto` (CRUD: `POST`, `GET`, `GET /codigo/{codigo}`, `GET /buscar?q=`, `PUT /{id}`, `PUT /{id}/precio`, `DELETE /{id}`, `PUT /{id}/activar`); `/api/catalogo/codigo/{codigo}`; `/api/codigos/decodificar` (multipart) y `GET /api/codigos/{codigo}/etiqueta` (PNG); `/api/inventario` (ajustes positivo/negativo, kárdex `GET /productos/{id}/kardex`, conteo físico `POST /conteo-fisico`); `/api/inventario/compras` (`POST`, `GET /{id}`); `/api/cliente` (`POST`, `GET /{id}`); `/api/caja` (`POST /abrir`, `GET /abierta`, `GET /{id}`, `POST /{id}/cerrar`); `/api/venta` (`POST` confirmar, `GET /{id}`, `GET` buscar con filtros, `POST /{id}/anular`, `GET /{id}/tirilla` HTML); `/api/reporte/*` (stock-bajo, agotados, por-agotarse, pedido-proveedor, ventas-periodo, productos-mas-vendidos, productos-sin-movimiento, utilidad-*, valor-inventario, cierres-caja, panel, `GET /exportar?reporte=&formato=&desde=&hasta=`).
- **No existe `POST /api/ventas/calcular` ni vista previa de totales**: el servidor calcula al confirmar (`POST /api/venta`) y devuelve los totales en `VentaDto`. Localmente solo se puede mostrar el subtotal `precioVenta × cantidad` (RN-04); no calcules IVA, descuento prorrateado, total ni cambio.
- Permisos (`SecurityConfig`): `/api/inventario/**`, `/api/producto/**` y `/api/proveedor/**` (escritura) → **ADMIN | BODEGUERO**; `/api/categoria/**`, `/api/usuario/**`, `/api/configuracion/**`, `/api/auditoria/**` → **solo ADMIN**; `/api/caja/**`, `/api/venta/**`, `/api/cliente/**` → **ADMIN | CAJERO**; reportes de utilidad y valor de inventario → **solo ADMIN**; el resto de reportes → cualquier autenticado. Lecturas GET de producto/proveedor/categoría → cualquier rol autenticado.
- `docs/integracion-api.md` está desfasado (plurales, `/api/auth/me`, CSRF). El backend usa `GET /api/auth/sesion` y tiene **CSRF deshabilitado**. Si doc y código discrepan: **para y pregunta**; no improvises.
- No existe `GET` del historial de precios (solo se escribe con `PUT /{id}/precio`).
- `../inventario-papeleria/docs/08-decisiones-pendientes.md` solo tiene D-1 a D-6; este repo cita D-7, D-9 y D-10 (no registradas).

## Documentación útil

| Si vas a... | Lee |
|---|---|
| Reglas de negocio (RN-xx) | `../inventario-papeleria/docs/02-reglas-de-negocio.md` |
| Llamar a la API | `docs/integracion-api.md` + controllers |
| Carpetas, componentes, estado | `docs/arquitectura.md` |
| Construir una pantalla | `docs/pantallas-y-flujos.md` |
| Escáner, cámara, tirilla, etiquetas | `docs/escaner-e-impresion.md` |
| Librerías y entorno | `docs/dependencias-y-entorno.md` |
| Fase actual | `docs/plan-frontend.md` |

Los enlaces `../../docs/*` dentro de `docs/*.md` apuntan a una carpeta inexistente; el material real está en `../inventario-papeleria/docs/`.

## Reglas inviolables

- **El servidor es la fuente de verdad:** no calcules IVA, descuentos, total final, cambio ni stock como dato definitivo. No hay endpoint de cálculo previo; los totales oficiales llegan en la respuesta de `POST /api/venta`. Lo único local es el subtotal sin descuentos (`precioVenta × cantidad`, RN-04).
- **Dinero:** entero, nunca `float` ni `parseFloat` sobre puntos de miles. Campo de dinero = `CampoDinero` (solo dígitos). Se formatea **solo** en `src/lib/formato.ts` → `$ 12.500` (RN-03); ningún otro archivo usa `toLocaleString` ni concatena `$`.
- **Caja con teclado y lector** (RNF-05): el foco vuelve al campo de escaneo; ningún flujo exige mouse.
- **Ventas:** nunca reintento automático; botón de cobrar deshabilitado en curso. El backend **no acepta `Idempotency-Key`** (no implementado); por eso no reintentar. Sin conexión no se confirman ventas y se avisa.
- **Sesión por cookie:** todas las llamadas usan `credentials: 'include'` (`cliente.ts` ya lo hace). Prohibido guardar tokens, claves o datos personales en `localStorage`/`sessionStorage`/cookies JS. Excepciones: preferencias de interfaz y borrador del carrito (solo ids y cantidades).
- **Permisos en pantalla son comodidad, no seguridad:** el backend decide. Un `403` se muestra como «No tienes permiso», no como falla.
- **Errores:** traducir con `mensajeDeError` (`src/api/errores.ts`). El backend aún no envía `codigo` (D-C1); cuando lo haga, decidir por `codigo`, no por texto.
- **Fechas/horas** en `America/Bogota`, formato colombiano (RN-39).
- Tirilla v1: «Comprobante de venta — no es factura electrónica».

## Trampas

- TypeScript ~6.0 con `verbatimModuleSyntax` y `erasableSyntaxOnly`: usa `import type`, **no** `enum` ni parameter properties (los rechaza `tsc -b`). `strict`, `noUnusedLocals`, `noUnusedParameters` activos.
- No escribas APIs de React Router 7, TanStack Query 5, Tailwind v4 (config en CSS `@theme`, sin `tailwind.config.js`), shadcn/Base UI ni `barcode-detector` de memoria: verifica la versión instalada.
- `src/componentes/ui/` lo genera shadcn: editable, no reescribir.
- `src/api/tipos.ts` es manual (no generado). `Producto` espeja `ProductoDto`: `precioVenta`/`costo` llegan como entero; `tarifaIva` ∈ `"19"|"5"|"0"|"EXCLUIDO"`; `unidad` ∈ `UNIDAD|PAQUETE|RESMA|CAJA|PLIEGO|METRO|SERVICIO`. Contrástalos con los `*Dto.java` reales.
- Los reportes (`/api/reporte/*`) devuelven `List<Map<String,Object>>` / `Map<String,Object>` con claves de columna (snake_case); no hay DTO tipado. Define los tipos del frontend a partir de las respuestas reales y verifica nombres de columnas contra el SQL del `ReporteService`.
- Pruebas: MSW corre con `onUnhandledRequest: "error"`; si tocas un endpoint nuevo, añade su handler en `src/pruebas/mocks/handlers.ts`. El catálogo mock es mutable (`reiniciarCatalogo()`); llama `cleanup`/`resetHandlers` ya están en el setup.
- La cámara solo funciona con **HTTPS** o `localhost`; el lector USB siempre.
- `window.print()` requiere gesto del usuario en varios navegadores: imprimir desde clic o tecla.

## Fuera de alcance v1

Venta sin conexión, facturación electrónica, tienda en línea, varias sedes, modo oscuro, i18n.
