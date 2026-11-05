# Pantallas y flujos

Roles: **A** administrador · **C** cajero · **B** bodeguero. Los requerimientos (RF) y reglas (RN) están en [`../../docs/`](../../docs/). Los endpoints, en [`../../docs/04-contrato-api.md`](../../docs/04-contrato-api.md).

## Mapa de rutas

| Ruta | Pantalla | Roles | Requerimientos |
|---|---|---|---|
| `/login` | Iniciar sesión | público |  |
| `/` | Panel | todos | , RN-29 |
| `/caja` | Caja (punto de venta) | A, C |  |
| `/caja/cierre` | Cierre de caja | A, C |  |
| `/ventas` | Consulta de ventas | A, C |  |
| `/ventas/:id` | Detalle, reimprimir tirilla, anular | A, C (anular: solo A) | ,  |
| `/productos` | Listado y búsqueda | todos |  |
| `/productos/nuevo` | Nuevo producto (con escaneo) | A |  |
| `/productos/:id` | Detalle y edición, historial de precios | A (los demás, solo lectura) | ,  |
| `/productos/:id/kardex` | Kárdex | A, B |  |
| `/productos/etiquetas` | Imprimir etiquetas | A, B |  |
| `/inventario/compras` | Entrada de mercancía | A, B | ,  |
| `/inventario/ajustes` | Ajuste de inventario | A, B |  |
| `/inventario/conteo` | Conteo físico | A, B |  |
| `/categorias`, `/proveedores` | Administración | A (proveedores también lectura B) |  |
| `/reportes` | Lista de reportes | según rol |  |
| `/reportes/:nombre` | Reporte con filtros y exportación | según rol | ,  |
| `/usuarios` | Usuarios | A |  |
| `/configuracion` | Datos del negocio y parámetros | A |  |
| `/preferencias` | Preferencias de este equipo | todos | D-5 |

## Menú por rol

- **Cajero:** Caja, Ventas, Productos (consulta), Preferencias.
- **Bodeguero:** Panel (con alertas de stock), Productos, Inventario, Etiquetas, Reportes de stock.
- **Administrador:** todo.

## Panel (`/`)

- **Tarjetas del día** : ventas del día (A, C), número de ventas, y productos **agotados**, con **stock bajo** y **por agotarse** (A, B). Cada tarjeta de stock lleva al reporte correspondiente.
- **Alerta al iniciar sesión** (RN-29): para A y B, un aviso con los tres conteos de stock.
- Se recarga al volver a la pestaña y después de cada venta o movimiento de inventario.

## Caja (`/caja`)

La pantalla más importante. Debe poder operarse **completa con teclado y lector** (RNF-05).

### Estados

1. **Sin caja abierta:** solo se muestra el formulario de apertura con la base inicial en efectivo . Hasta abrirla no se puede vender (RN-30).
2. **Caja abierta:** pantalla de venta.
3. **Cobrando:** ventana modal de pago.
4. **Venta confirmada:** resumen con el consecutivo, impresión de la tirilla y regreso inmediato a una venta nueva.

### Distribución

```
┌───────────────────────────────────────────────┬───────────────────────┐
│ [ Escanee o escriba el producto…            ] │   Cliente: (opcional) │
├───────────────────────────────────────────────┤                       │
│ Producto            Cant.   Precio     Total  │   Subtotal   $ 24.800 │
│ Lápiz Mirado N°2     2     $ 1.000   $ 2.000  │   Descuento  $      0 │
│ Cuaderno cosido      1    $ 23.800  $ 23.800  │                       │
│                                               │   TOTAL      $ 24.800 │
│                                               │                       │
│                                               │   [ Cobrar  F9 ]      │
└───────────────────────────────────────────────┴───────────────────────┘
```

Números grandes y legibles. En celular o tablet, la columna derecha pasa debajo de la tabla.

### Escaneo y búsqueda

- El **campo de escaneo siempre tiene el foco.** Después de cada acción, de cerrar una ventana o de hacer clic fuera, el foco vuelve a él.
- El lector USB «escribe» el código y envía Enter . Regla del campo (`CampoCodigo`):
  - Texto de **8 a 14 dígitos** → búsqueda exacta por código (`GET /api/productos/codigo/{codigo}`).
  - Cualquier otro texto → búsqueda por nombre, marca o categoría (`GET /api/productos?q=`), con lista de sugerencias que se recorre con ↑ ↓ y se elige con Enter.
- Si el código no existe: aviso «Producto no registrado» con sonido de error; el foco se queda en el campo. No se abre ningún formulario (cada rol hace lo suyo: A puede registrarlo desde Productos).
- **Si el producto ya está en el carrito, se suma una unidad a esa línea** (RN-32). No se crea otra línea.
- Un producto **inactivo** no aparece (RN-17). Un producto **agotado** se agrega con una advertencia; el servidor puede rechazarlo al cobrar (`STOCK_INSUFICIENTE`).
- Un código de caja (D-7, si se aprueba) agrega varias unidades de una vez.
- Cámara del celular: botón «Escanear con la cámara» abre `CamaraEscaner` (ver [`escaner-e-impresion.md`](escaner-e-impresion.md)). Funciona con el mismo flujo que el lector.

### Carrito

- Cambiar cantidad : `+` / `-` sobre la línea seleccionada, o escribir el número. La cantidad mínima es 1; para quitar la línea se usa `Supr`.
- Línea seleccionada con ↑ ↓. Doble Enter sobre una línea abre su descuento.
- **Subtotal** del carrito = suma de `precioVenta × cantidad`, calculado en local. Todo lo demás lo da el servidor (ver abajo).
- Con el carrito vacío no se puede cobrar.
- El borrador del carrito se guarda en `sessionStorage` (ids y cantidades) y se recupera si se recarga la página por accidente.

### Descuentos (RN-33)

- Por línea o sobre el total, en porcentaje o en valor.
- Al aplicar un descuento, el frontend llama a `POST /api/ventas/calcular` y muestra lo que devuelve el servidor (incluido el prorrateo, D-1).
- Si el descuento supera el límite de la configuración (`GET /api/configuracion/publica`), se abre la ventana **«Autorización de administrador»** (usuario y clave). El frontend llama a `POST /api/autorizaciones/descuento`, guarda solo el `autorizacionId` y descarta la clave de inmediato (D-6). Si la autorización vence o es inválida, se vuelve a pedir.

### Cliente (RN-36)

Opcional. Se busca por número de documento; si no existe, se crea con tipo de documento, número y nombre.

### Cobro (RN-34, RN-35)

Ventana modal que se abre con **F9** o el botón. Antes de mostrarse llama a `/api/ventas/calcular` para presentar el **total oficial**.

- Una o varias filas de pago: medio (`EFECTIVO`, tarjetas, Nequi, Daviplata, transferencia) y valor. Para medios distintos de efectivo, campo opcional de referencia.
- Por defecto, una fila de **efectivo** con el total. Botones rápidos de «Exacto» y de billetes habituales ($ 10.000, $ 20.000, $ 50.000, $ 100.000).
- Se muestra **«Falta»** o **«Cambio»** en tiempo real. Es solo una ayuda visual; el servidor valida (`PAGO_INSUFICIENTE`, `PAGO_EXCEDE_TOTAL`).
- **Confirmar** con Enter. Al enviar: botón deshabilitado, `Idempotency-Key` nueva por intento, sin reintentos automáticos.
- Respuesta correcta → se muestra el **consecutivo**, se imprime la tirilla (según preferencia) y se limpia el carrito. El foco vuelve al campo de escaneo.

### Errores al cobrar

| `codigo` | Qué hace la pantalla |
|---|---|
| `STOCK_INSUFICIENTE` | Marca la línea afectada, muestra «Solo hay N» y ofrece ajustar la cantidad. El carrito se conserva. |
| `CAJA_NO_ABIERTA` | Lleva a la apertura de caja; el carrito se conserva. |
| `PAGO_INSUFICIENTE`, `PAGO_EXCEDE_TOTAL` | Resalta la fila de pagos con el mensaje. |
| `DESCUENTO_REQUIERE_AUTORIZACION`, `AUTORIZACION_INVALIDA` | Reabre la ventana de autorización. |
| `PRODUCTO_INACTIVO` | Quita la línea y avisa. |
| `NO_AUTENTICADO` | Lleva a `/login` sin perder el carrito. |
| Error de red o timeout | Aviso «No se pudo confirmar. Revisa en Ventas antes de volver a cobrar.» La pantalla **no** reenvía sola; el cajero verifica si la venta quedó registrada. |

### Atajos de teclado (propuesta, ajustable)

| Tecla | Acción |
|---|---|
| (cualquier lectura) | Agrega el producto |
| `F2` | Ir al campo de búsqueda |
| `F4` | Descuento (de la línea seleccionada, o del total si no hay selección) |
| `F6` | Cliente |
| `F9` | Cobrar |
| `+` / `-` | Cantidad de la línea seleccionada |
| `Supr` | Quitar la línea seleccionada |
| `Esc` | Cerrar la ventana abierta / cancelar |
| `Ctrl + Supr` | Vaciar el carrito (pide confirmación) |

No se usan `F1`, `F5`, `F11` ni `F12` (el navegador los toma).

## Cierre de caja (`/caja/cierre`, RN-41)

1. El cajero escribe el **efectivo contado** y confirma.
2. La pantalla muestra lo que devuelve el servidor: efectivo esperado, **diferencia** (sobrante o faltante) y resumen por medio de pago.
3. Se puede imprimir el resumen. Cerrada la caja, no se puede vender (RN-42) y el cajero vuelve a la pantalla de apertura.

## Ventas (`/ventas`)

- Filtros: fecha, consecutivo, cajero, cliente . El cajero solo ve las de su caja.
- Detalle: líneas, IVA discriminado por tarifa (RN-12), pagos, estado. Botón **Reimprimir tirilla**.
- **Anular** (solo A): pide motivo obligatorio y confirmación. La anulación devuelve las unidades al inventario (RN-38). Si la caja ya cerró, el servidor responde `ANULACION_NO_PERMITIDA` (D-2).

## Productos

### Listado (`/productos`)

Búsqueda por código, nombre, marca o categoría, tolerante a mayúsculas, tildes y errores : la búsqueda la hace el servidor; el frontend solo envía `q` con una pequeña espera (~300 ms) al escribir. Filtros por categoría, proveedor, estado de stock y activo. Cada fila muestra el **estado de stock** con color y texto (no solo color). Las columnas de costo solo existen para A.

### Nuevo producto (`/productos/nuevo`)

1. Campo de escaneo (lector o cámara).
2. Si el código **ya existe** (`GET /api/productos/codigo/...?incluirInactivos=true` responde 200; también cuenta si está inactivo) → se abre la edición de ese producto, con aviso «Este código ya está registrado» (RN-13).
3. Si **no existe** → se consulta `GET /api/catalogo/{codigo}`. Si hay datos, se **prellena** el formulario con un aviso «Datos sugeridos: revísalos y completa el precio» (RN-16). Si falla (`CATALOGO_NO_DISPONIBLE`) o no hay datos, se sigue con el formulario vacío, sin bloquear.
4. Formulario: nombre, marca, categoría, proveedor, unidad, precio de venta (con IVA incluido), costo, tarifa de IVA, stock inicial, stock mínimo.
5. Producto **sin código de fábrica**: botón «Generar código interno» (RN-15) y, al guardar, ofrecer imprimir la etiqueta.
6. **Advertencias sin bloquear:** precio de venta ≤ costo (RN-06). **Errores que sí bloquean:** precio ≤ 0 (RN-05).
7. La tarifa de IVA muestra una nota: «Valídala con el contador» (RN-10).

### Edición y precios (RN-07)

Al cambiar el precio se pide confirmación mostrando «antes → después». La pestaña **Historial de precios** lista cambios con usuario y fecha. **Inactivar**  en lugar de eliminar (RN-17).

### Etiquetas 

Seleccionar productos y número de copias → vista previa → imprimir. Ver [`escaner-e-impresion.md`](escaner-e-impresion.md).

## Inventario

### Entrada de mercancía (`/inventario/compras`)

Proveedor, número de factura del proveedor y líneas. Cada producto se agrega **escaneando**; por línea se indican cantidad y costo unitario. Se muestra el total de la factura. Al guardar, el servidor actualiza stock y costo promedio (RN-23). Si se aprueba D-7, la cantidad se indica por presentación (cajas) y la pantalla muestra la conversión a unidades.

### Ajustes (`/inventario/ajustes`, RN-22)

Escanear el producto, indicar cantidad positiva o negativa y **motivo obligatorio**: conteo físico, producto dañado, pérdida, vencimiento u otro (con descripción). Confirmación antes de enviar.

### Conteo físico (`/inventario/conteo`, D-3)

1. Se escanean los productos y se registra la cantidad contada (cada lectura suma una unidad; también se puede escribir el número).
2. Al terminar, la pantalla muestra una **tabla de diferencias** (sistema vs. contado) y pide confirmación.
3. Al confirmar, se envía `POST /api/conteos` y el servidor genera los ajustes. El conteo vive en el navegador hasta ese momento; si se cierra la pestaña se pierde (conteo de una sola sesión).

### Kárdex (`/productos/:id/kardex`)

Tabla paginada: fecha, tipo de movimiento, cantidad (con signo), stock resultante, usuario, referencia.

## Reportes (`/reportes`)

- La lista muestra solo los reportes que el rol puede ver, agrupados: **Stock** (stock bajo, agotados, por agotarse, pedido por proveedor), **Ventas** (ventas por periodo, más vendidos, sin movimiento), **Dinero** (utilidad, valor del inventario, cierres de caja; solo A).
- La pantalla de un reporte tiene los **filtros comunes** (fechas, categoría, proveedor) y una **tabla genérica** que se construye con `columnas` y `filas` de la respuesta. Una sola tabla sirve para todos los reportes.
- `DINERO` se formatea con `formato.ts`; `ESTADO_STOCK` se muestra con su insignia.
- Botones **Excel** y **PDF** : piden el mismo reporte con `formato=xlsx|pdf` y descargan el archivo.
- «Pedido por proveedor» : agrupado por proveedor, con total por proveedor, listo para imprimir o exportar.

## Usuarios y configuración

- **Usuarios** : lista, crear, editar rol, inactivar. La clave se escribe solo al crear o cambiarla y nunca se muestra.
- **Configuración** : datos del negocio (razón social, NIT, dirección, teléfono, mensaje de la tirilla) y parámetros (stock mínimo por defecto, días de «por agotarse», días de promedio, días de cobertura, descuento máximo sin autorización).

## Preferencias de este equipo (`/preferencias`)

Se guardan en `localStorage` del navegador, no en el servidor:

| Preferencia | Valores | Uso |
|---|---|---|
| Ancho de tirilla | 58 mm / 80 mm | Tamaño de la impresión (D-5) |
| Imprimir tirilla automáticamente | sí / no | Al confirmar una venta |
| Sonido de lectura | sí / no | Bip al escanear |
| Cámara preferida | automática / trasera | Escaneo con cámara |

## Estados comunes a todas las pantallas

- **Cargando:** indicador y, cuando aplica, esqueleto de la tabla.
- **Vacío:** mensaje y la acción siguiente («Aún no hay productos. Crea el primero»).
- **Error:** mensaje en español con el `codigo` traducido y botón «Reintentar» para las consultas.
- **Sin permiso (403):** «No tienes permiso para hacer esto».
- **Sin conexión:** aviso fijo; las acciones que modifican datos quedan deshabilitadas.
