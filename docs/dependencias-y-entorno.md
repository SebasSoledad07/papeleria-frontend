# Dependencias y entorno

## Software para desarrollar

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | **22.12 o superior** (LTS) | Vite 8 pide Node 20.19+ o 22.12+; Node 20 ya terminó su soporte, por eso se recomienda 22 |
| npm | El que trae Node | Gestor de paquetes (se puede usar pnpm si prefieres) |
| Git | Reciente | Control de versiones |
| Chrome o Edge | Actual | Pruebas y herramientas de desarrollo |
| OpenCode | Reciente | Asistente de desarrollo (lee `AGENTS.md`) |
| Backend en marcha | Perfil `dev` | Para `npm run dev` y para regenerar los tipos |

## Crear el proyecto

```bash
npm create vite@latest papeleria-frontend -- --template react-ts
cd papeleria-frontend
npm install
```

Después se instalan las dependencias de abajo. **No se fijan versiones en este documento** (salvo lo indicado): `package-lock.json` guarda las que se instalen. Antes de escribir código con una librería, consulta la documentación de la versión instalada.

## Dependencias de ejecución

| Paquete | Para qué | Fase |
|---|---|---|
| `react`, `react-dom` | Interfaz (React 19) | 0 |
| `react-router` | Rutas | 0 |
| `@tanstack/react-query` | Datos del servidor (v5) | 0 |
| `openapi-fetch` | Cliente tipado de la API | 0 |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Formularios y validación | 1 |
| `tailwindcss`, `@tailwindcss/vite` | Estilos (v4; se configura en CSS con `@theme`) | 0 |
| `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react` | Utilidades que usa shadcn/ui | 0 |
| `barcode-detector` | Lectura de códigos con la cámara  | 2 |
| `@tanstack/react-table` | Tabla genérica de reportes y listados | 2 |
| `recharts` | Gráficas del panel y reportes | 5 |

**shadcn/ui** no es un paquete: se agrega con su CLI (`npx shadcn@latest init`, y luego `add button`, `dialog`, etc.). Copia los componentes a `src/componentes/ui/`, basados en Radix.

## Dependencias de desarrollo

| Paquete | Para qué |
|---|---|
| `typescript` (modo `strict`) | Tipos |
| `openapi-typescript` | Genera `src/api/esquema.d.ts` desde OpenAPI |
| `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` | Pruebas de lógica y componentes |
| `msw` | Simula el backend en las pruebas |
| `@playwright/test` | Prueba de punta a punta de la caja (fase 4) |
| `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks` | Calidad de código |
| `prettier`, `prettier-plugin-tailwindcss` | Formato |

## Lo que NO se instala (a propósito)

| Librería | Por qué no |
|---|---|
| Redux, Zustand | El estado del servidor lo maneja TanStack Query; el carrito es un reducer |
| Axios | `openapi-fetch` cubre lo necesario con tipos |
| `moment`, `date-fns`, `dayjs` | `Intl.DateTimeFormat` con `America/Bogota` es suficiente |
| Librerías de dinero (`currency.js`, `dinero.js`) | Los precios son enteros; `Intl.NumberFormat` los formatea |
| `html5-qrcode` | Sin mantenimiento desde 2023; solo como respaldo si falla `barcode-detector` |
| Librerías de PDF o Excel | Los archivos los genera el backend |
| Librerías de códigos de barras en JS | Las etiquetas las genera el backend (ZXing) |

## Scripts de `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . && tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "api:tipos": "openapi-typescript http://localhost:8080/v3/api-docs -o src/api/esquema.d.ts"
  }
}
```

`npm run api:tipos` requiere el backend corriendo con el perfil `dev` (en producción `/v3/api-docs` está apagado).

## Variables de entorno

| Variable | Desarrollo | Producción |
|---|---|---|
| `VITE_API_URL` | vacía (proxy de Vite) | `https://api.tupapeleria.com` |

Solo las variables con prefijo `VITE_` llegan al navegador, y **son públicas**: no se pone ningún secreto en ellas. Ver `.env.example`.

## HTTPS para probar la cámara en desarrollo

La cámara exige HTTPS, pero `localhost` cuenta como seguro. Para probar desde el celular en la red local:

- Opción más simple: publicar el servidor de desarrollo con un túnel (Cloudflare Tunnel, ngrok), que da una dirección `https://`.
- O usar el despliegue de pruebas del frontend (el hosting ya trae HTTPS).

## Navegadores objetivo (RNF-02)

Chrome, Edge, Safari y Firefox actuales, en computador y celular. Vite 8 apunta por defecto a navegadores de uso general de los últimos años; no se da soporte a Internet Explorer ni a versiones antiguas.

## Despliegue

Build estático (`npm run build` → `dist/`) en Cloudflare Pages, Netlify, Vercel o Firebase Hosting. Detalles en [`../../docs/05-despliegue.md`](../../docs/05-despliegue.md).
