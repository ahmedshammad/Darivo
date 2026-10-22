'use client';

import dynamic from 'next/dynamic';
import { useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';

function Loading() {
  const t = useTranslations();
  return (
    <div className="consultant-widget">
      <button className="button button-primary dock-toggle" disabled>
        <span role="status">{t('loading')}</span>
      </button>
    </div>
  );
}
const Dock = dynamic(() => import('./consultant').then((module) => module.ConsultantDock), {
  ssr: false,
  loading: Loading,
});
const subscribe = () => () => {};
export function ConsultantLauncher() {
  const t = useTranslations();
  const interactive = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [activated, setActivated] = useState(false);
  return activated ? (
    <Dock initialOpen />
  ) : (
    <div className="consultant-widget">
      <button
        className="button button-primary dock-toggle"
        aria-expanded="false"
        aria-busy={!interactive}
        disabled={!interactive}
        onClick={() => setActivated(true)}
      >
        <MessageCircle size={18} />
        {t('openConsultant')}
      </button>
    </div>
  );
}
