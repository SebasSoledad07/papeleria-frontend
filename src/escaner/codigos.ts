// Un valor de 8 a 14 dígitos se trata como código de barras; cualquier otro
// texto, como búsqueda por nombre (RF-09, RF-12, RN-14).
export function esCodigoDeBarras(valor: string): boolean {
  return /^\d{8,14}$/.test(valor)
}
