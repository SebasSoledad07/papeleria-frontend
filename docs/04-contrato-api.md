# Contrato de la API

> **PROPUESTA para revisar** — escrita a partir de los controllers actuales de `../inventario-papeleria` (`src/main/java/com/soledad/inventariopapeleria/**/api/`). No inventa nada que no esté en el código. Los puntos que necesitan decisión están en la sección 1; hasta que se confirmen, no se implementan pantallas que los toquen.

**Referencia frontend:** cómo consumir esto, `docs/integracion-api.md`. Formato de dinero: enteros COP. Errores y reglas de negocio en español de Colombia (RNF-03).

## 1. Decisiones abiertas (confirmar con el backend)

| # | Tema | Hoy en el código | Pregunta |
|---|---|---|---|
| D-C1 | Cuerpo de error | `ErrorRespuesta{timestamp, mensaje, ruta}` — **sin `codigo`** | El frontend (`api/errores.ts`) quiere decidir la lógica por `codigo` (`STOCK_INSUFICIENTE`, …). ¿Añadimos `codigo` al cuerpo de error? (recomendado) |
| D-C2 | CSRF | `SecurityConfig` lo tiene **deshabilitado** | ¿Se habilita en v1? Si no, el frontend no pide ni envía `X-XSRF-TOKEN`. Recomendado: mantenerlo deshabilitado (cookie de sesión SameSite + proxy en dev) |
| D-C3 | Sesión | `GET /api/auth/sesion` devuelve `SesionDto` (o 401 sin cuerpo) | ¿Conservamos `sesion` o migramos a `/api/auth/me`? Recomendado: conservar `sesion` (ya implementado) |
| D-C4 | Permisos de producto/inventario | `/api/producto/**` y `/api/inventario/**` solo exigen **autenticación** (cualquier rol) | ¿Definir reglas por rol? Ej: cambiar precio solo ADMIN; ajustes de inventario solo ADMIN/BODEGUERO. Si el frontend oculta botones por rol y el backend no los protege, hay que resolverlo |
| D-C5 | Paths en singular/plural | Todo en **singular**: `/api/producto`, `/api/categoria`, … | ¿Confirmamos singular como estándar del contrato? Los ejemplos de `integracion-api.md` usan plural |
| D-C6 | Validaciones sin mensaje propio | `ProductoRequest` usa mensajes por defecto de Bean Validation (**en inglés**), p. ej. `Unidad.valueOf(...)` inválida → **500** | ¿Ajustar mensajes a español (RN-03) y devolver 400 en validaciones de producto/unidad/precio? |
| D-C7 | Ubicación de este archivo | — | ¿Queda en `docs/` del frontend o se mueve a `../inventario-papeleria/docs/`? |

## 2. Autenticación y sesión

- **Cookie de sesión HTTP (`JSESSIONID`)**; `HttpSessionSecurityContextRepository` + `SessionCreationPolicy.IF_REQUIRED`. Todas las llamadas con `credentials: 'include'`.
- **CSRF deshabilitado hoy** (D-C2): el frontend no envía token mientras siga así.
- **`401` sin cuerpo JSON** (usa `HttpStatusEntryPoint`): se detecta por el código HTTP.

## 3. Errores

Cuerpo uniforme de error (`ErrorRespuesta`), **sin `codigo` por ahora (D-C1)**:

```json
{ "timestamp": "2026-10-08T12:00:00Z", "mensaje": "Ya existe un producto con el codigo de barras '7701234567890'.", "ruta": "/api/producto" }
```

| HTTP | Origen | `mensaje` (ejemplos reales) |
|---|---|---|
| 400 | `ErrorNegocio` | «Usuario o contrasena incorrectos.» · «Ya existe un producto con el codigo de barras '...'.» · «La cantidad debe ser mayor a cero.» · «El motivo es obligatorio para el ajuste de inventario.» · «Stock insuficiente para el producto 'X'. Disponible: N, solicitado: N.» · «Ya existe una categoria con el nombre '...'.» · «Ya existe un proveedor con la razon social '...'.» / «... el NIT '...'.» · «El rol '...' no es valido.» |
| 400 | Validación Bean | `mensaje` = texto concatenado `campo: mensaje; campo: ...` (español en usuario/categoria/proveedor; **inglés por defecto en producto**, D-C6) |
| 403 | `AccessDeniedException` | «No tiene permiso para realizar esta accion.» (mismo cuerpo; también vía `denegado` en `SecurityConfig`) |
| 404 | `RecursoNoEncontrado` | «No existe el producto con id 3.» · «No existe un producto con el codigo '...'.» · «No existe la categoria con id 1.» · «No existe el usuario con id 2.» |
| 500 | Error no controlado | «Ocurrio un error inesperado. Intente de nuevo.» |

## 4. Endpoints (implementados hoy)

### 4.1 Auth — `/api/auth`

| Método y ruta | Cuerpo/Salida | Notas |
|---|---|---|
| `POST /api/auth/login` | `{ "usuario": "admin", "clave": "..." }` → `200 { "nombre": "Administrador", "rol": "ADMIN" }` | `nombre` = nombre a mostrar; `rol` ∈ `ADMIN`\|`CAJERO`\|`BODEGUERO`. Credenciales malas → `400` |
| `POST /api/auth/logout` | → `204` | cierra sesión y revierte la sesión HTTP |
| `GET /api/auth/sesion` | → `200 SesionDto` si hay sesión; `401` sin cuerpo si no | equivale al «usuario actual» |

### 4.2 Usuario — `/api/usuario` — **solo ADMIN**

`UsuarioDto`: `{ id, usuario, nombre, rol, activo }`.

| Método y ruta | Cuerpo | Salida |
|---|---|---|
| `GET /api/usuario` | — | `UsuarioDto[]` (ordenados por nombre) |
| `POST /api/usuario` | `CrearUsuarioRequest{ usuario(≤60, oblig), nombre(≤120, oblig), clave(8–100, oblig), rol(oblig) }` | `UsuarioDto` |
| `PUT /api/usuario/{id}` | `ActualizarUsuarioRequest{ nombre?, rol?, activo? }` (todos opcionales) | `UsuarioDto` |
| `DELETE /api/usuario/{id}` | — | inactiva (`activo=false`), `200` sin cuerpo |
| `PUT /api/usuario/{id}/clave` | `CambiarClaveRequest{ clave(8–100, oblig) }` | `200` sin cuerpo |

Adm. inicial (D-4): se crea al arrancar si la tabla está vacía, desde `ADMIN_INICIAL_USUARIO`/`ADMIN_INICIAL_CLAVE` (ver `../inventario-papeleria/.env.example`).

### 4.3 Configuración — `/api/configuracion` — **solo ADMIN**

`ConfiguracionDto`: `{ clave, valor, descripcion }`.

| Método y ruta | Cuerpo | Salida |
|---|---|---|
| `GET /api/configuracion` | — | `ConfiguracionDto[]` |
| `PUT /api/configuracion` | `Map<String,String>` (clave → valor) | `ConfiguracionDto[]` actualizado |

### 4.4 Categoría — `/api/categoria`

`CategoriaDto`: `{ id, nombre, activo }`. `GET /api/categoria?soloActivas=false|true`.

| Método y ruta | Cuerpo | Acceso |
|---|---|---|
| `GET /api/categoria` | — | autenticado |
| `POST /api/categoria` | `{ nombre(≤100, oblig) }` | **ADMIN** |
| `PUT /api/categoria/{id}` | `{ nombre(≤100, oblig) }` | **ADMIN** |
| `DELETE /api/categoria/{id}` | — (inactiva, `200` sin cuerpo) | **ADMIN** |

### 4.5 Proveedor — `/api/proveedor`

`ProveedorDto`: `{ id, razonSocial, nit, telefono, direccion, activo }`. `GET /api/proveedor?soloActivas=false|true`.

| Método y ruta | Cuerpo | Acceso |
|---|---|---|
| `GET /api/proveedor` | — | autenticado |
| `POST /api/proveedor` | `{ razonSocial(≤150, oblig), nit(≤20, oblig), telefono?(≤30), direccion?(≤150) }` | **ADMIN** |
| `PUT /api/proveedor/{id}` | mismo cuerpo | **ADMIN** |
| `DELETE /api/proveedor/{id}` | — (inactiva, `200` sin cuerpo) | **ADMIN** |

### 4.6 Producto — `/api/producto`

`ProductoRequest` (crear): `{ codigoBarras?, nombre(oblig, ≤150), marca?(≤100), categoriaId(oblig), proveedorId?, unidad(oblig), tarifaIva(oblig), precioVenta(oblig, >0), costo(oblig ≥0), stockInicial?(int), stockMinimo?(int) }`.

- `unidad` ∈ `UNIDAD|PAQUETE|RESMA|CAJA|PLIEGO|METRO|SERVICIO` (RN-18). **Invalid → 500 hoy (D-C6)**.
- `tarifaIva` acepta `19|5|0|EXCLUIDO` (o los nombres `IVA_19`…). Desconocido ⇒ `EXCLUIDO`.
- `codigoBarras` vacío ⇒ el backend genera código interno EAN-13 (RN-15). Se normaliza (RN-14).

`ProductoDto`: `{ id, codigoBarras, nombre, marca, categoriaId, categoriaNombre, proveedorId, proveedorNombre, unidad, tarifaIva, precioVenta, costo, stock, stockMinimo, activo }`. **`tarifaIva` sale como `"19"`, `"5"`, `"0"`, `"EXCLUIDO"`.** Todos los campos con dinero son enteros COP.

| Método y ruta | Cuerpo | Salida | Notas |
|---|---|---|---|
| `GET /api/producto` | — | `ProductoDto[]` | solo activos, ordenados por nombre |
| `GET /api/producto?` | `GET /api/producto/codigo/{codigo}` | `ProductoDto` | por código normalizado; `404` si no existe |
| `GET /api/producto/buscar?q={texto}` | — | `ProductoDto[]` | búsqueda por nombre parecido (unaccent + pg_trgm); «lapiz» encuentra «Lápiz» |

  > (las dos GET anteriores no llevan cuerpo, van en la URL)

| `POST /api/producto` | `ProductoRequest` | `ProductoDto` | `200` |
| `PUT /api/producto/{id}/precio` | `{ "precioVenta": 4500 }` | `ProductoDto` | registra historial de precios si cambia. `precioVenta` faltante/e inválido → **500 hoy (D-C6)** |

### 4.7 Inventario — `/api/inventario`

| Método y ruta | Cuerpo | Salida | Notas |
|---|---|---|---|
| `POST /api/inventario/{id}/ajuste-positivo` | `{ "cantidad": int, "motivo": "..." }` | `200` sin cuerpo | motivo obligatorio → `400`; cantidad ≤ 0 → `400` |
| `POST /api/inventario/{id}/ajuste-negativo` | igual | `200` sin cuerpo | además: stock insuficiente → `400` «Stock insuficiente para el ajuste. Disponible: N.» |

Cada ajuste genera movimiento de kárdex (RN-21, RN-20). `cantidad` no-entero → `500` hoy (D-C6).

### 4.8 Catálogo externo — `/api/catalogo` (RN-16)

| Método y ruta | Salida |
|---|---|
| `GET /api/catalogo/codigo/{codigo}` | `SugerenciaProducto{ codigo, nombre?, marca?, categoria? }` — sin datos externos devuelve `{ codigo, null, null, null }` (el frontend completa a mano) |

El código se normaliza en el backend; se envía tal como se leyó. Fallo del proveedor externo = fallo **suave** (RN-16).

## 5. Roles y permisos (reglas actuales de `SecurityConfig`)

| Recurso | Acceso |
|---|---|
| `/`, `/index.html`, `/login.html`, `/favicon.ico`, `/error`, `/css&#47;**`, `/js&#47;**`, `/sonidos&#47;**`, `/images&#47;**`, `/api/auth/login`, `/api/auth/logout` | público |
| `/api/usuario/**`, `/api/configuracion/**`, `/api/auditoria/**` | **solo ADMIN** |
| POST/PUT/DELETE `/api/categoria/**` y `/api/proveedor/**` | **solo ADMIN** |
| GET `/api/categoria/**`, GET `/api/proveedor/**`, `/api/producto/**`, `/api/inventario/**`, `/api/catalogo/**`, `/api/auth/sesion` | cualquier rol **autenticado** (D-C4) |

## 6. Pendientes (fases 3–5 del plan; no implementados aún)

No existen controllers para: ventas y caja (`cajas`, `ventas`, `ventas/calcular`, `autorizaciones`, `clientes`, tirilla, anulación), compras y kárdex (GET), conteo físico, historial de precios (GET), `auditoria` (hay regla en `SecurityConfig` pero no controller), reportes y panel. **No diseñar el frontend contra RUTAS inventadas**: cuando el backend las construya se agregan a este contrato. El documento `docs/integracion-api.md` describe cómo se espera que se comporten (p. ej. `POST /api/ventas/calcular` con `Idempotency-Key`), pero eso aún no es contrato.

## 7. Notas de implementación para `api/cliente.ts`

1. Base URL: en dev vacía (proxy `/api` → `:8080`); en producción `VITE_API_URL` si cambia de origen.
2. `credentials: 'include'` en todas las llamadas.
3. Sesión vigente se consulta con `GET /api/auth/sesion` (D-C3).
4. `401` (sin cuerpo) ⇒ cerrar estado de sesión y volver a `/login`.
5. `403` ⇒ mostrar «No tienes permiso» sin tratarlo como falla.
6. Traducción de errores: mientras no exista `codigo` (D-C1), los mensajes se toman de `mensaje` (el backend ya los da en español).