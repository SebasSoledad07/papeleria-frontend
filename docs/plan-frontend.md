# Plan de desarrollo del frontend

Sigue las mismas fases que el backend ([`../../docs/06-plan-y-aceptacion.md`](../../docs/06-plan-y-aceptacion.md)). Cada fase termina cuando la pantalla funciona **contra el backend real** y sus pruebas pasan. No se empieza una fase sin que el backend tenga los endpoints que necesita.

## Fase 0. Preparación

**Entrega**
- Proyecto Vite + React + TypeScript (modo estricto), Tailwind v4 y shadcn/ui iniciados.
- Proxy de desarrollo hacia el backend; `.env.example`.
- `npm run api:tipos` genera `src/api/esquema.d.ts`.
- `api/cliente.ts` con credenciales, CSRF, errores y tiempo de espera.
- `lib/formato.ts` con pruebas (`$ 4.500`, `$ 125.000`, `$ 0`).
- `ErrorBoundary`, aviso de «Sin conexión», estructura del menú.

**Listo cuando:** `npm run dev` abre la aplicación, `npm run lint` y `npm run test` pasan, y una llamada de prueba al backend funciona con cookie y CSRF.

## Fase 1. Base: acceso, usuarios y configuración

**Backend necesario:** `auth`, `usuarios`, `configuracion`, `categorias`, `proveedores` (RF-08, RF-43 a RF-46).

**Entrega**
- `/login`, cierre de sesión, `RutaProtegida`, menú por rol.
- Primer inicio de sesión con la clave del administrador inicial y cambio de clave (D-4).
- Pantallas de usuarios, categorías, proveedores y configuración.

**Listo cuando:** cada rol ve solo su menú; un cajero que pega a mano la dirección de una pantalla de administración recibe «No tienes permiso»; las pruebas de permisos por rol pasan.

## Fase 2. Catálogo y escaneo

**Backend necesario:** `productos`, `catalogo`, `codigos`, etiquetas, historial de precios (RF-01 a RF-13).

**Entrega**
- `CampoCodigo` (lector USB), `CamaraEscaner`, `FotoEscaner`, bip (RF-09 a RF-13).
- Listado y búsqueda (RF-06), alta con escaneo y catálogo externo (RF-01 a RF-03), edición con historial de precios (RF-05), activar e inactivar (RF-07).
- Hoja de etiquetas (RF-04).
- Si se aprueba D-7: presentaciones por caja en el alta de productos.

**Listo cuando:**
- Al escanear un producto registrado, su nombre y precio aparecen en **menos de un segundo**.
- Se leen los seis formatos de RF-12 con Chrome de Android y Safari de iPhone.
- Una etiqueta impresa se lee con el lector USB y encuentra el producto.
- «lapiz» encuentra «Lápiz».

## Fase 3. Inventario

**Backend necesario:** compras, ajustes, kárdex, conteo físico (RF-14 a RF-18).

**Entrega**
- Entrada de mercancía por escaneo (RF-14), ajustes con motivo obligatorio (RF-16), kárdex (RF-17), conteo físico con tabla de diferencias (RF-18).
- Los campos de costo se ocultan según D-9.

**Listo cuando:** después de una compra, el stock del producto muestra el valor correcto sin recargar la página; el conteo físico muestra las diferencias y las aplica una sola vez.

## Fase 4. Caja

**Backend necesario:** `cajas`, `ventas`, `ventas/calcular`, `autorizaciones`, `clientes`, tirilla, anulación (RF-19 a RF-29). **Resueltas D-1, D-2, D-6 y D-10.**

**Entrega**
- Apertura y cierre de caja (RF-19, RF-29).
- Pantalla de venta con carrito, atajos de teclado y recuperación del borrador (RF-20, RF-21).
- Descuentos y autorización de administrador (RF-22).
- Cobro con pagos mixtos y cambio, con `Idempotency-Key` (RF-23, RF-25).
- Cliente opcional (RF-24).
- Tirilla de 58 y 80 mm, reimpresión (RF-26).
- Consulta de ventas y anulación (RF-27, RF-28).
- Pruebas: reducer del carrito, componentes y **una prueba E2E con Playwright** del flujo completo solo con teclado.

**Listo cuando:**
- Una venta completa (escanear → descuento → pago mixto → tirilla) se hace **sin tocar el mouse**.
- Escanear dos veces el mismo producto suma una unidad a la misma línea (RN-32).
- Todo valor mostrado coincide con lo que devuelve el servidor.
- Un `STOCK_INSUFICIENTE` o un fallo de red no pierde el carrito, y no crea ventas duplicadas.
- El cierre de caja muestra la diferencia correcta.

## Fase 5. Reportes y panel

**Backend necesario:** `reportes/{nombre}` y `panel` (RF-30 a RF-42).

**Entrega**
- Panel con los indicadores del día y la alerta de stock (RF-42, RN-29).
- `TablaReporte` genérica y la lista de reportes por rol.
- Filtros de fechas, categoría y proveedor (RF-40).
- Exportación a Excel y PDF (RF-41).
- Gráficas básicas en el panel (opcional).

**Listo cuando:** los diez reportes se muestran con la misma tabla, el cajero no ve utilidad ni valor del inventario, y los archivos exportados traen los valores en formato COP.

## Fase 6. Puesta en producción

**Entrega**
- Despliegue en el hosting con dominio propio y HTTPS ([`../../docs/05-despliegue.md`](../../docs/05-despliegue.md)).
- Lista «antes de abrir la papelería» completada con los equipos reales (lector, impresora, celulares).
- Preferencias de cada equipo configuradas (ancho de tirilla, impresión automática).

## Criterios de aceptación transversales

- **Teclado:** la caja se opera completa con teclado y lector (RNF-05).
- **Dinero:** todo valor visible tiene el formato `$ 12.500` y sale de `formato.ts`.
- **Servidor como verdad:** no hay cálculo de IVA, descuento prorrateado, total final o cambio en el frontend.
- **Permisos:** ningún rol ve opciones o datos que el backend le niega (costos y utilidad solo para A).
- **Errores:** cada `codigo` del contrato tiene su mensaje en español y se probó al menos una vez.
- **Sin conexión:** la caja avisa y no permite confirmar ventas.
- **Español de Colombia** en todos los textos (RNF-03).
- **Navegadores:** Chrome, Edge, Safari y Firefox actuales (RNF-02).

## Orden sugerido de trabajo con OpenCode

1. Pide una pantalla a la vez, indicando el archivo de este plan, la sección de `pantallas-y-flujos.md` y los endpoints del contrato.
2. Revisa que use `formato.ts`, `cliente.ts` y `mensajePorCodigo`, y que no calcule totales.
3. Haz que escriba la prueba del reducer o del componente **antes** de conectar la pantalla.
4. Prueba la pantalla a mano contra el backend real antes de pasar a la siguiente.
5. Si una pantalla necesita algo que el contrato no tiene, detente y actualiza `../../docs/04-contrato-api.md`.
