const formatoDinero = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

const formatoFechaHora = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  dateStyle: "short",
  timeStyle: "short",
})

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  dateStyle: "long",
})

export function formatearDinero(valor: number): string {
  return formatoDinero.format(valor)
}

export function formatearFechaHora(valor: string | number | Date): string {
  return formatoFechaHora.format(new Date(valor))
}

export function formatearFecha(valor: string | number | Date): string {
  return formatoFecha.format(new Date(valor))
}