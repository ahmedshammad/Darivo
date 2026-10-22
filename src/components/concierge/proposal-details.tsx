'use client';

import type { GroundedCard, WriteProposal } from '@/src/lib/concierge';
import { conciergeCopy, type ConciergeLocale } from '@/messages/concierge';
import { useConciergeNumbers } from './response-renderer';

/** The confirmation shows the validated write arguments, never an inferred appointment. */
export function ProposalDetails({
  proposal,
  cards,
  locale,
}: {
  proposal: WriteProposal;
  cards: GroundedCard[];
  locale: ConciergeLocale;
}) {
  const t = conciergeCopy[locale];
  const { digits } = useConciergeNumbers(locale);
  return (
    <dl className="cq-facts cq-proposal-details">
      {proposal.entities.length > 0 && (
        <div>
          <dt>{t.proposedHomes}</dt>
          <dd>
            <ul>
              {proposal.entities.map((entity) => {
                const card = cards.find((item) =>
                  entity.kind === 'unit'
                    ? item.kind === 'demo-unit' && item.unitId === entity.id
                    : item.projectId === entity.id,
                );
                return (
                  <li key={`${entity.kind}-${entity.id}`}>{card?.name[locale] ?? t.unknown}</li>
                );
              })}
            </ul>
          </dd>
        </div>
      )}
      {proposal.kind === 'save_to_portfolio' && (
        <div>
          <dt>{t.portfolioName}</dt>
          <dd>{proposal.details.name}</dd>
        </div>
      )}
      {proposal.kind === 'handoff_to_advisor' && (
        <div>
          <dt>{t.advisorReason}</dt>
          <dd dir="auto">{proposal.details.reason}</dd>
        </div>
      )}
      {proposal.kind === 'request_viewing' && (
        <>
          <div>
            <dt>{t.viewingMode}</dt>
            <dd>{proposal.details.modeOfViewing === 'video' ? t.video : t.inPerson}</dd>
          </div>
          <div>
            <dt>{t.requestedTimes}</dt>
            <dd>
              <bdi>{proposal.details.timezone}</bdi>
              <ul>
                {proposal.details.preferredSlots.map((slot) => (
                  <li key={slot}>
                    <bdi>
                      {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-GB', {
                        timeZone: proposal.details.timezone,
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        numberingSystem: /[٠-٩]/.test(digits('1')) ? 'arab' : 'latn',
                      }).format(new Date(slot))}
                    </bdi>
                  </li>
                ))}
              </ul>
              {!proposal.details.preferredSlots.length && t.unknown}
            </dd>
          </div>
        </>
      )}
      <div>
        <dt>{t.expires}</dt>
        <dd>
          <bdi>{digits(proposal.expiresAt)}</bdi>
        </dd>
      </div>
    </dl>
  );
}
