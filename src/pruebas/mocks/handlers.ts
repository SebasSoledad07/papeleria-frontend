import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("/api/auth/sesion", () =>
    HttpResponse.json({ nombre: "Administrador", rol: "ADMIN" }),
  ),
  http.post("/api/auth/logout", () => new HttpResponse(null, { status: 204 })),
]
