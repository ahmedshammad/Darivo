'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { money } from '@/src/lib/catalog';
import { usePreferences } from './preferences';
import type { PropertyDTO } from '@/src/server/db/properties';
export function InvestmentCalculator({ property }: { property: PropertyDTO }) {
  const t = useTranslations(),
    locale = useLocale(),
    pref = usePreferences();
  const [result, setResult] = useState<{ grossYield: number; annualCashFlow: number } | null>(null),
    [error, setError] = useState(false);
  return (
    <form
      className="stack calculator"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        try {
          const r = await fetch('/api/v1/investment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              property_id: property.id,
              assumptions: {
                annual_rent: Number(data.get('rent')),
                vacancy_percent: Number(data.get('vacancy')),
                other_costs: Number(data.get('costs')),
              },
            }),
          });
          if (!r.ok) throw new Error();
          setResult((await r.json()).data);
        } catch {
          setError(true);
        }
      }}
    >
      <label>
        {t('annualRent')} (AED)
        <input
          name="rent"
          type="number"
          min="0"
          max="1000000000"
          defaultValue={Math.round(property.priceAed * 0.05)}
          required
        />
      </label>
      <div className="form-grid">
        <label>
          {t('vacancy')}
          <input name="vacancy" type="number" min="0" max="100" defaultValue={5} />
        </label>
        <label>
          {t('otherCosts')} (AED)
          <input name="costs" type="number" min="0" max="100000000" defaultValue={0} />
        </label>
      </div>
      <button className="button button-outline">{t('calculate')}</button>
      {result && (
        <div role="status" className="stack small">
          <p>
            {t('grossYield')}: {result.grossYield.toFixed(2)}%
          </p>
          <p>
            {t('annualCashFlow')}:{' '}
            {money(result.annualCashFlow, 'AED', locale, pref.arabicIndicDigits)}
          </p>
          <p className="muted">{t('estimate')}</p>
        </div>
      )}
      {error && <p className="small error">{t('accessBody')}</p>}
    </form>
  );
}
