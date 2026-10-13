import { CameraIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ProblemaApi } from "@/api/errores"
import type { EntradaProducto, Producto } from "@/api/tipos"
import { useCategorias } from "@/caracteristicas/categorias"
import { AvisoError } from "@/componentes/comunes/AvisoError"
import { PaginaTitulo } from "@/componentes/comunes/PaginaTitulo"
import { Button } from "@/componentes/ui/button"
import { CamaraEscaner, CampoCodigo, FotoEscaner } from "@/escaner"
import { ProductoDialogo } from "../componentes/ProductoDialogo"
import { useProductoPorCodigo } from "../hooks/useProductoPorCodigo"
import { useSugerencia } from "../hooks/useSugerencia"

function esNoEncontrado(error: unknown): boolean {
  return error instanceof ProblemaApi && error.estado === 404
}

// Compara nombres ignorando acentos y mayúsculas, para prefill de categoría
// desde la sugerencia del catálogo externo (RN-16).
function mismoNombre(a: string, b: string): boolean {
  const limpiar = (texto: string) =>
    texto.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()
  return limpiar(a) === limpiar(b)
}

interface Dialogo {
  producto?: Producto
  porDefecto?: Partial<EntradaProducto>
  aviso?: string
}

export function NuevoProducto() {
  const [codigo, setCodigo] = useState<string | null>(null)
  const [cameraActiva, setCameraActiva] = useState(false)
  // Código cuyo diálogo ya se cerró: no se vuelve a abrir hasta un nuevo
  // escaneo. Todo es derivado de las queries, sin efectos (react-hooks v6).
  const [descartado, setDescartado] = useState<string | null>(null)

  const categorias = useCategorias()
  const busqueda = useProductoPorCodigo(codigo)
  const noRegistrado =
    busqueda.isError && esNoEncontrado(busqueda.error) && codigo !== null
  const sugerencia = useSugerencia(codigo, noRegistrado)

  const encontrado = busqueda.isSuccess ? busqueda.data : undefined
  const sugerido = sugerencia.isSuccess ? sugerencia.data : undefined

  const dialogo = useMemo<Dialogo | null>(() => {
    if (codigo === null || codigo === descartado) return null
    if (encontrado) {
      // El código ya está registrado (esté activo o no, RN-13): se abre la
      // edición y así se puede reactivar un producto inactivo (RN-17).
      return {
        producto: encontrado,
        aviso: encontrado.activo
          ? "Este código ya está registrado. Puedes editarlo aquí."
          : "Este código ya está registrado y el producto está inactivo. Edítalo o reactívalo.",
      }
    }
    if (sugerido) {
      // Código nuevo: sugerencia del catálogo externo (RF-02, RN-16).
      const categoriaNombre = sugerido.categoria
      const categoria = categoriaNombre
        ? categorias.data?.find((c) => mismoNombre(c.nombre, categoriaNombre))
        : undefined
      return {
        porDefecto: {
          codigoBarras: codigo,
          nombre: sugerido.nombre ?? undefined,
          marca: sugerido.marca ?? undefined,
          categoriaId: categoria?.id,
        },
        aviso:
          "Datos sugeridos del catálogo externo: revísalos y completa el precio (RN-16).",
      }
    }
    return null
  }, [codigo, descartado, encontrado, sugerido, categorias.data])

  function manejarCodigo(leido: string) {
    setDescartado(null)
    setCodigo(leido)
    setCameraActiva(false)
  }

  function cerrar() {
    setDescartado(codigo)
  }

  const consultando =
    codigo !== null &&
    dialogo === null &&
    (busqueda.isFetching ||
      (noRegistrado && sugerencia.isFetching) ||
      busqueda.isPending ||
      (noRegistrado && sugerencia.isPending))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Volver a productos
      </Link>

      <PaginaTitulo
        titulo="Nuevo producto"
        descripcion="Escanea el código de barras para autocompletar los datos. Si no está registrado, se consulta el catálogo externo."
      />

      <div className="space-y-3">
        <CampoCodigo
          marcador="Escanea o escribe el código de barras…"
          onCodigo={manejarCodigo}
        />
        <div className="flex flex-wrap gap-3">
          {cameraActiva ? (
            <div className="w-full max-w-md">
              <CamaraEscaner
                onCodigo={manejarCodigo}
                cerrarTrasLectura
                alCerrar={() => setCameraActiva(false)}
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCameraActiva(true)}
            >
              <CameraIcon className="size-4" aria-hidden />
              Leer con la cámara
            </Button>
          )}
          <FotoEscaner onCodigo={manejarCodigo} />
        </div>
        {consultando ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Consultando el código…
          </p>
        ) : null}
        {busqueda.isError && !noRegistrado ? (
          <AvisoError error={busqueda.error} />
        ) : null}
        {noRegistrado && sugerencia.isError ? (
          <AvisoError error={sugerencia.error} />
        ) : null}
      </div>

      {dialogo ? (
        <ProductoDialogo {...dialogo} onCerrar={cerrar} />
      ) : null}
    </div>
  )
}