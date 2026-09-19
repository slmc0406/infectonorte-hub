export function runtimeEnv() {
  return {
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    INSTITUTION_SESSION_SECRET: process.env.INSTITUTION_SESSION_SECRET,
    BACKUP_ENCRYPTION_SECRET: process.env.BACKUP_ENCRYPTION_SECRET,
  };
}

// Render (y otros PaaS) reciben la petición en un host interno; `request.url` puede
// resolver a `http://localhost:<PORT>` en vez del dominio público. Usamos los headers
// que el proxy sí reenvía correctamente para construir URLs absolutas de redirección.
export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

export function absoluteUrl(path: string, request: Request): URL {
  return new URL(path, requestOrigin(request));
}
