/** A continuation opens a screen; it never authorizes an action after sign-in. */
export function safeLoginReturn(requested: unknown): string | undefined {
  if (
    typeof requested !== 'string' ||
    requested.length > 6000 ||
    !requested.startsWith('/') ||
    requested.startsWith('//') ||
    /[\\\u0000-\u001f\u007f]/.test(requested)
  )
    return undefined;
  try {
    const target = new URL(requested, 'https://darivo.invalid');
    if (target.origin !== 'https://darivo.invalid') return undefined;
    const allowed =
      /^\/(en|ar)\/(consultant|concierge|office)$/.test(target.pathname) ||
      /^\/(en|ar)\/office\/(compare|viewings|advisor|private)$/.test(target.pathname) ||
      /^\/(en|ar)\/office\/portfolios\/[a-zA-Z0-9_-]{1,128}$/.test(target.pathname) ||
      /^\/(en|ar)\/p\/(project|unit)-[a-zA-Z0-9-]{1,180}$/.test(target.pathname);
    return allowed ? target.pathname + target.search + target.hash : undefined;
  } catch {
    return undefined;
  }
}
