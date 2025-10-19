export function resolveBackendUrl(baseRaw: string, pathRaw: string) {
  const base = new URL(baseRaw)
  const basePath = base.pathname.replace(/\/$/, '')

  let path = pathRaw?.trim() || ''
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const hasBasePath = Boolean(basePath && basePath !== '/')
  const combinedPath =
    hasBasePath && !path.startsWith(basePath) ? `${basePath}${path}` : path

  const url = new URL(base.origin)
  url.pathname = combinedPath.replace(/\/\/+/g, '/')
  return url.toString()
}
