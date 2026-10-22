'use client';
import { useLocale, useTranslations } from 'next-intl';
import { formatAmount } from '@/src/lib/format';
import { money } from '@/src/lib/catalog';
import { usePreferences } from './preferences';

export function Price({
  property,
  className,
}: {
  property: { priceMinor: string; currency: string; priceAed: number };
  className?: string;
}) {
  const locale = useLocale(),
    t = useTranslations(),
    pref = usePreferences();
  return (
    <div className={className}>
      <bdi>
        {formatAmount(
          Number(property.priceMinor) / 100,
          property.currency,
          locale,
          pref.arabicIndicDigits,
        )}
      </bdi>
      <span className="small muted" style={{ display: 'block', fontWeight: 400 }}>
        {t('sourcePrice')}
        {property.currency !== pref.currency && (
          <>
            {' '}
            · {t('indicativeConversion')}:{' '}
            <bdi>{money(property.priceAed, pref.currency, locale, pref.arabicIndicDigits)}</bdi>
          </>
        )}
      </span>
    </div>
  );
}
