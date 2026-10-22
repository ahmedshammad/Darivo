'use client';
import { useId, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { FX, FX_DATE } from '@/src/lib/catalog';
import { usePreferences } from './preferences';

const subscribe = () => () => {};

export function DisplayPreferences() {
  const t = useTranslations();
  const p = usePreferences();
  const id = useId();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <div className="stack small">
      <div className="row">
        <label className="sr-only" htmlFor={`${id}-currency`}>
          {t('currency')}
        </label>
        <select
          id={`${id}-currency`}
          disabled={!hydrated}
          value={p.currency}
          onChange={(e) => p.setCurrency(e.target.value)}
        >
          {Object.keys(FX).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${id}-unit`}>
          {t('areaUnit')}
        </label>
        <select
          id={`${id}-unit`}
          disabled={!hydrated}
          value={p.unit}
          onChange={(e) => p.setUnit(e.target.value)}
        >
          <option value="sqm">{t('sqm')}</option>
          <option value="sqft">{t('sqft')}</option>
        </select>
        <label className="row">
          <input
            type="checkbox"
            disabled={!hydrated}
            checked={p.arabicIndicDigits}
            onChange={(e) => p.setArabicIndicDigits(e.target.checked)}
          />
          {t('arabicIndicDigits')}
        </label>
      </div>
      <span className="small muted">{t('ratesAsOf', { date: FX_DATE })}</span>
      {p.status && (
        <span role="status" className="small muted">
          {t(p.status)}
        </span>
      )}
    </div>
  );
}
