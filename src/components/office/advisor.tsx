'use client';
import { useEffect, useRef, useState } from 'react';
import type { AdvisorDTO, OfficePrivacy, ThreadDTO } from '@/src/lib/office';
import type { StorySummary } from '@/src/lib/story';
import { officeCopy, type OfficeLocale } from '@/messages/office';
import { usePreferences } from '@/src/components/preferences';
import { OfficeCard, OfficeRestriction, errorCopy, officeDate, officeRequest } from './shared';
export function OfficeAdvisor({
  advisor,
  locale,
  theme,
  privacy,
  privacyHref,
  intent,
  busy,
  mutate,
}: {
  advisor: AdvisorDTO | null;
  locale: OfficeLocale;
  theme: string;
  privacy: OfficePrivacy;
  privacyHref: string;
  intent?: StorySummary | null;
  busy: boolean;
  mutate: (url: string, method: string, body?: Record<string, unknown>) => Promise<boolean>;
}) {
  const t = officeCopy[locale],
    pref = usePreferences(),
    [thread, setThread] = useState<ThreadDTO | null>(null),
    [error, setError] = useState(''),
    [body, setBody] = useState(''),
    [sending, setSending] = useState(false),
    [notice, setNotice] = useState('');
  const [enquiry, setEnquiry] = useState(
    intent ? `${t.enquiryDefault} ${intent.name[locale]}.` : '',
  );
  const pending = useRef(false),
    requestKey = useRef<{ body: string; id: string } | null>(null);
  useEffect(() => {
    if (!advisor) return;
    const controller = new AbortController();
    officeRequest<ThreadDTO>(
      `/api/v1/office/threads/${advisor.threadId}/messages`,
      'GET',
      undefined,
      controller.signal,
    )
      .then(setThread)
      .catch((e) => {
        if (!controller.signal.aborted) {
          setThread(null);
          setError(errorCopy(e, locale));
        }
      });
    return () => controller.abort();
  }, [advisor, locale]);
  const blocked = privacy.doNotSave || privacy.doNotShare;
  if (!advisor)
    return (
      <section className="of-panel">
        <h2>{t.advisor}</h2>
        <p>{t.noAdvisor}</p>
        <p className="of-muted">{t.noAdvisorBody}</p>
      </section>
    );
  return (
    <section className="of-advisor-layout">
      <div className="of-advisor-profile">
        <p className="of-eyebrow">{t.advisor}</p>
        <h2>{advisor.name[locale]}</h2>
        <p className="of-badge">{t.demoAdvisor}</p>
        <p>
          {t.declared}: {t.availabilityStates[advisor.availability]}
        </p>
        <p className="of-fine">
          {t.updated}:{' '}
          {advisor.availabilityUpdatedAt ? (
            <time dateTime={advisor.availabilityUpdatedAt}>
              {officeDate(
                advisor.availabilityUpdatedAt,
                locale,
                'Asia/Dubai',
                pref.arabicIndicDigits,
              )}{' '}
              · {t.zones['Asia/Dubai']}
            </time>
          ) : (
            t.unknown
          )}
        </p>
        <p className="of-muted">{t.noPresence}</p>
      </div>
      <div>
        {blocked && <OfficeRestriction locale={locale} href={privacyHref} />}
        {intent?.kind === 'REAL_REFERENCE_PROJECT' && (
          <section className="of-panel" data-testid="office-enquiry">
            <h2>{t.enquiry}</h2>
            <h3>{intent.name[locale]}</h3>
            <p>{t.enquiryIntro}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await mutate('/api/v1/project-enquiries', 'POST', {
                    projectId: intent.entity.id,
                    message: enquiry,
                  })
                ) {
                  setNotice(t.enquirySent);
                  try {
                    setThread(
                      await officeRequest<ThreadDTO>(
                        `/api/v1/office/threads/${advisor.threadId}/messages`,
                      ),
                    );
                  } catch (error) {
                    setError(errorCopy(error, locale));
                  }
                }
              }}
            >
              <label>
                {t.message}
                <textarea
                  required
                  maxLength={2000}
                  value={enquiry}
                  onChange={(e) => setEnquiry(e.target.value)}
                />
              </label>
              <button className="of-primary" disabled={blocked || busy}>
                {t.send}
              </button>
            </form>
          </section>
        )}
        <section className="of-panel" aria-labelledby="of-thread-title">
          <h2 id="of-thread-title">{t.thread}</h2>
          <p className="of-muted">{t.threadIntro}</p>
          {error && <p role="alert">{error}</p>}
          {!thread ? (
            <p role="status">{t.loading}</p>
          ) : (
            <>
              {thread.nextCursor && (
                <button
                  onClick={async () => {
                    try {
                      const older = await officeRequest<ThreadDTO>(
                        `/api/v1/office/threads/${advisor.threadId}/messages?cursor=${encodeURIComponent(thread.nextCursor!)}`,
                      );
                      setThread((current) =>
                        current
                          ? {
                              ...older,
                              messages: [
                                ...new Map(
                                  [...older.messages, ...current.messages].map((m) => [m.id, m]),
                                ).values(),
                              ],
                            }
                          : older,
                      );
                    } catch (e) {
                      setError(errorCopy(e, locale));
                    }
                  }}
                >
                  {t.older}
                </button>
              )}
              <ol className="of-messages" aria-label={t.thread}>
                {thread.messages.map((m) => (
                  <li className={m.author === 'CLIENT' ? 'of-message-own' : ''} key={m.id}>
                    <div className="of-message-meta">
                      <strong>{m.author === 'CLIENT' ? t.you : advisor.name[locale]}</strong>
                      <time dateTime={m.createdAt}>
                        {officeDate(m.createdAt, locale, 'Asia/Dubai', pref.arabicIndicDigits)} ·{' '}
                        {t.zones['Asia/Dubai']}
                      </time>
                    </div>
                    <p className="of-message-body">{m.body}</p>
                    {m.attachments.length > 0 && (
                      <details>
                        <summary>{t.attachments}</summary>
                        {m.attachments.map((s) => (
                          <OfficeCard key={s.entity.id} story={s} locale={locale} theme={theme} />
                        ))}
                      </details>
                    )}
                  </li>
                ))}
              </ol>
              {!thread.messages.length && <p>{t.noMessages}</p>}
              {thread.archived ? (
                <p>{t.archived}</p>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (pending.current || blocked) return;
                    pending.current = true;
                    setSending(true);
                    setError('');
                    const sentBody = body.trim();
                    if (requestKey.current?.body !== sentBody)
                      requestKey.current = { body: sentBody, id: crypto.randomUUID() };
                    try {
                      const result = await officeRequest<ThreadDTO>(
                        `/api/v1/office/threads/${advisor.threadId}/messages`,
                        'POST',
                        { body: sentBody, attachments: [], clientRequestId: requestKey.current.id },
                      );
                      setThread(result);
                      setBody((current) => (current === body ? '' : current));
                      requestKey.current = null;
                      setNotice(t.sent);
                    } catch (error) {
                      setError(errorCopy(error, locale));
                    } finally {
                      pending.current = false;
                      setSending(false);
                    }
                  }}
                >
                  <label>
                    {t.message}
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                      maxLength={4000}
                    />
                  </label>
                  <button className="of-primary" disabled={blocked || sending}>
                    {sending ? t.sending : t.send}
                  </button>
                </form>
              )}
            </>
          )}
          {notice && <p role="status">{notice}</p>}
        </section>
      </div>
    </section>
  );
}
