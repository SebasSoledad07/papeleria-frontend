// Un valor de 8 a 14 dígitos se trata como código de barras; cualquier otro
// texto, como búsqueda por nombre (RF-09, RF-12, RN-14).
export function esCodigoDeBarras(valor: string): boolean {
  return /^\d{8,14}$/.test(valor)
}

// Genera un código interno EAN-13 con prefijo '2' para el botón
// «Generar código interno» del formulario de producto (RF-03, RN-15).
// Espeja GeneradorCodigoInterno del backend: es una sugerencia en pantalla;
// si el campo queda vacío al guardar, el backend genera el código definitivo.
export function generarCodigoInterno(): string {
  const base = ("2" + String(Date.now()).replace(/\D/g, "")).slice(0, 12).padEnd(12, "0")
  return base + String(digitoControlEan13(base))
}

function digitoControlEan13(primeros12: string): number {
  let suma = 0
  for (let i = 0; i < 12; i++) {
    const digito = Number(primeros12[i])
    suma += i % 2 === 0 ? digito : digito * 3
  }
  return (10 - (suma % 10)) % 10
}
