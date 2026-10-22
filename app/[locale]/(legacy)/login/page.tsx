import { Login } from '@/src/components/login';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const requested = (await searchParams).returnTo;
  // Only explicit local conversation routes are accepted; never an arbitrary redirect.
  let returnTo: string | undefined;
  if (typeof requested === 'string' && requested.length <= 6000) {
    try {
      const target = new URL(requested, 'https://darivo.invalid');
      if (
        target.origin === 'https://darivo.invalid' &&
        /^\/(en|ar)\/(consultant|concierge)$/.test(target.pathname)
      )
        returnTo = target.pathname + target.search;
    } catch {
      // Malformed destinations use the normal signed-in landing page.
    }
  }
  return (
    <Login
      returnTo={returnTo}
      demo={process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production'}
    />
  );
}
