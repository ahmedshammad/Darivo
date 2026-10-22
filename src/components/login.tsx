'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from './ui/button';
export function Login({ demo }: { demo: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
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
              callbackUrl: `/${locale}/search`,
            });
            setSent(true);
            setBusy(false);
          }}
        >
          <label>
            {t('email')}
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <Button disabled={busy}>{t('magicLink')}</Button>
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
                  onClick={() =>
                    signIn('credentials', {
                      email: `${email}@darivo.example`,
                      callbackUrl: `/${locale}/search`,
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
