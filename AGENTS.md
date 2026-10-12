# Frontend — Sistema de Inventario y Ventas para Papelería

SPA para la caja, el inventario y los reportes de una papelería en Colombia. **Solo el cliente:** la API es el backend hermano `../inventario-papeleria` (Spring Boot 4 + PostgreSQL; su arranque y sus reglas están en `../inventario-papeleria/AGENTS.md`). Moneda **COP en enteros**, interfaz en **español de Colombia**.

Instalado hoy: React 19 · TypeScript ~6.0 · Vite 8 · Tailwind v4 + shadcn (Base UI) · React Router 7 · TanStack Query 5 · React Hook Form + Zod · `barcode-detector` · recharts.

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b + vite build → dist/   (el typecheck corre aquí)
npm run lint     # eslint (.agents ignorado)
npm test         # vitest run (jsdom + MSW)
npx tsc -b       # typecheck en modo estricto
```

**Faltan** `test:e2e` (Playwright, Fase 4) y `api:tipos` (openapi-typescript; bloqueado hasta que el backend exponga `/v3/api-docs`). El stack de pruebas ya está: vitest 5 + @testing-library + jsdom + MSW, con setup en `src/pruebas/` (`preparacion.ts` registra jest-dom, limpia y levanta el `servidor`; `mocks/handlers.ts` y `mocks/servidor.ts`). Node ≥ 22.12. `vite.config.ts` define el bloque `test` (usa `/// <reference types="vitest/config" />`).

## Estado verificado

- **Base Fase 0 y pantallas Fase 1 listas.** `src/` tiene `api/` (`cliente.ts`, `errores.ts`, `tipos.ts`), `lib/formato.ts`, `rutas/` (`router.tsx`, `RutaProtegida.tsx`, `navegacion.ts`), `componentes/` (ui + comunes: ErrorBoundary, SinConexion, Campo, PaginaTitulo, AvisoError, PantallaCarga) y `caracteristicas/`: autenticación (login), usuarios, categorías, proveedores, configuración, panel (`Panel.tsx`, solo tarjetas de acceso — **no** es el dashboard de reportes de Fase 5) y errores (`NoEncontrado.tsx`, `SinPermiso.tsx`). Rutas: `/login`, `/` (Panel), `/usuarios`, `/categorias`, `/proveedores`, `/configuracion`, `/404`. Las pantallas de administración exigen rol `ADMIN`. `src/components/ui/` se renombró a `src/componentes/ui/` y el override de ESLint apunta ahí + `src/rutas/`. `tsconfig.app.json` ganó `paths: { "@/*": ["./src/*"] }` (sin `baseUrl`, deprecado en TS 6). La sesión se lee con `useSesion()` → `GET /api/auth/sesion` (clave TanStack `["usuario"]`).
- **Permisos por rol (comodidad, no seguridad).** `navegacion.ts` exporta `menu` (con `roles` por ítem) y `menuPorRol(rol)`; `App.tsx` filtra el menú con este; `RutaProtegida` acepta `roles?: Rol[]` y, si el rol no está, renderiza `SinPermiso` («No tienes permiso»). Un `403` del backend se sigue mostrando como «No tienes permiso», sin tratarlo como falla.
- `npm run lint` y `npx tsc -b` **pasan**: ambos tsconfigs tienen `"strict": true`, ESLint ignora `.agents/` y `dist`, y `react-refresh/only-export-components` está desactivado en `src/componentes/ui/` (los componentes de shadcn exportan helpers como `buttonVariants`) y en `src/rutas/` (exportan el router/constantes).
- `vite.config.ts` reenvía `/api` → `http://localhost:8080` (documentado en `docs/integracion-api.md`) y existe `public/_redirects` (`/*  /index.html  200`), que `npm run build` copia a `dist/`.
- El tema Tailwind/shadcn (`@import "tailwindcss"` + `@theme inline` + `:root`/`.dark`) vive en **`src/App.css`**, importado por `App.tsx`. **Ojo:** el paquete `shadcn` en `dependencies` es un placeholder vacío; no vuelvas a poner `@import "shadcn/tailwind.css"` (rompe `npm run build`).
- shadcn está en estilo **`base-nova`**: componentes sobre **Base UI** (`@base-ui/react`), **no Radix** (los docs dicen Radix). `cn` sale del paquete `cn`, reexportado por `src/lib/utils.ts`.
- `components.json` está alineado con el código: `aliases.components: "@\/componentes"`, `aliases.ui: "@\/componentes/ui"`; el alias `@/*` queda en `tsconfig.app.json` y `vite.config.ts`.
- `.gitignore` ignora también `.env.example` (no llega a Git). No hay CI, Prettier ni pre-commit; git: `main` sin remoto.

## El contrato hoy

`docs/04-contrato-api.md` es un **borrador propuesto** (escrito desde los controllers, sección «Decisiones abiertas» D-C1 a D-C7). No está confirmado: hasta que las decisiones se resuelvan, la fuente de verdad sigue siendo el código del backend. Los enlaces `../../docs/*` de `docs/*.md` apuntan a una carpeta que no existe: el material real es `../inventario-papeleria/docs/`.

- La verdad de los endpoints son los controllers: `../inventario-papeleria/src/main/java/com/soledad/inventariopapeleria/**/api/*Controller.java`. Rutas reales, en **singular**: `/api/auth/login|logout|sesion`, `/api/usuario`, `/api/configuracion`, `/api/categoria`, `/api/proveedor`, `/api/producto`, `/api/catalogo/codigo/{codigo}`, `/api/inventario/{id}/ajuste-positivo|ajuste-negativo`.
- `docs/integracion-api.md` ejemplifica plurales (`/api/productos`), `GET /api/auth/me` y un flujo CSRF con `GET /api/auth/csrf`; el backend hoy expone `GET /api/auth/sesion` y `SecurityConfig` tiene CSRF **deshabilitado**. Si el doc y el código discrepan: **para, no improvises, pregunta**.
- No hay springdoc: `/v3/api-docs` no existe, así que `api:tipos` no puede correr hasta que el backend lo añada.
- `../inventario-papeleria/docs/08-decisiones-pendientes.md` tiene **solo D-1 a D-6**; los docs de este repo citan D-7, D-9 y D-10 que aún no están registradas.

## Fase actual (qué toca ahora)

**Fase 0 y Fase 1 cerradas; lo siguiente es la Fase 2** de `docs/plan-frontend.md`.

- **Fase 0 cerrada** salvo `api:tipos`. Pruebas instaladas y en verde (`npm test`): `lib/formato`, `api/errores`, `rutas/navegacion` y `rutas/RutaProtegida` (MSW simula la sesión). `api:tipos` no puede correr hasta que el backend añada springdoc (`/v3/api-docs` no existe).
- **Fase 1 cerrada** salvo D-4. Login, usuarios, categorías, proveedores, configuración, menú por rol y permisos por pantalla, todo probado. **D-4 (cambio de clave obligatorio al primer inicio) queda bloqueado**: el backend no expone ningún flag (`SesionDto` es solo `{nombre, rol}`), así que no se implementa hasta que lo añada. Omitido a propósito; no inventarlo.
- **Fase 2 (catálogo y escaneo) es lo siguiente:** productos, `CampoCodigo`, `CamaraEscaner`, etiquetas. Antes de empezar hace falta contrato de `/api/producto` (hoy solo tiene `GET`, `POST` y `PUT /{id}/precio`) y decidir D-7 (presentaciones por caja).

Prueba contra el backend real: `./mvnw spring-boot:run` en `../inventario-papeleria`, PostgreSQL en :5435 vía su `docker-compose.yml`; la API queda en :8080. Requiere Docker Desktop iniciado y JDK 21 (el `java` del sistema es 1.8).

## Cómo trabajar (léelo antes de programar)

1. **Lee solo la documentación que necesitas:**

   | Si vas a... | Lee |
   |---|---|
   | Entender reglas de negocio (RN-xx) | `../inventario-papeleria/docs/02-reglas-de-negocio.md` |
   | Llamar a la API o manejar errores | `docs/integracion-api.md` + los controllers (ver «El contrato hoy») |
   | Crear carpetas, componentes, estado | `docs/arquitectura.md` |
   | Construir o cambiar una pantalla | `docs/pantallas-y-flujos.md` |
   | Escáner, cámara, tirilla, etiquetas | `docs/escaner-e-impresion.md` |
   | Añadir librerías o configurar | `docs/dependencias-y-entorno.md` |
   | Saber qué fase toca | `docs/plan-frontend.md` |
   | Algo no definido | `../inventario-papeleria/docs/08-decisiones-pendientes.md` (solo D-1 a D-6) |

2. **El contrato manda.** No inventes endpoints, campos ni códigos de error. Sin contrato escrito, la fuente son los controllers; si falta algo, **para y pregunta** antes de seguir.
3. **Los tipos de la API son generados:** `src/api/esquema.d.ts` (cuando exista) no se edita a mano.
4. **Trabaja por fases** (`docs/plan-frontend.md`). No adelantes pantallas de una fase posterior.
5. **Cita la regla** que implementas: comentario `// RN-32` o nombre de prueba.
6. **Si falta una regla, pregunta.** No inventes comportamiento de negocio.

## Reglas inviolables

- **El servidor es la fuente de verdad.** Nunca calcules IVA, descuentos prorrateados, total final, cambio ni stock disponible como dato definitivo. Para una venta, usa `POST /api/ventas/calcular`. Lo único que se calcula en local es el subtotal sin descuentos (`precioVenta × cantidad`, exacto porque el precio incluye IVA, RN-04).
- **El dinero se formatea en un solo lugar:** `src/lib/formato.ts` → `$ 12.500`, sin decimales (RN-03). Ningún otro archivo usa `toLocaleString` ni concatena `$`. El dinero viaja y se guarda como **número entero**; nunca como texto formateado.
- **Nada de `float` para dinero** y nada de `parseFloat` sobre texto con puntos de miles. Los campos de dinero usan `CampoDinero` (solo dígitos).
- **La caja se opera con teclado y lector** (RNF-05). El foco vuelve al campo de escaneo después de cada acción. Ningún flujo de la caja puede exigir el mouse.
- **Una venta nunca se reintenta sola.** Las mutaciones tienen `retry: false`. El botón de cobrar se deshabilita mientras la petición está en curso. Cada intento de cobro lleva su `Idempotency-Key` (RF-23/RF-25).
- **Si se pierde la conexión, no se confirman ventas** y se muestra un aviso visible.
- **Autenticación por cookie de sesión.** Todas las llamadas con `credentials: 'include'`. El token CSRF vive solo en memoria. **Prohibido** guardar tokens, claves o datos personales en `localStorage`, `sessionStorage` o cookies de JavaScript. Excepciones permitidas: `localStorage` para preferencias de interfaz (ancho de tirilla, sonido) y `sessionStorage` para el borrador del carrito (solo ids y cantidades).
- **Los permisos se aplican en pantalla por comodidad, no por seguridad.** Se oculta lo que el rol no puede hacer, pero el backend decide. Un `403` se muestra como «No tienes permiso», sin tratarlo como falla.
- **Los mensajes de error salen del `codigo`**, no del texto de `detail` (`src/api/errores.ts`).
- **Fechas y horas** se muestran en `America/Bogota`, formato colombiano (RN-39).
- **Comprobante no fiscal:** la tirilla de la versión 1 dice «Comprobante de venta — no es factura electrónica».

## Convenciones

- Código, nombres de archivos de pantallas y textos de interfaz en **español**; nombres técnicos de React (`use...`, `Provider`) se mantienen.
- Un componente por archivo; `PascalCase` para componentes, `camelCase` para funciones y hooks.
- Organización **por característica** (`caracteristicas/caja`, `caracteristicas/productos`...), no por tipo de archivo. Una característica no importa de otra, salvo por su `index.ts`; lo compartido va en `componentes/` o `lib/` (dependencias entre carpetas: tabla de `docs/arquitectura.md`).
- Estado del servidor con TanStack Query; formularios con React Hook Form + Zod; estado de interfaz con `useState`. El carrito es un reducer puro y probado.
- Accesibilidad básica: etiquetas en campos, foco visible, botones con texto, contraste suficiente. Objetivos táctiles amplios en pantallas de celular.
- Commits pequeños que mencionen la regla o requerimiento: `feat(caja): suma una unidad si el producto ya está en el carrito (RN-32)`.

## Trampas

- El entrenamiento del modelo suele asumir versiones anteriores. **Consulta la documentación de la versión instalada** de React Router, TanStack Query, Tailwind v4 (configuración en CSS con `@theme`, no `tailwind.config.js`), shadcn/ui y `barcode-detector` antes de escribir su API de memoria.
- TypeScript ~6.0 con `verbatimModuleSyntax` y `erasableSyntaxOnly`: usa `import type` y **no** `enum` ni parámetros con propiedades (el `tsc -b` los rechaza).
- Los componentes de `src/components/ui/` los genera shadcn/ui: se pueden editar, pero no se reescriben desde cero.
- La cámara solo funciona con **HTTPS** (o `localhost`). El lector USB funciona siempre.
- Los navegadores bloquean `window.print()` sin gesto del usuario en algunos casos: la impresión se lanza desde un clic o una tecla.

## Fuera de alcance de la versión 1

Venta sin conexión, facturación electrónica, tienda en línea, varias sedes, modo oscuro, internacionalización a otros idiomas.
