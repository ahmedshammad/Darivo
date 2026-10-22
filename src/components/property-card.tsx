'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight, BedDouble, Maximize, ShieldCheck } from 'lucide-react';
import type { PropertyDTO } from '@/src/server/db/properties';
import { size } from '@/src/lib/catalog';
import { usePreferences } from './preferences';
import { Price } from './price';
export function PropertyCard({ property: p }: { property: PropertyDTO }) {
  const locale = useLocale(),
    t = useTranslations(),
    pref = usePreferences();
  const tr = p.translations.find((x) => x.locale === locale)!;
  return (
    <article className="property-card" data-property-id={p.id}>
      <Link href={`/${locale}/properties/${p.id}`} className="property-art">
        <Image
          src={p.media[0]?.url ?? '/art/property-0.svg'}
          alt={locale === 'ar' ? (p.media[0]?.altAr ?? '') : (p.media[0]?.altEn ?? '')}
          fill
          sizes="(max-width:650px) 88vw, (max-width:1000px) 44vw, 30vw"
          unoptimized
        />
        <span className="property-badge">{t(p.status)}</span>
        <span className="property-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="property-copy">
        <p className="eyebrow">{locale === 'ar' ? p.community.nameAr : p.community.nameEn}</p>
        <Link href={`/${locale}/properties/${p.id}`}>
          <h3>{tr.title}</h3>
        </Link>
        <Price className="property-price" property={p} />
        <div className="property-meta">
          <span>
            <BedDouble size={15} />
            {p.bedrooms} {t('beds')}
          </span>
          <span>
            <Maximize size={14} />
            {size(p.areaSqm, pref.unit, locale, pref.arabicIndicDigits)} {t(pref.unit)}
          </span>
          <span>{t(p.type)}</span>
        </div>
        <div className="property-proof">
          <ShieldCheck size={13} />
          <span>{t(p.verification === 'VERIFIED' ? 'verifiedProperty' : p.verification)}</span>
        </div>
        <p className="small muted">{t('matchReason')}</p>
      </div>
    </article>
  );
}
