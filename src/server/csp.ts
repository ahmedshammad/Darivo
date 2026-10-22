export function contentSecurityPolicy(nonce: string, production: boolean) {
  const mapHosts = 'https://tiles.openfreemap.org https://tiles.mapterhorn.com';
  return `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${production ? '' : " 'unsafe-eval'"}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${mapHosts}; font-src 'self'; connect-src 'self' ${mapHosts}${production ? '' : ' ws: wss:'}; worker-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;
}
