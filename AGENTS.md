# Frontend — Sistema de Inventario y Ventas para Papelería

Aplicación web (SPA) para la caja, el inventario y los reportes de una papelería en Colombia. Consume la API REST de `../backend`. Moneda: **pesos colombianos (COP), enteros**. Idioma de la interfaz: **español de Colombia**.

Este proyecto es **solo el cliente**. Antes de empezar, lee también `../AGENTS.md` (reglas compartidas) y, para cualquier llamada a la API, `../docs/04-contrato-api.md`.

## Stack

React 19 · TypeScript (modo estricto) · Vite 8 · React Router · TanStack Query v5 · Tailwind CSS v4 + shadcn/ui · React Hook Form + Zod · `openapi-typescript` + `openapi-fetch` · `barcode-detector` (cámara) · Vitest + Testing Library + MSW · Playwright (E2E de la caja). Node.js 22.12 o superior.

## Comandos

```bash
npm install
npm run dev          # http://localhost:5173 (proxy /api → http://localhost:8080)
npm run build        # genera dist/
npm run test         # Vitest
npm run lint         # ESLint + tsc --noEmit
npm run api:tipos    # regenera src/api/esquema.d.ts desde el backend (debe estar corriendo con perfil dev)
```

## Cómo trabajar (léelo antes de programar)

1. **Lee solo la documentación que necesitas:**

   | Si vas a... | Lee |
   |---|---|
   | Entender reglas de negocio (RN-xx) | `../docs/02-reglas-de-negocio.md` |
   | Llamar a la API o manejar errores | `../docs/04-contrato-api.md` y `docs/integracion-api.md` |
   | Crear carpetas, componentes, estado | `docs/arquitectura.md` |
   | Construir o cambiar una pantalla | `docs/pantallas-y-flujos.md` |
   | Escáner, cámara, tirilla, etiquetas | `docs/escaner-e-impresion.md` |
   | Añadir librerías o configurar | `docs/dependencias-y-entorno.md` |
   | Saber qué fase toca | `docs/plan-frontend.md` |
   | Algo no definido | `../docs/07-decisiones-pendientes.md` |

2. **El contrato manda.** No inventes endpoints, campos ni códigos de error. Si falta algo, propón el cambio en `../docs/04-contrato-api.md` y avisa antes de seguir.
3. **Los tipos de la API son generados.** `src/api/esquema.d.ts` no se edita a mano. Si cambia el backend, corre `npm run api:tipos`.
4. **Trabaja por fases** (`docs/plan-frontend.md`). No adelantes pantallas de una fase posterior.
5. **Cita la regla** que implementas: comentario `// RN-32` o nombre de prueba.
6. **Si falta una regla, pregunta.** No inventes comportamiento de negocio.

## Reglas inviolables

- **El servidor es la fuente de verdad.** Nunca calcules IVA, descuentos prorrateados, total final, cambio ni stock disponible como dato definitivo. Para una venta, usa `POST /api/ventas/calcular`. Lo único que se calcula en local es el subtotal sin descuentos (`precioVenta × cantidad`, exacto porque el precio incluye IVA, RN-04).
- **El dinero se formatea en un solo lugar:** `src/lib/formato.ts` → `$ 12.500`, sin decimales (RN-03). Ningún otro archivo usa `toLocaleString` ni concatena `$`. El dinero viaja y se guarda como **número entero**; nunca como texto formateado.
- **Nada de `float` para dinero** y nada de `parseFloat` sobre texto con puntos de miles. Los campos de dinero usan `CampoDinero` (solo dígitos).
- **La caja se opera con teclado y lector** (RNF-05). El foco vuelve al campo de escaneo después de cada acción. Ningún flujo de la caja puede exigir el mouse.
- **Una venta nunca se reintenta sola.** Las mutaciones tienen `retry: false`. El botón de cobrar se deshabilita mientras la petición está en curso. Cada intento de cobro lleva su `Idempotency-Key` (D-10).
- **Si se pierde la conexión, no se confirman ventas** y se muestra un aviso visible.
- **Autenticación por cookie de sesión.** Todas las llamadas con `credentials: 'include'`. El token CSRF vive solo en memoria. **Prohibido** guardar tokens, claves o datos personales en `localStorage`, `sessionStorage` o cookies de JavaScript. Excepciones permitidas: `localStorage` para preferencias de interfaz (ancho de tirilla, sonido) y `sessionStorage` para el borrador del carrito (solo ids y cantidades).
- **Los permisos se aplican en pantalla por comodidad, no por seguridad.** Se oculta lo que el rol no puede hacer, pero el backend decide. Un `403` se muestra como «No tienes permiso», sin tratarlo como falla.
- **Los mensajes de error salen del `codigo`**, no del texto de `detail` (`src/api/errores.ts`).
- **Fechas y horas** se muestran en `America/Bogota`, formato colombiano.
- **Comprobante no fiscal:** la tirilla de la versión 1 dice «Comprobante de venta — no es factura electrónica».

## Convenciones

- Código, nombres de archivos de pantallas y textos de interfaz en **español**; nombres técnicos de React (`use...`, `Provider`) se mantienen.
- Un componente por archivo; `PascalCase` para componentes, `camelCase` para funciones y hooks.
- Organización **por característica** (`caracteristicas/caja`, `caracteristicas/productos`...), no por tipo de archivo. Una característica no importa de otra, salvo por su `index.ts`; lo compartido va en `componentes/` o `lib/`.
- Estado del servidor con TanStack Query; formularios con React Hook Form + Zod; estado de interfaz con `useState`. El carrito es un reducer puro y probado.
- Accesibilidad básica: etiquetas en campos, foco visible, botones con texto, contraste suficiente. Objetivos táctiles amplios en pantallas de celular.
- Commits pequeños que mencionen la regla o requerimiento: `feat(caja): suma una unidad si el producto ya está en el carrito (RN-32)`.

## Trampas

- El entrenamiento del modelo suele asumir versiones anteriores. **Consulta la documentación de la versión instalada** de React Router, TanStack Query, Tailwind v4 (configuración en CSS con `@theme`, no `tailwind.config.js`), shadcn/ui y `barcode-detector` antes de escribir su API de memoria.
- Los componentes de `componentes/ui/` los genera shadcn/ui: se pueden editar, pero no se reescriben desde cero.
- La cámara solo funciona con **HTTPS** (o `localhost`). El lector USB funciona siempre.
- Los navegadores bloquean `window.print()` sin gesto del usuario en algunos casos: la impresión se lanza desde un clic o una tecla.

## Fuera de alcance de la versión 1

Venta sin conexión, facturación electrónica, tienda en línea, varias sedes, modo oscuro, internacionalización a otros idiomas.
