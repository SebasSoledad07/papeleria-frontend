# Papelería — Inventario y Ventas (Frontend)

SPA de caja, inventario y reportes para una papelería en Colombia. Moneda en pesos colombianos (COP) enteros, interfaz en español de Colombia.

El backend (API REST) es el proyecto hermano `../inventario-papeleria` (Spring Boot 4 + PostgreSQL).

## Stack

React 19 · TypeScript ~6.0 · Vite 8 · Tailwind v4 + shadcn (Base UI) · React Router 7 · TanStack Query 5 · React Hook Form + Zod · barcode-detector · recharts · vitest 5 + Testing Library + MSW.

## Arranque

```bash
npm install
npm run dev      # http://localhost:5173 (proxy /api → :8080)
npm run build    # tsc -b + vite build → dist/
npm run lint
npm test
npx tsc -b
```

Requiere Node ≥ 22.12. El backend debe estar corriendo en `:8080` (ver su `AGENTS.md`).

## Funcionalidades

- Autenticación por sesión (cookie), menú y permisos por rol.
- Usuarios, categorías, proveedores y configuración (solo administrador).
- Productos: listado/búsqueda, alta con escaneo y sugerencia de catálogo, edición, precios, activación/inactivación.
- Escáner: lector USB/Bluetooth y cámara; bip y formatos EAN/UPC/Code 128/39.
- Inventario: compras, ajustes con motivo, conteo físico con diferencias, kárdex.
- Caja: apertura/cierre, carrito por escaneo, descuentos, pagos mixtos, cambio, tirilla.
- Ventas: consulta, detalle, reimprimir tirilla, anulación.
- Reportes: stock, ventas, utilidad, valor de inventario, exportación Excel/PDF.
- Panel con indicadores del día y alertas de stock.
- Preferencias por equipo (ancho de tirilla, sonido, cámara).

## Roles

- **Administrador:** todo, incluidos usuarios, configuración, costos y utilidad.
- **Bodeguero:** productos, inventario, etiquetas y reportes de stock.
- **Cajero:** caja, ventas y consulta de productos.

## Despliegue

Artefactos en `deploy/` (Dockerfile + nginx.conf). Configurar `VITE_API_URL` en producción.

La landing pública es un archivo independiente, `public/landing.html`, que se publica como `/landing.html` (no usa el router de React).