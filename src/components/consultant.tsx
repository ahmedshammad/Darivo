'use client';
import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUp, MessageCircle, X, Sparkles, Trash2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { Brief } from '@/src/server/ai/schema';
import type { PropertyDTO } from '@/src/server/db/properties';
import { AREAS, TYPES } from '@/src/lib/catalog';
import { PropertyCard } from './property-card';
type Message = {
  role: string;
  text: string;
  properties?: PropertyDTO[];
  results?: { kind: string; data?: Record<string, unknown> }[];
};
export function Consultant({
  docked = false,
  propertyId,
}: {
  docked?: boolean;
  propertyId?: string;
}) {
  const t = useTranslations(),
    locale = useLocale(),
    reduced = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([]),
    [brief, setBrief] = useState<Brief>({ filters: {} }),
    [input, setInput] = useState(propertyId ? `${t('askProperty')} ${propertyId}` : ''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    fetch('/api/v1/consultant')
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        if (active) {
          setMessages(data.messages);
          setBrief(data.brief);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (busy)
      bottom.current?.scrollIntoView({
        behavior: reduced ? 'instant' : 'smooth',
        block: 'nearest',
      });
  }, [messages, busy, reduced]);
  async function send(value = input) {
    if (!value.trim() || busy) return;
    setInput('');
    setBusy(true);
    setError('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: value },
      { role: 'assistant', text: '' },
    ]);
    try {
      const response = await fetch('/api/v1/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: value, locale }),
      });
      if (!response.ok || !response.body)
        throw new Error(response.status === 401 ? 'accessBody' : 'chatError');
      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value: bytes } = await reader.read();
        if (done) break;
        buffer += decoder.decode(bytes, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line);
          if (event.type === 'brief') setBrief(event.brief);
          if (event.type === 'error') setError(t(event.key));
          if (event.type === 'text')
            setMessages((prev) =>
              prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: m.text + event.text } : m)),
            );
          if (event.type === 'results')
            setMessages((prev) =>
              prev.map((m, i) => (i === prev.length - 1 ? { ...m, results: event.results } : m)),
            );
          if (event.type === 'properties')
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, properties: event.properties } : m,
              ),
            );
        }
      }
    } catch (e) {
      setError(t(e instanceof Error && e.message === 'accessBody' ? 'accessBody' : 'chatError'));
    } finally {
      setBusy(false);
    }
  }
  async function saveBrief(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next: Brief = { filters: { ...brief.filters } };
    const purpose = String(form.get('purpose'));
    if (purpose) next.purpose = purpose as Brief['purpose'];
    const timeline = String(form.get('timeline'));
    if (timeline) next.timeline = timeline;
    for (const key of ['community', 'type', 'status', 'maxPrice', 'bedrooms'] as const) {
      const value = String(form.get(key) ?? '');
      if (!value) delete next.filters[key];
      else
        Object.assign(next.filters, {
          [key]: ['maxPrice', 'bedrooms'].includes(key) ? Number(value) : value,
        });
    }
    const r = await fetch('/api/v1/brief', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    if (r.ok) {
      setBrief(next);
      setSaved(true);
    } else setError(t('errorBody'));
  }
  return (
    <div className={docked ? 'consultant-docked' : 'shell page'}>
      {!docked && (
        <div className="page-heading">
          <div>
            <p className="eyebrow">{t('chatEyebrow')}</p>
            <h1 className="search-title">{t('chatTitle')}</h1>
            <p className="muted">{t('chatIntro')}</p>
          </div>
          <button
            className="button button-ghost"
            onClick={async () => {
              const r = await fetch('/api/v1/consultant', { method: 'DELETE' });
              if (r.ok) setMessages([]);
              else setError(t('errorBody'));
            }}
          >
            <Trash2 size={15} />
            {t('deleteHistory')}
          </button>
        </div>
      )}
      <div className="consultant-layout">
        <section className="chat-panel">
          <div className="chat-history" role="log" aria-label={t('consultant')}>
            <div className="chat-message assistant">
              <span className="chat-avatar">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="eyebrow">{t('brand')}</p>
                <p>{t('chatWelcome')}</p>
              </div>
            </div>
            {!messages.length && (
              <div className="chat-suggestions">
                {['exampleDubai', 'exampleEgypt', 'exampleSea'].map((k) => (
                  <button key={k} onClick={() => send(t(k))}>
                    {t(k)}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message, i) => (
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`chat-turn ${message.role}`}
              >
                <div className={`chat-message ${message.role}`}>
                  {message.role === 'assistant' && (
                    <span className="chat-avatar">
                      <Sparkles size={17} />
                    </span>
                  )}
                  <p style={{ whiteSpace: 'pre-line' }}>{message.text || t('loading')}</p>
                </div>
                {message.results?.map((r, j) => (
                  <div className="panel stack small" key={j}>
                    {r.kind === 'investment' ? (
                      <>
                        <p>
                          {t('grossYield')}: {Number(r.data?.grossYield).toFixed(2)}%
                        </p>
                        <p>
                          {t('annualCashFlow')}:{' '}
                          {Number(r.data?.annualCashFlow).toLocaleString(locale)} AED
                        </p>
                        <p>{t('estimate')}</p>
                      </>
                    ) : (
                      <>
                        <p>
                          {t('areaAverage')}: {Number(r.data?.averageAedSqm).toLocaleString(locale)}{' '}
                          AED
                        </p>
                        <p>
                          {t('grossYield')}: {String(r.data?.yieldLow)}–{String(r.data?.yieldHigh)}%
                        </p>
                        <p>{String(r.data?.[locale === 'ar' ? 'notesAr' : 'notesEn'] ?? '')}</p>
                      </>
                    )}
                  </div>
                ))}
                {!!message.properties?.length && (
                  <>
                    <div className="chat-properties">
                      {message.properties.map((p) => (
                        <PropertyCard key={p.id} property={p} />
                      ))}
                    </div>
                    <div className="row chat-followups">
                      <Link
                        className="button button-outline"
                        href={`/${locale}/shortlists?save=${message.properties.map((p) => p.id).join(',')}`}
                      >
                        {t('saveProperty')}
                      </Link>
                      <Link
                        className="button button-ghost"
                        href={`/${locale}/compare?ids=${message.properties
                          .slice(0, 4)
                          .map((p) => p.id)
                          .join(',')}`}
                      >
                        {t('compare')}
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
            <div ref={bottom} />
          </div>
          {error && (
            <p className="error small" role="alert">
              {error} <Link href={`/${locale}/login`}>{t('signIn')}</Link>
            </p>
          )}
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor={docked ? 'dock-message' : 'message'}>
              {t('send')}
            </label>
            <textarea
              id={docked ? 'dock-message' : 'message'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatPlaceholder')}
              rows={2}
              maxLength={4000}
              required
            />
            <button className="button button-primary" disabled={busy} aria-label={t('send')}>
              <ArrowUp size={20} />
            </button>
          </form>
          <p className="chat-trust">
            <ShieldCheck size={12} />
            {t('chatTrust')}
          </p>
        </section>
        {!docked && (
          <aside className="panel brief-panel stack">
            <p className="eyebrow">{t('brief')}</p>
            <h3>{t('editBrief')}</h3>
            <p className="small muted">{t('briefIntro')}</p>
            <form className="stack" key={JSON.stringify(brief)} onSubmit={saveBrief}>
              <label>
                {t('purpose')}
                <select name="purpose" defaultValue={brief.purpose ?? ''}>
                  <option value="">{t('all')}</option>
                  {['residence', 'investment', 'holiday', 'golden_visa', 'relocation'].map((k) => (
                    <option value={k} key={k}>
                      {t(k === 'investment' ? 'investmentPurpose' : k)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('community')}
                <select name="community" defaultValue={brief.filters.community ?? ''}>
                  <option value="">{t('all')}</option>
                  {AREAS.map((a) => (
                    <option value={a[0]} key={a[0]}>
                      {locale === 'ar' ? a[4] : a[3]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label>
                  {t('type')}
                  <select name="type" defaultValue={brief.filters.type ?? ''}>
                    <option value="">{t('all')}</option>
                    {TYPES.map((v) => (
                      <option value={v} key={v}>
                        {t(v)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('bedrooms')}
                  <input
                    name="bedrooms"
                    type="number"
                    min="0"
                    max="20"
                    defaultValue={brief.filters.bedrooms ?? ''}
                  />
                </label>
              </div>
              <label>
                {t('maxPrice')} ({brief.filters.currency ?? 'AED'})
                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  defaultValue={brief.filters.maxPrice ?? ''}
                />
              </label>
              <label>
                {t('status')}
                <select name="status" defaultValue={brief.filters.status ?? ''}>
                  <option value="">{t('all')}</option>
                  <option value="ready">{t('ready')}</option>
                  <option value="off_plan">{t('off_plan')}</option>
                </select>
              </label>
              <label>
                {t('timeline')}
                <input name="timeline" maxLength={120} defaultValue={brief.timeline ?? ''} />
              </label>
              <button className="button button-outline">{t('save')}</button>
              {saved && (
                <p className="small" role="status">
                  {t('briefSaved')}
                </p>
              )}
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
export function ConsultantDock() {
  const t = useTranslations(),
    [open, setOpen] = useState(false);
  return (
    <div className="consultant-widget">
      {open && (
        <div className="dock-window">
          <div className="dock-heading">
            <span>{t('consultant')}</span>
            <button
              className="button button-ghost"
              aria-label={t('close')}
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <Consultant docked />
        </div>
      )}
      <button
        className="button button-primary dock-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <MessageCircle size={18} />
        {t('openConsultant')}
      </button>
    </div>
  );
}
