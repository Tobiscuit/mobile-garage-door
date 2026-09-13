import React from 'react';
import type { Metadata } from 'next';
import { getDB } from "@/db";
import { services as servicesTable, serviceFeatures } from "@/db/schema";
import { getTranslations } from '@/lib/server-translations';
import { getCloudflareContext } from "@/lib/cloudflare";
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/JsonLd';
import { absoluteUrl, localizedPath, resolveLocale } from '@/lib/seo/site';
import { businessNode, graph, serviceNodes } from '@/lib/seo/structured-data';

const ICON_PATHS: Record<string, string> = {
    lightning: 'M13 10V3L4 14h7v7l9-11h-7z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    phone: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
};
const DEFAULT_ICON = 'M5 13l4 4L19 7';

/** Brands the page has always listed as "Authorised Dealer & Installer For" (unverified; copy.md §2). */
const DEALER_BRANDS = ['LiftMaster', 'Chamberlain', 'Amarr', 'Clopay'];

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = (await params) || { locale: 'en' };
    return pageMetadata({
        locale,
        path: '/services',
        title: { key: 'services_title' },
        description: { key: 'services_description' },
    });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = (await params) || { locale: 'en' } as any;
    const locale = resolvedParams.locale || 'en';
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const t = await getTranslations({ locale, namespace: 'services_page' });

    // Use lightweight select queries instead of relational queries
    // to avoid exceeding Cloudflare Worker resource limits (error 1101)
    let services: any[] = [];
    if (db) {
        const rawServices = await db.select().from(servicesTable).orderBy(servicesTable.order);
        const allFeatures = await db.select().from(serviceFeatures);
        services = rawServices.map(s => ({
            ...s,
            features: allFeatures.filter(f => f.serviceId === s.id)
        }));
    }

    const structuredData = graph([
        businessNode(t('intro')),
        ...serviceNodes(services, absoluteUrl(localizedPath(resolveLocale(locale), '/services'))),
    ]);

    return (
        <div className="page">
            <JsonLd data={structuredData} />

            <section className="section section--snug" aria-labelledby="services-title">
                <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-l)' } as React.CSSProperties}>
                    <div className="stack" style={{ '--stack-space': 'var(--space-s)' } as React.CSSProperties}>
                        <h1 id="services-title" className="title-1">{t('title')}</h1>
                        <p className="lead muted">{t('intro')}</p>
                    </div>

                    <div className="path-grid">
                        <section className="path-card surface-red" aria-labelledby="path-repair">
                            <p className="eyebrow">{t('rapid_response')}</p>
                            <h2 id="path-repair" className="title-2">{t('broken_title')}</h2>
                            <p>{t('broken_desc')}</p>
                            <p>
                                <a href="/contact?type=repair" className="button">
                                    {t('dispatch_cta')}
                                </a>
                            </p>
                        </section>

                        <section className="path-card surface-tint" aria-labelledby="path-new">
                            <p className="eyebrow">{t('project_design')}</p>
                            <h2 id="path-new" className="title-2">{t('new_title')}</h2>
                            <p>{t('new_desc')}</p>
                            <p>
                                <a href="/contact?type=install" className="button button--secondary">
                                    {t('start_project')}
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </section>

            <section className="section surface-tint" aria-labelledby="capabilities-heading">
                <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-l)' } as React.CSSProperties}>
                    <div className="split split--center">
                        <div className="stack" style={{ '--stack-space': 'var(--space-xs)' } as React.CSSProperties}>
                            <h2 id="capabilities-heading" className="title-2">{t('capabilities_heading')}</h2>
                            <p className="lead muted">{t('capabilities_desc')}</p>
                        </div>
                        <dl>
                            <div className="stat">
                                <dt>{t('repairs_label')}</dt>
                                <dd><span className="stat__value">{t('repairs_stat')}</span></dd>
                            </div>
                        </dl>
                    </div>

                    <div className="card-grid">
                        <ul className="card-grid__list">
                            {services.map((service: any, index: number) => (
                                <li key={index} className={`service-card${service.highlight ? ' service-card--featured' : ''}`}>
                                    <div className="service-card__head">
                                        <span className="service-card__icon">
                                            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_PATHS[service.icon] || DEFAULT_ICON} />
                                            </svg>
                                        </span>
                                        {service.category ? <span className="chip">{service.category}</span> : <span />}
                                    </div>
                                    <h3 className="service-card__title">{service.title}</h3>
                                    <p className="muted">{service.description}</p>
                                    <ul className="feature-list">
                                        {service.features?.map((item: any, i: number) => (
                                            <li key={i}>{item.feature}</li>
                                        ))}
                                    </ul>
                                    <a href={`/contact?service=${service.slug}`} className="service-card__cta button button--secondary button--block">
                                        {t('configure_service')}
                                        <span className="visually-hidden">: {service.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="section--snug surface-red brand-band" aria-labelledby="dealer-heading">
                <div className="wrap wrap--wide stack">
                    <h2 id="dealer-heading" className="eyebrow">{t('dealer_heading')}</h2>
                    <ul>
                        {DEALER_BRANDS.map((brand) => (
                            <li key={brand}>{brand}</li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
