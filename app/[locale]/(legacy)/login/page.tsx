import { Login } from '@/src/components/login';
import { safeLoginReturn } from '@/src/lib/login-return';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const requested = (await searchParams).returnTo;
  const returnTo = safeLoginReturn(requested);
  return (
    <Login
      returnTo={returnTo}
      demo={process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production'}
    />
  );
}
