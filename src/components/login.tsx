'use client';
import { useState, useSyncExternalStore } from 'react';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from './ui/button';
const subscribe = () => () => {};
export function Login({ demo, returnTo }: { demo: boolean; returnTo?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="shell page">
      <div className="login panel stack">
        <p className="eyebrow">{t('signIn')}</p>
        <h1>{t('loginTitle')}</h1>
        <p className="muted">{t('loginIntro')}</p>
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const data = new FormData(e.currentTarget);
            await signIn('nodemailer', {
              email: data.get('email'),
              redirect: false,
              callbackUrl: returnTo || `/${locale}/search`,
            });
            setSent(true);
            setBusy(false);
          }}
        >
          <label>
            {t('email')}
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <Button disabled={busy || !hydrated}>{t('magicLink')}</Button>
          {sent && <p role="status">{t('emailSent')}</p>}
        </form>
        {demo && (
          <>
            <div className="divider" />
            <p className="eyebrow">{t('demo')}</p>
            <div className="demo-grid">
              {[
                ['client', 'client'],
                ['verified', 'verified'],
                ['partner', 'partnerRole'],
                ['advisor', 'advisorRole'],
                ['admin', 'adminRole'],
              ].map(([email, key]) => (
                <Button
                  variant="outline"
                  key={email}
                  disabled={!hydrated}
                  onClick={() =>
                    signIn('credentials', {
                      email: `${email}@darivo.example`,
                      callbackUrl: returnTo || `/${locale}/search`,
                    })
                  }
                >
                  {t(key)}
                </Button>
              ))}
            </div>
            <p className="small muted">{t('demoNote')}</p>
          </>
        )}
      </div>
    </div>
  );
}
