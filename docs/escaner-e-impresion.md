# Escáner, cámara e impresión

Cubre ,  y .

## Tres formas de leer un código

| Forma | Requerimiento | Dónde se usa | Requiere |
|---|---|---|---|
| Lector USB o Bluetooth |  | Caja, compras, ajustes, conteo, nuevo producto | Nada especial |
| Cámara del celular en vivo |  | Cualquier pantalla con `CampoCodigo` | **HTTPS** (o `localhost`) y permiso de cámara |
| Foto enviada al servidor |  | Respaldo si la cámara falla | Conexión con el backend |

Formatos que deben leerse : **EAN-13, EAN-8, UPC-A, UPC-E, Code 128 y Code 39**. La normalización (UPC-A de 12 dígitos → EAN-13, RN-14) la hace el backend: el frontend envía el código tal como se leyó.

## Lector USB o Bluetooth 

El lector funciona como un teclado: «escribe» el código y termina con Enter. Debe estar configurado con la distribución de teclado en español y el sufijo Enter.

**Estrategia:** un campo de texto con foco permanente (`CampoCodigo`), sin escuchar el teclado de toda la página.

1. `CampoCodigo` se enfoca al montarse y **recupera el foco** cuando lo pierde (`onBlur`), salvo si hay una ventana modal abierta o el foco pasó a otro campo de entrada a propósito.
2. Al presionar **Enter**, entrega el valor a quien lo usa (`onCodigo`) y se vacía.
3. Se ignora un valor vacío o de un solo carácter.
4. Es el mismo componente para el lector y para quien escribe a mano: no hay que distinguirlos.

Interpretación del valor (la regla vive en `escaner/CampoCodigo.tsx`):

| Valor | Acción |
|---|---|
| De 8 a 14 dígitos | Código de barras → búsqueda exacta |
| Cualquier otro texto | Búsqueda por texto con sugerencias |

Detalles a cuidar:

- Si el lector se configuró con otra distribución de teclado, los dígitos pueden salir mal. Señal de alerta: códigos con símbolos (`&`, `"`). Se corrige en el lector, no en el código.
- Una lectura muy rápida (varios códigos seguidos) no debe perderse: las entregas se encolan y se procesan en orden.
- En las pantallas de formulario, el campo de escaneo es independiente del resto de campos; escanear no debe escribir dentro de «Nombre» o «Precio».

## Cámara en vivo 

Se usa la librería **`barcode-detector`**, que implementa la API estándar `BarcodeDetector` y usa ZXing compilado a WebAssembly cuando el navegador no la trae. (Reemplaza a `html5-qrcode`, sin mantenimiento desde 2023.)

```ts
import { BarcodeDetector } from 'barcode-detector/ponyfill'

const detector = new BarcodeDetector({
  formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
})
```

Comprueba la API exacta (nombres de importación, forma de cargar el archivo `.wasm`) en la documentación de la versión instalada antes de escribir código.

### Componente `CamaraEscaner`

1. Pide la cámara con `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })` (cámara trasera).
2. Muestra el video en un `<video>` con `playsInline` y `muted` (necesario en iOS).
3. Cada **150 a 250 ms** llama a `detector.detect(video)`. No se analiza cada fotograma: gasta batería y calienta el celular.
4. Al detectar un código:
   - **Resaltado** : se dibuja el contorno del código sobre el video (con `cornerPoints` o `boundingBox`) y el borde del visor parpadea en verde.
   - **Sonido** : bip corto (ver abajo).
   - Se entrega el valor a `onCodigo`.
   - **Antirrebote:** el mismo código no se vuelve a entregar durante ~2 segundos, para que un producto no se sume diez veces mientras se mantiene frente a la cámara.
5. En la caja y en las pantallas de lectura continua, la cámara **sigue abierta** después de cada lectura. En «Nuevo producto» se cierra tras la primera lectura.
6. Al desmontarse, detiene todas las pistas del `MediaStream` (`track.stop`); si no, la luz de la cámara queda encendida.

### Casos que hay que manejar

| Situación | Qué hace la pantalla |
|---|---|
| Permiso denegado | Explica cómo permitirlo y ofrece usar la foto  |
| Sin HTTPS | Mensaje claro: «La cámara solo funciona en una conexión segura». |
| Sin cámara | Ofrece la foto |
| iOS Safari | Probar a fondo (ver abajo); si falla un formato, la foto es el respaldo |
| Poca luz | Botón de linterna si el dispositivo la soporta (`track.applyConstraints({ advanced: [{ torch: true }] })`) |

**Pruebas obligatorias antes de dar la fase 2 por terminada:** leer los seis formatos de  con Chrome de Android y con Safari de iPhone, con productos reales de la papelería. Si `barcode-detector` falla con algún formato, `html5-qrcode` sigue siendo un respaldo funcional.

## Foto al servidor 

```html
<input type="file" accept="image/*" capture="environment" />
```

Se envía a `POST /api/codigos/decodificar` como `multipart/form-data`. El servidor responde con el código leído o con `NO_ENCONTRADO` si no pudo decodificarlo. Antes de enviar, se reduce la foto a unos 1600 px del lado mayor para que el envío sea rápido.

## Sonido de lectura (`escaner/bip.ts`)

Se genera con la **Web Audio API** (un oscilador de ~880 Hz durante ~80 ms), sin archivos de audio. Para errores («producto no registrado»), un tono más grave y más largo. Los navegadores solo permiten audio después de una interacción del usuario: el `AudioContext` se crea o se reanuda en el primer clic o tecla. Se respeta la preferencia «Sonido de lectura».

## Impresión de la tirilla (D-5)

El backend entrega los datos (`GET /api/ventas/{id}/tirilla`) y el frontend dibuja la tirilla en HTML. Se imprime con el diálogo del navegador y el driver de la impresora térmica; **no se usa ESC/POS** en la versión 1.

### Contenido (RN-12)

1. Razón social, NIT, dirección y teléfono del negocio.
2. Leyenda **«Comprobante de venta — no es factura electrónica»**.
3. Consecutivo, fecha y hora (zona `America/Bogota`), cajero.
4. Líneas: nombre, cantidad × precio unitario y total de línea.
5. Descuento, **IVA discriminado por tarifa**, total.
6. Medios de pago, valor recibido y cambio.
7. Mensaje final configurado por el negocio.

Dinero siempre con `formato.ts` (`$ 12.500`).

### Cómo se imprime

`impresion/imprimir.ts` monta la tirilla dentro de un contenedor `#zona-impresion`, oculto en pantalla y único elemento visible al imprimir:

```css
#zona-impresion { display: none; }

@media print {
  body > *:not(#zona-impresion) { display: none !important; }
  #zona-impresion { display: block; }
  @page { size: 80mm auto; margin: 0; }   /* o 58mm, según la preferencia */
  #zona-impresion { width: 72mm; font: 12px/1.3 monospace; }  /* ~48mm para 58 mm */
}
```

- El ancho (58 u 80 mm) viene de la preferencia del equipo; el `@page` se ajusta al ancho elegido.
- El área imprimible real depende de la impresora; los anchos de arriba son aproximados y se afinan con una impresora real.
- La impresión se lanza desde un clic o una tecla (algunos navegadores bloquean `window.print` sin gesto del usuario).
- Después de `window.print`, se limpia la zona de impresión (evento `afterprint`).
- **Reimprimir:** desde el detalle de la venta, con los mismos datos del servidor.

### Impresión sin diálogo (opcional)

Con Chrome se puede iniciar el navegador de la caja con el parámetro `--kiosk-printing` para que imprima directamente en la impresora predeterminada, sin ventana de confirmación. Configúralo en el acceso directo del computador de la caja y verifica el comportamiento con la versión de Chrome instalada.

## Etiquetas de código de barras 

- El backend genera la imagen de cada etiqueta (`GET /api/productos/{id}/etiqueta`): código de barras con ZXing, nombre y precio. El frontend no dibuja códigos de barras.
- `HojaEtiquetas` coloca las imágenes en una cuadrícula con `@page` del tamaño del papel de etiquetas (configurable) y repite según `copias`.
- Se puede imprimir una etiqueta suelta al crear un producto con código interno, o varias desde `/productos/etiquetas`.
- Prueba obligatoria: **escanear con el lector una etiqueta impresa** y comprobar que encuentra el producto.

## Cajón monedero

Opcional. Si está conectado a la impresora térmica, normalmente se abre con la propia impresora al imprimir; depende de la configuración del driver. No hay código en el frontend para esto en la versión 1.
