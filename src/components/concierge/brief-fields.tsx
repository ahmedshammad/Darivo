'use client';
import type { MarketBrief } from '@/src/lib/concierge';
import { conciergeCopy, type ConciergeLocale } from '@/messages/concierge';
const currencies = ['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP'] as const;

export function BudgetFields({
  value,
  onChange,
  locale,
  currency = 'AED',
}: {
  value: MarketBrief['budget'];
  onChange: (value: MarketBrief['budget']) => void;
  locale: ConciergeLocale;
  currency?: NonNullable<MarketBrief['budget']>['currency'];
}) {
  const t = conciergeCopy[locale];
  function amount(key: 'min' | 'max', raw: string) {
    const next = {
      min: null,
      max: null,
      currency,
      association: 'explicit' as const,
      rawText: '',
      ...value,
      [key]: raw === '' ? null : Number(raw),
    };
    onChange(
      next.min === null && next.max === null
        ? null
        : {
            ...next,
            association: 'explicit',
            rawText: `${next.min ?? ''}–${next.max ?? ''} ${next.currency}`,
          },
    );
  }
  return (
    <>
      <div className="cq-field-pair">
        <label>
          {t.minimumBudget}
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={value?.max ?? 1e12}
            value={value?.min ?? ''}
            onChange={(event) => amount('min', event.target.value)}
          />
        </label>
        <label>
          {t.budget}
          <input
            type="number"
            inputMode="decimal"
            min={value?.min ?? 0}
            max={1e12}
            value={value?.max ?? ''}
            onChange={(event) => amount('max', event.target.value)}
          />
        </label>
      </div>
      <label>
        {t.currency}
        <select
          value={value?.currency ?? currency}
          disabled={!value}
          onChange={(event) =>
            value &&
            onChange({
              ...value,
              currency: event.target.value as typeof currency,
              association: 'explicit',
            })
          }
        >
          {currencies.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    </>
  );
}

export function DeadlineFields({
  value,
  onChange,
  locale,
}: {
  value: MarketBrief['deadline'];
  onChange: (value: MarketBrief['deadline']) => void;
  locale: ConciergeLocale;
}) {
  const t = conciergeCopy[locale];
  return (
    <div>
      <label>
        {t.deadlineKind}
        <select
          value={value?.kind ?? ''}
          onChange={(event) => {
            const today = new Date().toISOString().slice(0, 10);
            switch (event.target.value) {
              case 'year':
                onChange({
                  kind: 'year',
                  year: new Date().getFullYear(),
                  boundary: 'by',
                  rawText: t.year,
                });
                break;
              case 'date':
                onChange({ kind: 'date', date: today, boundary: 'by', rawText: t.date });
                break;
              case 'within_months':
                onChange({
                  kind: 'within_months',
                  months: 12,
                  relativeTo: today,
                  rawText: t.withinMonths,
                });
                break;
              case 'flexible':
                onChange({ kind: 'flexible', rawText: t.flexible });
                break;
              default:
                onChange(null);
            }
          }}
        >
          <option value="">{t.unspecified}</option>
          <option value="year">{t.year}</option>
          <option value="date">{t.date}</option>
          <option value="within_months">{t.withinMonths}</option>
          <option value="flexible">{t.flexible}</option>
        </select>
      </label>
      {value?.kind === 'year' && (
        <label>
          {t.timeline}
          <input
            type="number"
            min={1900}
            max={2200}
            required
            value={value.year}
            onChange={(event) =>
              onChange({
                ...value,
                year: Number(event.target.value),
                rawText: `${value.boundary} ${event.target.value}`,
              })
            }
          />
        </label>
      )}
      {value?.kind === 'date' && (
        <label>
          {t.date}
          <input
            type="date"
            required
            value={value.date}
            onChange={(event) =>
              onChange({
                ...value,
                date: event.target.value,
                rawText: `${value.boundary} ${event.target.value}`,
              })
            }
          />
        </label>
      )}
      {(value?.kind === 'year' || value?.kind === 'date') && (
        <label>
          {t.deadlineKind}
          <select
            value={value.boundary}
            onChange={(event) =>
              onChange({ ...value, boundary: event.target.value as 'before' | 'by' })
            }
          >
            <option value="by">{t.by}</option>
            <option value="before">{t.before}</option>
          </select>
        </label>
      )}
      {value?.kind === 'within_months' && (
        <div className="cq-field-pair">
          <label>
            {t.withinMonths}
            <input
              type="number"
              min={1}
              max={240}
              required
              value={value.months}
              onChange={(event) =>
                onChange({
                  ...value,
                  months: Number(event.target.value),
                  rawText: `${event.target.value} ${t.withinMonths}`,
                })
              }
            />
          </label>
          <label>
            {t.relativeTo}
            <input
              type="date"
              required
              value={value.relativeTo}
              onChange={(event) => onChange({ ...value, relativeTo: event.target.value })}
            />
          </label>
        </div>
      )}
      {value && <p className="cq-fine">{t.deadlineNote}</p>}
    </div>
  );
}
