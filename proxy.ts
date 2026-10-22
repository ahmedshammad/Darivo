import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { contentSecurityPolicy } from './src/server/csp';
const internationalize = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV === 'production');
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const response = internationalize(new NextRequest(request, { headers }));
  response.headers.set('Content-Security-Policy', csp);
  return response;
}
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
