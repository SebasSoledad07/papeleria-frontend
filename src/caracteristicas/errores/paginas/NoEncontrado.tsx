export function NoEncontrado() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <p className="font-heading text-4xl font-semibold text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 font-heading text-lg font-medium">
          Página no encontrada
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          La dirección que buscas no existe o fue movida.
        </p>
      </div>
    </div>
  )
}