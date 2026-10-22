'use client';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useTranslations } from 'next-intl';
import { FX, FX_DATE } from '@/src/lib/catalog';
import { decodeDisplayPreferences } from '@/src/lib/display-preferences-client';

type DisplayState = { currency: string; unit: string; arabicIndicDigits: boolean };
type Preferences = DisplayState & {
  setCurrency: (value: string) => void;
  setUnit: (value: string) => void;
  setArabicIndicDigits: (value: boolean) => void;
  applySavedPreferences: (value: DisplayState) => void;
  flush: () => Promise<void>;
  status: '' | 'savingPreferences' | 'preferencesSaved' | 'preferencesSaveFailed';
};
const Context = createContext<Preferences>({
  currency: 'AED',
  unit: 'sqm',
  arabicIndicDigits: false,
  setCurrency: () => {},
  setUnit: () => {},
  setArabicIndicDigits: () => {},
  applySavedPreferences: () => {},
  flush: async () => {},
  status: '',
});
const storageKey = 'darivo-display-preferences';
const storageEvent = 'darivo-display-preferences-change';
function subscribe(listener: () => void) {
  window.addEventListener('storage', listener);
  window.addEventListener(storageEvent, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(storageEvent, listener);
  };
}
function readLocal() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}
function localPreferences(raw: string | null): Partial<DisplayState> {
  try {
    const value = decodeDisplayPreferences(JSON.parse(raw ?? '{}'));
    if (!value) return {};
    return {
      ...(value.currency ? { currency: value.currency } : {}),
      ...(value.areaUnit ? { unit: value.areaUnit } : {}),
      ...(value.arabicIndicDigits !== undefined
        ? { arabicIndicDigits: value.arabicIndicDigits }
        : {}),
    };
  } catch {
    return {};
  }
}
export function PreferencesProvider({
  children,
  currency = 'AED',
  unit = 'sqm',
  arabicIndicDigits = false,
  userId,
}: {
  children: React.ReactNode;
  currency?: string;
  unit?: string;
  arabicIndicDigits?: boolean;
  userId?: string;
}) {
  const [state, setState] = useState<DisplayState>({ currency, unit, arabicIndicDigits });
  const [status, setStatus] = useState<Preferences['status']>('');
  const local = useSyncExternalStore(subscribe, readLocal, () => null);
  const current = userId ? state : { ...state, ...localPreferences(local) };
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const desired = useRef(state);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const active = new AbortController();
    controller.current = active;
    return () => active.abort();
  }, []);
  function update(next: Partial<DisplayState>) {
    const merged = {
      ...desired.current,
      ...(!userId ? localPreferences(readLocal()) : {}),
      ...next,
    };
    desired.current = merged;
    setState(merged);
    if (!userId) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            currency: merged.currency,
            areaUnit: merged.unit,
            arabicIndicDigits: merged.arabicIndicDigits,
          }),
        );
        window.dispatchEvent(new Event(storageEvent));
        setStatus('preferencesSaved');
      } catch {
        setStatus('preferencesSaveFailed');
      }
      return;
    }
    const body = {
      currency: merged.currency,
      areaUnit: merged.unit,
      arabicIndicDigits: merged.arabicIndicDigits,
    };
    const activeController = controller.current;
    const requestRevision = ++revision.current;
    setStatus('savingPreferences');
    // Serialize complete snapshots: a later successful save also repairs an earlier failed field.
    // Cancel on account/provider changes so queued writes cannot follow a different session.
    queue.current = queue.current.then(async () => {
      if (activeController?.signal.aborted) return;
      try {
        const response = await fetch('/api/v1/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: activeController?.signal,
        });
        if (!response.ok) throw new Error('preferences_save_failed');
        if (requestRevision === revision.current) setStatus('preferencesSaved');
      } catch {
        if (!activeController?.signal.aborted && requestRevision === revision.current)
          setStatus('preferencesSaveFailed');
      }
    });
  }
  return (
    <Context.Provider
      value={{
        ...current,
        status,
        setCurrency: (value) => update({ currency: value }),
        setUnit: (value) => update({ unit: value }),
        setArabicIndicDigits: (value) => update({ arabicIndicDigits: value }),
        flush: () => queue.current,
        applySavedPreferences: (value) => {
          desired.current = value;
          setState(value);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
export function DisplayPreferences() {
  const t = useTranslations();
  const p = usePreferences();
  const id = useId();
  return (
    <div className="stack small">
      <div className="row">
        <label className="sr-only" htmlFor={`${id}-currency`}>
          {t('currency')}
        </label>
        <select
          id={`${id}-currency`}
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
        <select id={`${id}-unit`} value={p.unit} onChange={(e) => p.setUnit(e.target.value)}>
          <option value="sqm">{t('sqm')}</option>
          <option value="sqft">{t('sqft')}</option>
        </select>
        <label className="row">
          <input
            type="checkbox"
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
