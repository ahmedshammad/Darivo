'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { conciergeCopy, type ConciergeLocale } from '@/messages/concierge';
import type { BriefPatch, ConciergeBrief, MarketBrief } from '@/src/lib/concierge';
import { ATLAS_PLACES } from '@/src/lib/atlas-intent';
import { BudgetFields, DeadlineFields } from './brief-fields';
import { getDeadlineAssumptionContexts } from '@/src/lib/concierge-context';
import { usePreferences } from '@/src/components/preferences';

const currencies = ['AED', 'EGP', 'USD', 'EUR', 'SAR', 'GBP'] as const;
const purposes = ['residence', 'investment', 'holiday', 'relocation', 'golden_visa'] as const;
type Draft = { baseRevision: number; value: ConciergeBrief };
export function BriefEditor({
  brief,
  locale,
  busy,
  guest,
  signInHref,
  onApply,
}: {
  brief: ConciergeBrief;
  locale: ConciergeLocale;
  busy: boolean;
  guest: boolean;
  signInHref: string;
  onApply: (patch: BriefPatch) => Promise<void>;
}) {
  const t = conciergeCopy[locale];
  const { arabicIndicDigits } = usePreferences();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const current = draft?.value ?? brief;
  const deadlineAssumptions = getDeadlineAssumptionContexts(current);
  const change = (value: ConciergeBrief) => {
    setDraft({ baseRevision: draft?.baseRevision ?? brief.revision, value });
    setFeedback('');
  };
  const marketChange = (value: MarketBrief) =>
    change({
      ...current,
      markets: current.markets.map((market) => (market.id === value.id ? value : market)),
    });
  async function apply() {
    if (!draft) return;
    if (draft.baseRevision !== brief.revision) {
      setFeedback(t.draftWarning);
      return;
    }
    const {
      rawRequest,
      responseLanguage,
      overallPurpose,
      marketMode,
      unassignedBudget,
      unassignedDeadline,
      displayCurrencies,
      paymentCurrency,
      household,
      uncertainties,
      provenance,
    } = current;
    const operations: BriefPatch['operations'] = [
      {
        op: 'fields.set',
        value: {
          rawRequest,
          responseLanguage,
          overallPurpose,
          marketMode,
          unassignedBudget,
          unassignedDeadline,
          displayCurrencies,
          paymentCurrency,
          household,
          uncertainties,
          provenance,
        },
      },
    ];
    for (const market of current.markets)
      if (
        JSON.stringify(market) !== JSON.stringify(brief.markets.find((old) => old.id === market.id))
      )
        operations.push({ op: 'market.upsert', value: market });
    for (const old of brief.markets)
      if (!current.markets.some((market) => market.id === old.id))
        operations.push({ op: 'market.remove', id: old.id });
    for (const list of ['mustHaves', 'exclusions'] as const) {
      for (const constraint of current[list])
        if (
          JSON.stringify(constraint) !==
          JSON.stringify(brief[list].find((old) => old.id === constraint.id))
        )
          operations.push({ op: 'constraint.upsert', list, value: constraint });
      for (const old of brief[list])
        if (!current[list].some((item) => item.id === old.id))
          operations.push({ op: 'constraint.remove', list, id: old.id });
    }
    if (JSON.stringify(current.privacy) !== JSON.stringify(brief.privacy))
      operations.push({ op: 'privacy.replace', value: current.privacy });
    if (JSON.stringify(current.tasteMemory) !== JSON.stringify(brief.tasteMemory))
      operations.push({ op: 'memory.replace', value: current.tasteMemory });
    setSaving(true);
    try {
      await onApply({ baseRevision: draft.baseRevision, operations });
      setDraft(null);
      setFeedback(t.saved);
    } catch {
      setFeedback(t.error);
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      className="cq-brief"
      data-testid="concierge-brief"
      onSubmit={(event) => {
        event.preventDefault();
        void apply();
      }}
    >
      <div className="cq-section-heading">
        <span className="cq-eyebrow">{t.brief}</span>
        <h2>{t.markets}</h2>
      </div>
      <label>
        {t.raw}
        <textarea
          value={current.rawRequest}
          rows={3}
          maxLength={4000}
          onChange={(event) => change({ ...current, rawRequest: event.target.value })}
        />
      </label>
      <label>
        {t.purpose}
        <select
          value={current.overallPurpose ?? ''}
          onChange={(event) =>
            change({
              ...current,
              overallPurpose: (event.target.value || null) as ConciergeBrief['overallPurpose'],
            })
          }
        >
          <option value="">{t.unspecified}</option>
          {purposes.map((purpose) => (
            <option key={purpose} value={purpose}>
              {t.purposes[purpose]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t.markets}
        <select
          value={current.marketMode}
          onChange={(event) =>
            change({ ...current, marketMode: event.target.value as ConciergeBrief['marketMode'] })
          }
        >
          <option value="independent">{t.independent}</option>
          <option value="alternatives">{t.alternatives}</option>
        </select>
      </label>
      {current.markets.map((market, index) => (
        <fieldset key={market.id} className="cq-market">
          <legend>
            {market.country === 'UAE' ? t.countryUae : t.countryEgypt} · {index + 1}
          </legend>
          <label>
            {t.purpose}
            <select
              value={market.purpose ?? ''}
              onChange={(event) =>
                marketChange({
                  ...market,
                  purpose: (event.target.value || null) as MarketBrief['purpose'],
                })
              }
            >
              <option value="">{t.unspecified}</option>
              {purposes.map((purpose) => (
                <option value={purpose} key={purpose}>
                  {t.purposes[purpose]}
                </option>
              ))}
            </select>
          </label>
          <details>
            <summary>
              {t.place}:{' '}
              {market.placeIds
                .map((id) => {
                  const place = ATLAS_PLACES.find((p) => p.id === id);
                  return place ? (locale === 'ar' ? place.nameAr : place.nameEn) : id;
                })
                .join(' · ') || t.unspecified}
            </summary>
            <div className="cq-place-options">
              {ATLAS_PLACES.map((place) => (
                <label key={place.id}>
                  <input
                    type="checkbox"
                    checked={market.placeIds.includes(place.id)}
                    onChange={(event) =>
                      marketChange({
                        ...market,
                        placeIds: event.target.checked
                          ? [...market.placeIds, place.id]
                          : market.placeIds.filter((id) => id !== place.id),
                      })
                    }
                  />
                  {locale === 'ar' ? place.nameAr : place.nameEn}
                </label>
              ))}
            </div>
            <label>
              {t.place}
              <select
                value={market.placeMatch}
                onChange={(event) =>
                  marketChange({ ...market, placeMatch: event.target.value as 'any' | 'all' })
                }
              >
                <option value="any">{t.any}</option>
                <option value="all">{t.all}</option>
              </select>
            </label>
          </details>
          <BudgetFields
            locale={locale}
            value={market.budget}
            currency={market.country === 'Egypt' ? 'EGP' : 'AED'}
            onChange={(budget) => marketChange({ ...market, budget })}
          />
          <DeadlineFields
            locale={locale}
            value={market.deadline}
            onChange={(deadline) => marketChange({ ...market, deadline })}
          />
          {deadlineAssumptions
            .filter((context) => context.marketId === market.id)
            .map((context) => (
              <p
                className="cq-deadline-assumption"
                data-testid="concierge-deadline-assumption"
                data-market-id={market.id}
                key={market.id}
              >
                {t.scopedDeadlineAssumption
                  .replace('{country}', market.country === 'UAE' ? t.countryUae : t.countryEgypt)
                  .replaceAll(
                    '{year}',
                    new Intl.NumberFormat(locale, {
                      useGrouping: false,
                      numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
                    }).format(context.year),
                  )}
              </p>
            ))}
          <label>
            {t.readiness}
            <select
              value={market.readiness}
              onChange={(event) =>
                marketChange({
                  ...market,
                  readiness: event.target.value as MarketBrief['readiness'],
                })
              }
            >
              <option value="unspecified">{t.unspecified}</option>
              <option value="ready_now">{t.readyNow}</option>
              <option value="off_plan_acceptable">{t.offPlan}</option>
            </select>
          </label>
          <label>
            {t.bedrooms}
            <input
              type="number"
              min={0}
              max={30}
              value={market.bedrooms ?? ''}
              onChange={(event) =>
                marketChange({
                  ...market,
                  bedrooms: event.target.value ? Number(event.target.value) : null,
                })
              }
            />
          </label>
          <fieldset>
            <legend>{t.propertyTypes}</legend>
            <div className="cq-place-options">
              {(Object.keys(t.types) as MarketBrief['propertyTypes']).map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={market.propertyTypes.includes(type)}
                    onChange={(event) =>
                      marketChange({
                        ...market,
                        propertyTypes: event.target.checked
                          ? [...market.propertyTypes, type]
                          : market.propertyTypes.filter((item) => item !== type),
                      })
                    }
                  />
                  {t.types[type]}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            className="cq-text-button"
            onClick={() =>
              change({
                ...current,
                markets: current.markets.filter((item) => item.id !== market.id),
                mustHaves: current.mustHaves
                  .filter(
                    (item) => !(item.marketIds.length === 1 && item.marketIds[0] === market.id),
                  )
                  .map((item) => ({
                    ...item,
                    marketIds: item.marketIds.filter((id) => id !== market.id),
                  })),
                exclusions: current.exclusions
                  .filter(
                    (item) => !(item.marketIds.length === 1 && item.marketIds[0] === market.id),
                  )
                  .map((item) => ({
                    ...item,
                    marketIds: item.marketIds.filter((id) => id !== market.id),
                  })),
              })
            }
          >
            <X aria-hidden="true" />
            {t.remove}
          </button>
        </fieldset>
      ))}
      {current.markets.length < 8 && (
        <div className="cq-field-pair">
          {(['UAE', 'Egypt'] as const).map((country) => (
            <button
              type="button"
              className="cq-text-button"
              key={country}
              onClick={() =>
                change({
                  ...current,
                  markets: [
                    ...current.markets,
                    {
                      id: `market-${crypto.randomUUID()}`,
                      country,
                      placeIds: [],
                      placeMatch: 'any',
                      purpose: null,
                      budget: null,
                      deadline: null,
                      readiness: 'unspecified',
                      propertyTypes: [],
                      bedrooms: null,
                      rawText: '',
                    },
                  ],
                })
              }
            >
              <Plus aria-hidden="true" />
              {t.addMarket} · {country === 'UAE' ? t.countryUae : t.countryEgypt}
            </button>
          ))}
        </div>
      )}
      {(current.unassignedBudget || current.unassignedDeadline) && (
        <fieldset>
          <legend>{t.unassigned}</legend>
          <BudgetFields
            locale={locale}
            value={current.unassignedBudget}
            onChange={(unassignedBudget) => change({ ...current, unassignedBudget })}
          />
          <DeadlineFields
            locale={locale}
            value={current.unassignedDeadline}
            onChange={(unassignedDeadline) => change({ ...current, unassignedDeadline })}
          />
        </fieldset>
      )}
      <div className="cq-field-pair">
        <label>
          {t.adults}
          <input
            type="number"
            min={1}
            max={30}
            value={current.household.adults ?? ''}
            onChange={(event) =>
              change({
                ...current,
                household: {
                  ...current.household,
                  adults: event.target.value ? Number(event.target.value) : null,
                },
              })
            }
          />
        </label>
        <label>
          {t.children}
          <input
            type="number"
            min={0}
            max={30}
            value={current.household.children ?? ''}
            onChange={(event) =>
              change({
                ...current,
                household: {
                  ...current.household,
                  children: event.target.value ? Number(event.target.value) : null,
                },
              })
            }
          />
        </label>
      </div>
      <label>
        {t.curriculum}
        <input
          value={current.household.curriculum ?? ''}
          maxLength={100}
          onChange={(event) =>
            change({
              ...current,
              household: { ...current.household, curriculum: event.target.value || null },
            })
          }
        />
      </label>
      <label>
        {t.schoolRequirement}
        <select
          value={current.household.schoolRequirement}
          onChange={(event) =>
            change({
              ...current,
              household: {
                ...current.household,
                schoolRequirement: event.target
                  .value as ConciergeBrief['household']['schoolRequirement'],
              },
            })
          }
        >
          <option value="unspecified">{t.unspecified}</option>
          <option value="nearby">{t.nearby}</option>
          <option value="verified_required">{t.verifiedRequired}</option>
        </select>
      </label>
      {(['mustHaves', 'exclusions'] as const).map((list) => (
        <fieldset key={list}>
          <legend id={`concierge-${list}`} tabIndex={-1}>
            {list === 'mustHaves' ? t.must : t.exclusions}
          </legend>
          {current[list].map((item) => (
            <div className="cq-constraint-editor" key={item.id}>
              <div className="cq-constraint">
                <label>
                  <span className="cq-sr">{list === 'mustHaves' ? t.must : t.exclusions}</span>
                  <textarea
                    rows={2}
                    maxLength={500}
                    required
                    value={item.text}
                    onChange={(event) =>
                      change({
                        ...current,
                        [list]: current[list].map((row) =>
                          row.id === item.id ? { ...row, text: event.target.value } : row,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  className="cq-icon"
                  type="button"
                  aria-label={`${t.remove}: ${item.text}`}
                  onClick={() =>
                    change({
                      ...current,
                      [list]: current[list].filter((row) => row.id !== item.id),
                    })
                  }
                >
                  <X />
                </button>
              </div>
              <details>
                <summary>{t.constraintSettings}</summary>
                <label>
                  {t.constraintScope}
                  <select
                    value={item.marketIds.length ? 'selected' : 'all'}
                    onChange={(event) =>
                      change({
                        ...current,
                        [list]: current[list].map((row) =>
                          row.id === item.id
                            ? {
                                ...row,
                                marketIds:
                                  event.target.value === 'all'
                                    ? []
                                    : current.markets.slice(0, 1).map((market) => market.id),
                              }
                            : row,
                        ),
                      })
                    }
                  >
                    <option value="all">{t.everyObjective}</option>
                    <option value="selected" disabled={!current.markets.length}>
                      {t.selectedObjectives}
                    </option>
                  </select>
                </label>
                {item.marketIds.length > 0 && (
                  <div className="cq-place-options">
                    {current.markets.map((market, index) => (
                      <label key={market.id}>
                        <input
                          type="checkbox"
                          checked={item.marketIds.includes(market.id)}
                          disabled={
                            item.marketIds.length === 1 && item.marketIds.includes(market.id)
                          }
                          onChange={(event) =>
                            change({
                              ...current,
                              [list]: current[list].map((row) =>
                                row.id === item.id
                                  ? {
                                      ...row,
                                      marketIds: event.target.checked
                                        ? [...row.marketIds, market.id]
                                        : row.marketIds.filter((id) => id !== market.id),
                                    }
                                  : row,
                              ),
                            })
                          }
                        />
                        {market.country === 'UAE' ? t.countryUae : t.countryEgypt} · {index + 1}
                        {market.purpose ? ` · ${t.purposes[market.purpose]}` : ''}
                      </label>
                    ))}
                  </div>
                )}
                <label className="cq-check">
                  <input
                    type="checkbox"
                    checked={item.verificationRequired}
                    onChange={(event) =>
                      change({
                        ...current,
                        [list]: current[list].map((row) =>
                          row.id === item.id
                            ? { ...row, verificationRequired: event.target.checked }
                            : row,
                        ),
                      })
                    }
                  />
                  {t.evidenceRequired}
                </label>
                <p className="cq-fine">{t.evidenceOptionalNote}</p>
              </details>
            </div>
          ))}
          {current[list].length < 30 && (
            <button
              className="cq-text-button"
              type="button"
              onClick={() =>
                change({
                  ...current,
                  [list]: [
                    ...current[list],
                    {
                      id: `constraint-${crypto.randomUUID()}`,
                      text: '',
                      marketIds: [],
                      category: 'other',
                      verificationRequired: true,
                    },
                  ],
                })
              }
            >
              <Plus aria-hidden="true" />
              {t.add}
            </button>
          )}
        </fieldset>
      ))}
      <fieldset>
        <legend>{t.displayCurrency}</legend>
        <p className="cq-fine">{t.selectCurrencies}</p>
        <div className="cq-place-options">
          {currencies.map((currency) => (
            <label key={currency}>
              <input
                type="checkbox"
                checked={current.displayCurrencies.includes(currency)}
                disabled={
                  current.displayCurrencies.length === 1 &&
                  current.displayCurrencies.includes(currency)
                }
                onChange={(event) =>
                  change({
                    ...current,
                    displayCurrencies: event.target.checked
                      ? [...current.displayCurrencies, currency]
                      : current.displayCurrencies.filter((value) => value !== currency),
                  })
                }
              />
              {currency}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        {t.paymentCurrency}
        <select
          value={current.paymentCurrency ?? ''}
          onChange={(event) =>
            change({
              ...current,
              paymentCurrency: (event.target.value || null) as ConciergeBrief['paymentCurrency'],
            })
          }
        >
          <option value="">{t.unspecified}</option>
          {currencies.map((currency) => (
            <option key={currency}>{currency}</option>
          ))}
        </select>
      </label>
      <label>
        {t.responseLanguage}
        <select
          value={current.responseLanguage}
          onChange={(event) =>
            change({
              ...current,
              responseLanguage: event.target.value as ConciergeBrief['responseLanguage'],
            })
          }
        >
          <option value="auto">{t.auto}</option>
          <option value="en">{t.english}</option>
          <option value="ar">{t.arabic}</option>
        </select>
      </label>
      <details>
        <summary>{t.privacy}</summary>
        {(['doNotSave', 'doNotShare', 'doNotBook'] as const).map((key) => (
          <label className="cq-check" key={key}>
            <input
              type="checkbox"
              checked={current.privacy[key]}
              onChange={(event) =>
                change({ ...current, privacy: { ...current.privacy, [key]: event.target.checked } })
              }
            />
            {t[key]}
          </label>
        ))}
        <label className="cq-check">
          <input
            type="checkbox"
            checked={current.privacy.mode === 'discreet'}
            onChange={(event) =>
              change({
                ...current,
                privacy: {
                  ...current.privacy,
                  mode: event.target.checked ? 'discreet' : 'standard',
                },
              })
            }
          />
          {t.discreet}
        </label>
      </details>
      <details>
        <summary>{t.memory}</summary>
        <p className="cq-fine">{t.memoryNote}</p>
        {current.tasteMemory.items.length ? (
          <ul>
            {current.tasteMemory.items.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        ) : (
          <p className="cq-fine">{t.memoryEmpty}</p>
        )}
        {guest ? (
          <Link className="cq-text-button" href={signInHref}>
            {t.signIn} · {t.memory}
          </Link>
        ) : (
          <button
            type="button"
            className="cq-text-button"
            onClick={() =>
              change({
                ...current,
                tasteMemory:
                  current.tasteMemory.consent === 'granted'
                    ? { consent: 'revoked', consentedAt: null, items: [] }
                    : { consent: 'granted', consentedAt: new Date().toISOString(), items: [] },
              })
            }
          >
            {current.tasteMemory.consent === 'granted' ? t.revokeMemory : t.grantMemory}
          </button>
        )}
      </details>
      {current.uncertainties.length > 0 && (
        <div role="note" className="cq-notice">
          <ul>
            {current.uncertainties.map((uncertainty) => (
              <li key={uncertainty}>
                {uncertainty in t.uncertainties
                  ? t.uncertainties[uncertainty as keyof typeof t.uncertainties]
                  : uncertainty}
              </li>
            ))}
          </ul>
        </div>
      )}
      {draft && draft.baseRevision !== brief.revision && <p role="alert">{t.draftWarning}</p>}
      <div className="cq-brief-actions">
        <button
          className="cq-action"
          disabled={!draft || saving || busy || draft.baseRevision !== brief.revision}
          type="submit"
        >
          {saving ? t.saving : t.apply}
        </button>
        <button
          type="button"
          className="cq-text-button"
          disabled={!draft || saving}
          onClick={() => {
            setDraft(null);
            setFeedback('');
          }}
        >
          {t.discard}
        </button>
      </div>
      <p role="status" className="cq-fine">
        {feedback}
      </p>
    </form>
  );
}
