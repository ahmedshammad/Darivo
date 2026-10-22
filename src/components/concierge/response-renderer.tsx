'use client';

import { ArrowUpRight, MapPin, Plus, Minus } from 'lucide-react';
import type {
  ConciergeComponent,
  GroundedCard,
  GroundedFact,
  GroundedSource,
} from '@/src/lib/concierge';
import { ConciergeMiniMap } from './mini-map';
import { conciergeToolCallSchema } from '@/src/lib/concierge';
import type { AtlasProject } from '@/src/lib/atlas';
import type { AtlasCamera } from '@/src/lib/atlas';
import { conciergeCopy, type ConciergeLocale } from '@/messages/concierge';
import { usePreferences } from '@/src/components/preferences';

export function useConciergeNumbers(locale: ConciergeLocale) {
  const { arabicIndicDigits } = usePreferences();
  const format = (value: number, currency?: string, precision?: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
      numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
      maximumFractionDigits: precision ?? (currency ? 0 : 2),
      ...(currency ? { style: 'currency' as const, currency } : {}),
    }).format(value);
  const digits = (value: string) =>
    value.replace(/[0-9]/g, (digit) => (arabicIndicDigits ? '٠١٢٣٤٥٦٧٨٩'[Number(digit)] : digit));
  return { format, digits };
}

function factLabel(fact: GroundedFact, locale: ConciergeLocale) {
  return fact.label[locale];
}

export function SourceEvidence({
  sources,
  locale,
}: {
  sources: GroundedSource[];
  locale: ConciergeLocale;
}) {
  const t = conciergeCopy[locale];
  const { digits } = useConciergeNumbers(locale);
  return (
    <div className="cq-sources">
      {sources.length ? (
        sources.map((source) => (
          <div key={source.id}>
            {source.kind === 'published' ? (
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                <bdi>{source.publisher}</bdi>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : (
              <span>{t.basis[source.basis]}</span>
            )}
            <span>
              {source.kind === 'published' && `${t.basis[source.basis]} · `}
              {t.asOf} <bdi>{source.asOf.value ? digits(source.asOf.value) : t.unknown}</bdi>
            </span>
          </div>
        ))
      ) : (
        <p>{t.unknown}</p>
      )}
    </div>
  );
}

export function FactValue({ fact, locale }: { fact?: GroundedFact; locale: ConciergeLocale }) {
  const t = conciergeCopy[locale];
  const { format, digits } = useConciergeNumbers(locale);
  if (!fact || fact.value === null) return <span>{t.unknown}</span>;
  const value =
    typeof fact.value === 'number'
      ? format(fact.value, fact.currency ?? undefined)
      : typeof fact.value === 'boolean'
        ? fact.value
          ? t.yes
          : t.no
        : digits(fact.displayValue?.[locale] ?? fact.value);
  return (
    <>
      <bdi>
        {value}
        {fact.unit && !fact.currency ? ` ${fact.unit}` : ''}
      </bdi>
      {fact.qualifier && <small>{fact.qualifier[locale]}</small>}
      {typeof fact.value === 'string' &&
        fact.displayValue?.[locale] &&
        fact.displayValue[locale] !== (fact.originalText ?? fact.value) && (
          <small>
            {t.originalWording}: <bdi>{fact.originalText ?? fact.value}</bdi>
          </small>
        )}
    </>
  );
}

export function CardPrice({ card, locale }: { card: GroundedCard; locale: ConciergeLocale }) {
  const t = conciergeCopy[locale];
  const { format, digits } = useConciergeNumbers(locale);
  return (
    <div className="cq-card-price">
      {card.price ? (
        <>
          <strong>
            <bdi>{format(card.price.native.amount, card.price.native.currency)}</bdi>
          </strong>
          <small>
            {t.original}
            {card.price.qualifier && ` · ${card.price.qualifier[locale]}`}
          </small>
          {card.price.converted.map((conversion) => (
            <small key={conversion.money.currency}>
              <bdi>{format(conversion.money.amount, conversion.money.currency)}</bdi> · {t.fx} ·{' '}
              {conversion.asOf.value ? digits(conversion.asOf.value) : t.unknown} ·{' '}
              <bdi>
                {format(1)} {card.price!.native.currency} = {format(conversion.rate, undefined, 8)}{' '}
                {conversion.money.currency}
              </bdi>
            </small>
          ))}
        </>
      ) : (
        <strong>{t.onRequest}</strong>
      )}
    </div>
  );
}

function scenarioInputs(fact: GroundedFact | undefined) {
  if (!fact?.originalText) return null;
  try {
    const parsed = conciergeToolCallSchema.safeParse({
      name: 'investment_calc',
      arguments: JSON.parse(fact.originalText),
    });
    return parsed.success && parsed.data.name === 'investment_calc' ? parsed.data.arguments : null;
  } catch {
    return null;
  }
}

export function ConciergeCard({
  card,
  locale,
  selected,
  onSelect,
  onCompare,
}: {
  card: GroundedCard;
  locale: ConciergeLocale;
  selected: boolean;
  onSelect: () => void;
  onCompare: () => void;
}) {
  const t = conciergeCopy[locale];
  const { format } = useConciergeNumbers(locale);
  const scenario = card.facts.find(
    (fact) => fact.key === 'scenario-yield' && typeof fact.value === 'number',
  );
  const assumptions = scenarioInputs(scenario);
  return (
    <article
      className="cq-project"
      data-testid="concierge-project"
      data-project-id={card.projectId}
    >
      <div className="cq-card-kicker">
        <span className="cq-badge">{card.kind === 'reference-project' ? t.reference : t.demo}</span>
        <button
          className="cq-icon"
          onClick={onCompare}
          aria-label={`${selected ? t.removeCompare : t.compare}: ${card.name[locale]}`}
          aria-pressed={selected}
        >
          {selected ? <Minus /> : <Plus />}
        </button>
      </div>
      <h3>
        <button onClick={onSelect}>
          {card.name[locale]}
          <ArrowUpRight aria-hidden="true" />
        </button>
      </h3>
      {scenario && typeof scenario.value === 'number' && (
        <section className="cq-scenario" data-testid="concierge-scenario-yield">
          <span className="cq-badge">{t.assumption}</span>
          <h4>{scenario.label[locale]}</h4>
          <strong>
            <bdi>
              {format(scenario.value)}
              {scenario.unit ? ` ${scenario.unit}` : ''}
            </bdi>
          </strong>
          {scenario.qualifier && <p className="cq-fine">{scenario.qualifier[locale]}</p>}
          {assumptions ? (
            <dl className="cq-scenario-inputs">
              <div>
                <dt>{t.annualRent}</dt>
                <dd>
                  <bdi>
                    {format(assumptions.annualRent.amount, assumptions.annualRent.currency)}
                  </bdi>
                </dd>
              </div>
              <div>
                <dt>{t.annualCosts}</dt>
                <dd>
                  <bdi>
                    {format(assumptions.annualCosts.amount, assumptions.annualCosts.currency)}
                  </bdi>
                </dd>
              </div>
              <div>
                <dt>{t.vacancy}</dt>
                <dd>
                  <bdi>{format(assumptions.vacancyPercent)}%</bdi>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="cq-fine">{t.scenarioInputsUnknown}</p>
          )}
          <SourceEvidence
            sources={card.sources.filter((source) => scenario.sourceIds.includes(source.id))}
            locale={locale}
          />
        </section>
      )}
      <CardPrice card={card} locale={locale} />
      <p className="cq-fine">{card.kind === 'reference-project' ? t.noAvailability : t.demoOnly}</p>
      <SourceEvidence sources={card.sources.slice(0, 1)} locale={locale} />
      <div className="cq-reasons">
        <h4>{t.why}</h4>
        <ul>
          {card.reasons.map((reason, index) => (
            <li key={index} data-support={reason.status}>
              {reason.text[locale]}
            </li>
          ))}
        </ul>
        <h4>{t.tradeoff}</h4>
        <p>{card.tradeoff.text[locale]}</p>
      </div>
      <details className="cq-evidence">
        <summary>{t.sources}</summary>
        <dl>
          {card.facts.map((fact) => (
            <div key={fact.id}>
              <dt>{factLabel(fact, locale)}</dt>
              <dd>
                <FactValue fact={fact} locale={locale} />
              </dd>
            </div>
          ))}
        </dl>
        <SourceEvidence sources={card.sources} locale={locale} />
      </details>
      {card.center && (
        <button className="cq-text-button" onClick={onSelect}>
          <MapPin aria-hidden="true" />
          {t.showMap}
          {card.coordinatesApproximate && <span> · {t.approximate}</span>}
        </button>
      )}
    </article>
  );
}

type ResponseProps = {
  component: ConciergeComponent;
  projects: AtlasProject[];
  locale: ConciergeLocale;
  comparison: string[];
  onSelect: (card: GroundedCard) => void;
  onToggleCompare: (card: GroundedCard) => void;
  onCompare: (cards: GroundedCard[]) => void;
  onMap: (camera: AtlasCamera, ids: string[]) => void;
  onReviewRequirements: () => void;
};
export function ResponseComponent({
  component,
  projects,
  locale,
  comparison,
  onSelect,
  onToggleCompare,
  onCompare,
  onMap,
  onReviewRequirements,
}: ResponseProps) {
  const t = conciergeCopy[locale];
  const { format, digits } = useConciergeNumbers(locale);
  switch (component.kind) {
    case 'project-cards':
      return (
        <div className="cq-projects" data-component-kind={component.kind}>
          {component.cards.map((card) => (
            <ConciergeCard
              key={card.id}
              card={card}
              locale={locale}
              selected={comparison.includes(card.projectId)}
              onSelect={() => onSelect(card)}
              onCompare={() => onToggleCompare(card)}
            />
          ))}
        </div>
      );
    case 'comparison':
      return (
        <section className="cq-generated" data-component-kind={component.kind}>
          <h3>{t.compare}</h3>
          <div className="cq-table-scroll" tabIndex={0} role="region" aria-label={t.compare}>
            <table>
              <caption>{t.scrollHint}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.facts}</th>
                  {component.cards.map((card) => (
                    <th key={card.id} scope="col">
                      {card.name[locale]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t.price}</th>
                  {component.cards.map((card) => (
                    <td key={card.id}>
                      <CardPrice card={card} locale={locale} />
                    </td>
                  ))}
                </tr>
                {component.rows
                  .filter(
                    (row) =>
                      row.factKey !== 'price' || !component.cards.every((card) => card.price),
                  )
                  .map((row) => (
                    <tr key={row.factKey}>
                      <th scope="row">{row.label[locale]}</th>
                      {component.cards.map((card) => (
                        <td key={card.id}>
                          <FactValue
                            fact={card.facts.find((fact) => fact.key === row.factKey)}
                            locale={locale}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                <tr>
                  <th scope="row">{t.tradeoff}</th>
                  {component.cards.map((card) => (
                    <td key={card.id}>{card.tradeoff.text[locale]}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <button className="cq-action" onClick={() => onCompare(component.cards)}>
            {t.compareMap}
            <ArrowUpRight aria-hidden="true" />
          </button>
          <details>
            <summary>{t.sources}</summary>
            {component.cards.map((card) => (
              <div key={card.id}>
                <h4>{card.name[locale]}</h4>
                <SourceEvidence sources={card.sources} locale={locale} />
              </div>
            ))}
          </details>
        </section>
      );
    case 'mini-map':
      return (
        <ConciergeMiniMap component={component} projects={projects} locale={locale} onMap={onMap} />
      );
    case 'payment-timeline':
      return (
        <section className="cq-generated" data-component-kind={component.kind}>
          <div className="cq-card-kicker">
            <h3>{t.payment}</h3>
            <span className="cq-badge">
              {component.mode === 'DEMO_ESTIMATE'
                ? t.demo
                : component.mode === 'USER_ASSUMPTION'
                  ? t.assumption
                  : t.reference}
            </span>
          </div>
          <ol className="cq-payment">
            {component.schedule.map((step) => (
              <li key={step.id}>
                <strong>
                  <bdi>{format(step.percent)}%</bdi>
                </strong>
                <h4>{step.label[locale]}</h4>
                {step.timing.trim() !== step.label[locale].trim() && (
                  <p>
                    <bdi>{digits(step.timing)}</bdi>
                  </p>
                )}
                <p>
                  <bdi>
                    {format(
                      (component.price.native.amount * step.percent) / 100,
                      component.price.native.currency,
                    )}
                  </bdi>
                </p>
              </li>
            ))}
          </ol>
          <p>
            {t.total}:{' '}
            <bdi>{format(component.price.native.amount, component.price.native.currency)}</bdi> ·{' '}
            {t.original}
          </p>
          <SourceEvidence sources={component.sources} locale={locale} />
        </section>
      );
    case 'price-area-chart': {
      const points = component.points.map((point) => {
        const card = component.cards.find(
          (item) =>
            item.projectId === point.entity.id ||
            (item.kind === 'demo-unit' && item.unitId === point.entity.id),
        );
        return {
          point,
          card,
          price: card?.facts.find((fact) => fact.id === point.priceFactId),
          area: card?.facts.find((fact) => fact.id === point.areaFactId),
        };
      });
      const groups = [
        ...new Set(
          points.flatMap((point) =>
            point.price?.currency && point.area?.unit
              ? [`${point.price.currency}|${point.area.unit}`]
              : [],
          ),
        ),
      ];
      return (
        <section className="cq-generated" data-component-kind={component.kind}>
          <h3>{t.chart}</h3>
          <p className="cq-fine">{t.chartNote}</p>
          {groups.map((group) => {
            const [currency, unit] = group.split('|');
            const valid = points.filter(
              (p) =>
                p.price?.currency === currency &&
                p.area?.unit === unit &&
                typeof p.price.value === 'number' &&
                typeof p.area?.value === 'number' &&
                p.area.value > 0,
            );
            const max = Math.max(1, ...valid.map((p) => p.price!.value as number));
            const maxArea = Math.max(1, ...valid.map((p) => p.area!.value as number));
            const labels: Array<{ x: number; y: number }> = [];
            const plotted = valid.map((point) => {
              const x = 44 + ((point.area!.value as number) / maxArea) * 268;
              const y = 152 - ((point.price!.value as number) / max) * 126;
              // Plex Arabic's numeric glyph box is taller than Inter's. Reserve
              // 26 SVG units vertically, including the four-unit contrast halo.
              const candidates = [
                [-18, -12],
                [18, -12],
                [-18, 18],
                [18, 18],
                [-48, 0],
                [0, 32],
                [-48, 32],
                [30, 48],
                [-30, 64],
              ];
              const label = candidates
                .map(([dx, dy]) => ({
                  x: Math.max(56, Math.min(326, x + dx)),
                  y: Math.max(18, Math.min(146, y + dy)),
                }))
                .find((candidate) =>
                  labels.every(
                    (placed) =>
                      Math.abs(placed.x - candidate.x) > 22 ||
                      Math.abs(placed.y - candidate.y) > 26,
                  ),
                ) ?? { x: x - 18, y: y - 12 };
              labels.push(label);
              return { point, x, y, label };
            });
            return (
              <figure className="cq-scatter" key={group}>
                <figcaption>
                  {t.price} · <bdi>{currency}</bdi> / {t.area} · <bdi>{unit}</bdi>
                </figcaption>
                <p className="cq-scatter-scale">
                  <bdi>
                    {format(0)}–{format(max, currency)}
                  </bdi>
                </p>
                <svg
                  viewBox="0 0 340 195"
                  role="img"
                  aria-label={`${t.chart} · ${currency} · ${unit}`}
                >
                  <path d="M44 12 V152 H320" fill="none" stroke="currentColor" opacity=".45" />
                  <path
                    d="M44 82 H320 M182 12 V152"
                    fill="none"
                    stroke="currentColor"
                    opacity=".15"
                    strokeDasharray="3 5"
                  />
                  <text x="44" y="174" textAnchor="middle">
                    {format(0)}
                  </text>
                  <text x="312" y="174" textAnchor="end">
                    {format(maxArea)} {unit}
                  </text>
                  {plotted.map(({ point, x, y, label }, index) => (
                    <g key={point.point.entity.id}>
                      <circle cx={x} cy={y} r="5" />
                      <line
                        className="cq-point-leader"
                        x1={x}
                        y1={y}
                        x2={label.x}
                        y2={label.y - 4}
                      />
                      <text className="cq-point-label" x={label.x} y={label.y} textAnchor="middle">
                        {format(index + 1)}
                      </text>
                    </g>
                  ))}
                </svg>
                <ol>
                  {valid.map((point, index) => (
                    <li key={point.point.entity.id}>
                      <bdi>{format(index + 1)}</bdi>
                      <span>{point.card?.name[locale]}</span>
                    </li>
                  ))}
                </ol>
              </figure>
            );
          })}
          <div className="cq-table-scroll" tabIndex={0} role="region" aria-label={t.chart}>
            <table>
              <thead>
                <tr>
                  <th scope="col">{t.place}</th>
                  <th scope="col">{t.price}</th>
                  <th scope="col">{t.area}</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.point.entity.id}>
                    <th scope="row">{p.card?.name[locale] ?? t.unknown}</th>
                    <td>
                      <FactValue fact={p.price} locale={locale} />
                    </td>
                    <td>
                      <FactValue fact={p.area} locale={locale} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <details>
            <summary>{t.sources}</summary>
            {component.cards.map((card) => (
              <SourceEvidence key={card.id} sources={card.sources} locale={locale} />
            ))}
          </details>
        </section>
      );
    }
    case 'itinerary':
      return (
        <section className="cq-generated" data-component-kind={component.kind}>
          <h3>{t.itinerary}</h3>
          {component.mode === 'DEMO_ILLUSTRATION' && <p className="cq-fine">{t.illustrative}</p>}
          <ol className="cq-itinerary">
            {component.steps.map((step) => (
              <li key={step.id}>
                <bdi>{digits(step.time)}</bdi>
                <span>{step.title[locale]}</span>
              </li>
            ))}
          </ol>
          <SourceEvidence sources={component.sources} locale={locale} />
        </section>
      );
    case 'developer-card':
      return (
        <section className="cq-generated" data-component-kind={component.kind}>
          <p className="cq-eyebrow">{t.developer}</p>
          <h3>{component.name[locale]}</h3>
          {!component.facts.length && <p>{t.noFacts}</p>}
          <dl>
            {component.facts.map((fact) => (
              <div key={fact.id}>
                <dt>{factLabel(fact, locale)}</dt>
                <dd>
                  <FactValue fact={fact} locale={locale} />
                </dd>
              </div>
            ))}
          </dl>
          <SourceEvidence sources={component.sources} locale={locale} />
        </section>
      );
    case 'notice':
      return (
        <aside className="cq-notice" aria-label={t.notice} data-component-kind={component.kind}>
          <p>{component.text[locale]}</p>
          {component.code === 'NO_MATCHES' && (
            <button className="cq-action" type="button" onClick={onReviewRequirements}>
              {t.reviewRequirements}
              <ArrowUpRight aria-hidden="true" />
            </button>
          )}
        </aside>
      );
  }
}
