'use client';
import { createContext, useContext, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FX, FX_DATE } from '@/src/lib/catalog';
const Context = createContext({
  currency: 'AED',
  unit: 'sqm',
  setCurrency: (v: string) => {
    void v;
  },
  setUnit: (v: string) => {
    void v;
  },
});
export function PreferencesProvider({
  children,
  currency = 'AED',
  unit = 'sqm',
}: {
  children: React.ReactNode;
  currency?: string;
  unit?: string;
}) {
  const [c, setCurrency] = useState(currency),
    [u, setUnit] = useState(unit);
  return (
    <Context.Provider value={{ currency: c, unit: u, setCurrency, setUnit }}>
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
export function DisplayPreferences() {
  const t = useTranslations();
  const p = usePreferences();
  return (
    <div className="row">
      <label className="sr-only" htmlFor="display-currency">
        {t('currency')}
      </label>
      <select
        id="display-currency"
        value={p.currency}
        onChange={(e) => p.setCurrency(e.target.value)}
      >
        {Object.keys(FX).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <label className="sr-only" htmlFor="display-unit">
        {t('areaUnit')}
      </label>
      <select id="display-unit" value={p.unit} onChange={(e) => p.setUnit(e.target.value)}>
        <option value="sqm">{t('sqm')}</option>
        <option value="sqft">{t('sqft')}</option>
      </select>
      <span className="small muted">{t('ratesAsOf', { date: FX_DATE })}</span>
    </div>
  );
}
