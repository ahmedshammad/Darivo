'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Mic,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  Plus,
  Check,
  Command,
  Layers,
  Waves,
} from 'lucide-react';
import { designCopy, type DesignLocale } from '@/messages/design';

export const DigitsContext = createContext(false);
export function formatDesignDigits(value: string | number, arabicIndic: boolean) {
  const western = String(value).replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
  return arabicIndic ? western.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]) : western;
}
export type EvidenceBasis = 'demo' | 'developer' | 'press' | 'listing';
export type BriefValue = {
  purpose: string;
  place: string;
  budget: string;
  timeline: string;
  priority: string;
  dealbreakers: string;
};
export type ProjectSpecimen = {
  id: string;
  name: string;
  location: string;
  basis: EvidenceBasis;
  amount?: number;
  currency?: string;
  reason: string;
  tradeoff: string;
};
export type SourceSpecimen = { title: string; url: string; asOf: string };
export type PaymentMilestone = { label: string; percent: number; timing: string };
export type PaletteCommand = { id: string; label: string; onSelect: () => void };

export function Price({
  amount,
  currency,
  locale,
  arabicIndic,
}: {
  amount: number;
  currency: string;
  locale: DesignLocale;
  arabicIndic?: boolean;
}) {
  const preference = useContext(DigitsContext);
  const digits = arabicIndic ?? preference;
  return (
    <bdi data-component="price" className="dv-price">
      {new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
        numberingSystem: digits ? 'arab' : 'latn',
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(amount)}
    </bdi>
  );
}
export function TrustBadge({ basis, locale }: { basis: EvidenceBasis; locale: DesignLocale }) {
  return (
    <span data-component="trust-badge" className={`dv-trust dv-trust-${basis}`}>
      {designCopy[locale][basis]}
    </span>
  );
}
export function SourceChip({ source, locale }: { source: SourceSpecimen; locale: DesignLocale }) {
  const digits = useContext(DigitsContext);
  const safe = /^https:\/\//.test(source.url);
  return (
    <span data-component="source-chip" className="dv-source">
      {safe ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          {source.title}
          <ArrowUpRight aria-hidden="true" />
        </a>
      ) : (
        <span>{source.title}</span>
      )}
      <span>
        {designCopy[locale].asOf} <bdi>{formatDesignDigits(source.asOf, digits)}</bdi>
      </span>
    </span>
  );
}
export function ConciergeComposer({
  locale,
  onSubmit,
  id: inputId,
}: {
  locale: DesignLocale;
  id?: string;
  onSubmit: (text: string) => void;
}) {
  const t = designCopy[locale];
  const [value, setValue] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const generatedId = useId();
  const id = inputId ?? generatedId;
  return (
    <div className="dv-composer-wrap" data-component="composer">
      <form
        className="dv-composer"
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) onSubmit(value.trim());
        }}
      >
        <label className="dv-sr" htmlFor={id}>
          {t.composerLabel}
        </label>
        <span className="dv-composer-mark" aria-hidden="true">
          ✧
        </span>
        <input
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t.composerPlaceholder}
          autoComplete="off"
        />
        <button
          type="button"
          className="dv-icon"
          aria-label={t.voice}
          onClick={() => {
            const browser = window as Window & {
              SpeechRecognition?: unknown;
              webkitSpeechRecognition?: unknown;
            };
            setVoiceStatus(
              browser.SpeechRecognition || browser.webkitSpeechRecognition
                ? t.voiceAvailable
                : t.voiceUnavailable,
            );
          }}
        >
          <Mic aria-hidden="true" />
        </button>
        <button type="submit" className="dv-send" aria-label={t.send} disabled={!value.trim()}>
          <ArrowRight aria-hidden="true" />
        </button>
      </form>
      <p className="dv-status" role="status">
        {voiceStatus}
      </p>
    </div>
  );
}
export function BriefPanel({
  locale,
  value,
  onChange,
  id,
}: {
  id?: string;
  locale: DesignLocale;
  value: BriefValue;
  onChange: (value: BriefValue) => void;
}) {
  const t = designCopy[locale];
  const prefix = useId();
  const keys: (keyof BriefValue)[] = [
    'purpose',
    'place',
    'budget',
    'timeline',
    'priority',
    'dealbreakers',
  ];
  return (
    <section
      id={id}
      data-component="brief"
      className="dv-brief"
      aria-labelledby={`${prefix}-title`}
    >
      <div className="dv-instrument-header">
        <h3 id={`${prefix}-title`}>{t.brief}</h3>
        <TrustBadge basis="demo" locale={locale} />
      </div>
      <div className="dv-brief-fields">
        {keys.map((key) => (
          <div className="dv-brief-field" key={key}>
            <label htmlFor={`${prefix}-${key}`}>{t[key]}</label>
            <textarea
              id={`${prefix}-${key}`}
              rows={1}
              value={value[key]}
              ref={(node) => {
                if (node) {
                  node.style.height = 'auto';
                  node.style.height = Math.max(38, node.scrollHeight) + 'px';
                }
              }}
              onChange={(event) => onChange({ ...value, [key]: event.target.value })}
            />
          </div>
        ))}
      </div>
      <p>{t.briefHint}</p>
    </section>
  );
}
export function ProjectCard({
  project,
  size = 'medium',
  locale,
  onSelect,
}: {
  project: ProjectSpecimen;
  size?: 'large' | 'medium' | 'small';
  locale: DesignLocale;
  onSelect?: () => void;
}) {
  const t = designCopy[locale];
  return (
    <article data-component="project-card" className={`dv-project dv-project-${size}`}>
      <div className="dv-project-cover" aria-hidden="true">
        <span>{locale === 'ar' ? 'دار' : 'DH'}</span>
        <small>{t.smallPrint}</small>
      </div>
      <div className="dv-project-content">
        <div className="dv-project-meta">
          <span>{project.location}</span>
          <TrustBadge basis={project.basis} locale={locale} />
        </div>
        <h3>{project.name}</h3>
        {project.amount !== undefined && project.currency && (
          <Price amount={project.amount} currency={project.currency} locale={locale} />
        )}
        <div className="dv-project-reasons">
          <span>{t.why}</span>
          <p>{project.reason}</p>
          <p className="dv-tradeoff">{project.tradeoff}</p>
        </div>
        {onSelect && (
          <button className="dv-text-button" onClick={onSelect}>
            {t.viewProject}
            <ArrowUpRight aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
export function LightColumn({
  height,
  match,
  locale,
}: {
  height: number;
  match: number;
  locale: DesignLocale;
}) {
  const digits = useContext(DigitsContext);
  const number = new Intl.NumberFormat(locale, { numberingSystem: digits ? 'arab' : 'latn' });
  const h = Math.max(10, Math.min(100, height));
  const score = Math.max(0, Math.min(100, match));
  return (
    <figure data-component="light-column" className="dv-column">
      <div className="dv-column-field" aria-hidden="true">
        <span className="dv-column-axis" />
        <span className="dv-column-light" style={{ height: `${h}%`, opacity: 0.5 + score / 200 }} />
        <span className="dv-column-ground" />
      </div>
      <figcaption>
        <span>{designCopy[locale].column}</span>
        <bdi>
          {designCopy[locale].match} {number.format(score)}%
        </bdi>
      </figcaption>
    </figure>
  );
}
export function LayerChip({
  children,
  active,
  onChange,
}: {
  children: ReactNode;
  active: boolean;
  onChange: () => void;
}) {
  return (
    <button
      data-component="layer-chip"
      className={`dv-layer ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      onClick={onChange}
    >
      {active ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
      {children}
    </button>
  );
}
export function ComparisonTable({
  locale,
  columns,
  rows,
}: {
  locale: DesignLocale;
  columns: string[];
  rows: { label: string; values: ReactNode[] }[];
}) {
  return (
    <div
      data-component="comparison-table"
      className="dv-comparison-scroll"
      role="region"
      aria-label={designCopy[locale].compare}
      tabIndex={0}
    >
      <table className="dv-comparison">
        <caption>
          {designCopy[locale].compare}
          <span className="dv-scroll-hint">
            {designCopy[locale].compareHint}
            <ArrowRight aria-hidden="true" />
          </span>
        </caption>
        <thead>
          <tr>
            <th scope="col">{designCopy[locale].attribute}</th>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function PaymentTimeline({
  locale,
  milestones,
  amount,
  currency,
}: {
  locale: DesignLocale;
  milestones: PaymentMilestone[];
  amount: number;
  currency: string;
}) {
  const digits = useContext(DigitsContext);
  const number = new Intl.NumberFormat(locale, { numberingSystem: digits ? 'arab' : 'latn' });
  const total = milestones.reduce((sum, item) => sum + item.percent, 0);
  const valid = Math.abs(total - 100) < 0.001;
  return (
    <section
      data-component="payment-timeline"
      className="dv-payment"
      aria-label={designCopy[locale].payment}
    >
      <div className="dv-instrument-header">
        <h3>{designCopy[locale].payment}</h3>
        <TrustBadge basis="demo" locale={locale} />
      </div>
      <ol>
        {milestones.map((milestone, index) => (
          <li key={`${milestone.label}-${index}`}>
            <span className="dv-payment-point" aria-hidden="true" />
            <span className="dv-payment-percent">
              <bdi>{number.format(milestone.percent)}%</bdi>
            </span>
            <h4>{milestone.label}</h4>
            <p>
              <bdi>{formatDesignDigits(milestone.timing, digits)}</bdi>
            </p>
            <Price
              amount={(amount * milestone.percent) / 100}
              currency={currency}
              locale={locale}
            />
          </li>
        ))}
      </ol>
      <div className="dv-payment-total">
        <span>
          {designCopy[locale].total} <bdi>{number.format(total)}%</bdi>
        </span>
        <Price amount={amount} currency={currency} locale={locale} />
      </div>
      <p className="dv-fine" role={valid ? undefined : 'alert'}>
        {valid ? designCopy[locale].indicative : designCopy[locale].invalidPlan}
      </p>
    </section>
  );
}
export function StatBlock({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div data-component="stat-block" className="dv-stat">
      <bdi>{value}</bdi>
      <span>{label}</span>
      <p>{note}</p>
    </div>
  );
}
function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);
  return {
    ref,
    onCancel: (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      onClose();
    },
    onClose,
  };
}
export function BottomSheet({
  open,
  onClose,
  locale,
  children,
}: {
  open: boolean;
  onClose: () => void;
  locale: DesignLocale;
  children: ReactNode;
}) {
  const t = designCopy[locale];
  const dialog = useDialog(open, onClose);
  const [expanded, setExpanded] = useState(false);
  const start = useRef<number | null>(null);
  const id = useId();
  return (
    <dialog
      {...dialog}
      data-component="bottom-sheet"
      className={`dv-sheet ${expanded ? 'is-expanded' : ''}`}
      aria-labelledby={`${id}-title`}
    >
      <div
        className="dv-sheet-drag"
        onPointerDown={(event) => {
          start.current = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (start.current !== null) {
            const delta = event.clientY - start.current;
            if (delta > 100) onClose();
            else if (delta < -40) setExpanded(true);
            start.current = null;
          }
        }}
      >
        <span aria-hidden="true" />
      </div>
      <div className="dv-sheet-controls">
        <button className="dv-text-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? t.collapse : t.expand}
          {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
        </button>
        <button className="dv-icon" onClick={onClose} aria-label={t.close}>
          <X aria-hidden="true" />
        </button>
      </div>
      <h2 id={`${id}-title`}>{t.sheetTitle}</h2>
      <p>{t.sheetBody}</p>
      <div className="dv-sheet-body">{children}</div>
    </dialog>
  );
}
export function CommandPalette({
  open,
  onClose,
  locale,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  locale: DesignLocale;
  commands: PaletteCommand[];
}) {
  const t = designCopy[locale];
  const dialog = useDialog(open, onClose);
  const [query, setQuery] = useState('');
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) search.current?.focus();
  }, [open]);
  const matches = commands.filter((command) =>
    command.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  function move(event: KeyboardEvent<HTMLElement>) {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const buttons = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    if (!buttons.length) return;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      current < 0
        ? event.key === 'ArrowDown'
          ? 0
          : buttons.length - 1
        : event.key === 'ArrowDown'
          ? (current + 1) % buttons.length
          : (current - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }
  return (
    <dialog
      {...dialog}
      data-component="command-palette"
      className="dv-palette"
      aria-labelledby={`${id}-title`}
    >
      <div className="dv-instrument-header">
        <h2 id={`${id}-title`}>{t.paletteTitle}</h2>
        <button className="dv-icon" onClick={onClose} aria-label={t.close}>
          <X aria-hidden="true" />
        </button>
      </div>
      <label className="dv-palette-search">
        <Search aria-hidden="true" />
        <span className="dv-sr">{t.palettePlaceholder}</span>
        <input
          ref={search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.palettePlaceholder}
          onKeyDown={move}
        />
      </label>
      <div ref={list} className="dv-command-list" onKeyDown={move}>
        {matches.map((command) => (
          <button
            key={command.id}
            onClick={() => {
              dialog.ref.current?.close();
              onClose();
              requestAnimationFrame(command.onSelect);
            }}
          >
            {command.label}
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
        {!matches.length && <p>{t.noCommands}</p>}
      </div>
      <span className="dv-fine">
        <kbd>↑</kbd> <kbd>↓</kbd> · <kbd>Enter</kbd> · <kbd>Esc</kbd>
      </span>
    </dialog>
  );
}
export function EmptyState({ locale, onAction }: { locale: DesignLocale; onAction: () => void }) {
  const t = designCopy[locale];
  return (
    <section data-component="empty-state" className="dv-empty">
      <Waves aria-hidden="true" />
      <h3>{t.emptyTitle}</h3>
      <p>{t.emptyBody}</p>
      <button className="dv-text-button" onClick={onAction}>
        {t.emptyAction}
        <ArrowRight aria-hidden="true" />
      </button>
    </section>
  );
}
export function LoadingState({ locale }: { locale: DesignLocale }) {
  return (
    <div data-component="loading-state" className="dv-loading" role="status">
      <div className="dv-loading-lines" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <span>{designCopy[locale].loading}</span>
    </div>
  );
}
export function ErrorState({ locale, onRetry }: { locale: DesignLocale; onRetry: () => void }) {
  const t = designCopy[locale];
  return (
    <section data-component="error-state" className="dv-error">
      <h3>{t.errorTitle}</h3>
      <p>{t.errorBody}</p>
      <button className="dv-text-button" onClick={onRetry}>
        <RotateCcw aria-hidden="true" />
        {t.retry}
      </button>
    </section>
  );
}
export { Command, Layers };
