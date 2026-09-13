import React from 'react';
import { getTranslations } from '@/lib/server-translations';

const ICONS: Record<string, React.ReactNode> = {
  shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  tag: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
  clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
};

/** The four promises, on a red band. Server component; claims unchanged (copy.md tier B). */
const ValueStack = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'value_stack' });

  const items = [
    { title: t('licensed_title'), desc: t('licensed_desc'), icon: 'shield' },
    { title: t('fees_title'), desc: t('fees_desc'), icon: 'tag' },
    { title: t('window_title'), desc: t('window_desc'), icon: 'clock' },
    { title: t('background_title'), desc: t('background_desc'), icon: 'user' },
  ];

  return (
    <section className="section surface-red" aria-labelledby="promises-heading">
      <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-l)' } as React.CSSProperties}>
        <div className="stack">
          <p className="eyebrow">{t('badge')}</p>
          <h2 id="promises-heading" className="title-2">{t('title')}</h2>
          <p className="lead">{t('desc')}</p>
          <p>
            <a href="/contact" className="text-link">{t('sla_link')}</a>
          </p>
        </div>

        <ul className="promise-list">
          {items.map((item) => (
            <li key={item.icon} className="promise">
              <svg aria-hidden="true" width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {ICONS[item.icon]}
              </svg>
              <h3 className="promise__title">{item.title}</h3>
              <p>{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ValueStack;
