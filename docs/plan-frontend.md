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

**Backend necesario:** `auth`, `usuarios`, `configuracion`, `categorias`, `proveedores` .

**Entrega**
- `/login`, cierre de sesión, `RutaProtegida`, menú por rol.
- Primer inicio de sesión con la clave del administrador inicial y cambio de clave (D-4).
- Pantallas de usuarios, categorías, proveedores y configuración.

**Listo cuando:** cada rol ve solo su menú; un cajero que pega a mano la dirección de una pantalla de administración recibe «No tienes permiso»; las pruebas de permisos por rol pasan.

## Fase 2. Catálogo y escaneo

**Backend necesario:** `productos`, `catalogo`, `codigos`, etiquetas, historial de precios .

**Entrega**
- `CampoCodigo` (lector USB), `CamaraEscaner`, `FotoEscaner`, bip .
- Listado y búsqueda , alta con escaneo y catálogo externo , edición con historial de precios , activar e inactivar .
- Hoja de etiquetas .
- Si se aprueba D-7: presentaciones por caja en el alta de productos.

**Listo cuando:**
- Al escanear un producto registrado, su nombre y precio aparecen en **menos de un segundo**.
- Se leen los seis formatos de  con Chrome de Android y Safari de iPhone.
- Una etiqueta impresa se lee con el lector USB y encuentra el producto.
- «lapiz» encuentra «Lápiz».

## Fase 3. Inventario

**Backend necesario:** compras, ajustes, kárdex, conteo físico .

**Entrega**
- Entrada de mercancía por escaneo , ajustes con motivo obligatorio , kárdex , conteo físico con tabla de diferencias .
- Los campos de costo se ocultan según D-9.

**Listo cuando:** después de una compra, el stock del producto muestra el valor correcto sin recargar la página; el conteo físico muestra las diferencias y las aplica una sola vez.

## Fase 4. Caja

**Backend necesario:** `cajas`, `ventas`, `ventas/calcular`, `autorizaciones`, `clientes`, tirilla, anulación . **Resueltas D-1, D-2, D-6 y D-10.**

**Entrega**
- Apertura y cierre de caja .
- Pantalla de venta con carrito, atajos de teclado y recuperación del borrador .
- Descuentos y autorización de administrador .
- Cobro con pagos mixtos y cambio, con `Idempotency-Key` .
- Cliente opcional .
- Tirilla de 58 y 80 mm, reimpresión .
- Consulta de ventas y anulación .
- Pruebas: reducer del carrito, componentes y **una prueba E2E con Playwright** del flujo completo solo con teclado.

**Listo cuando:**
- Una venta completa (escanear → descuento → pago mixto → tirilla) se hace **sin tocar el mouse**.
- Escanear dos veces el mismo producto suma una unidad a la misma línea (RN-32).
- Todo valor mostrado coincide con lo que devuelve el servidor.
- Un `STOCK_INSUFICIENTE` o un fallo de red no pierde el carrito, y no crea ventas duplicadas.
- El cierre de caja muestra la diferencia correcta.

## Fase 5. Reportes y panel

**Backend necesario:** `reportes/{nombre}` y `panel` .

**Entrega**
- Panel con los indicadores del día y la alerta de stock (RN-29).
- `TablaReporte` genérica y la lista de reportes por rol.
- Filtros de fechas, categoría y proveedor .
- Exportación a Excel y PDF .
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
