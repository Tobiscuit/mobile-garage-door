import React from 'react';
import type { Metadata } from 'next';
import { getDB } from "@/db";
import { settings as settingsTable, settingStats, settingValues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTranslations } from '@/lib/server-translations';
import { getCloudflareContext } from "@/lib/cloudflare";
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/JsonLd';
import { BUSINESS, TEL_HREF } from '@/lib/seo/site';
import { businessNode, graph } from '@/lib/seo/structured-data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = (await params) || { locale: 'en' };
    return pageMetadata({
        locale,
        path: '/about',
        title: { key: 'about_title' },
        description: { key: 'about_description' },
    });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = (await params) || { locale: 'en' } as any;
    const locale = resolvedParams.locale || 'en';
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const t = await getTranslations({ locale, namespace: 'about_page' });

    // Use lightweight select queries instead of relational queries
    // to avoid exceeding Cloudflare Worker resource limits (error 1101)
    let settingsObj = {
        missionStatement: "To provide fast, honest, and expert garage door service to every homeowner and contractor in our community—ensuring no one is ever left stranded with a broken door.",
        stats: [] as any[],
        values: [] as any[],
    };

    if (db) {
        // Only the columns this page shows. The settings row also holds the
        // dashboard's licence, insurance and BBB fields; Tobias confirmed those
        // claims aren't real, so they're never read here (copy.md §2).
        const [settingsRow] = await db
            .select({ id: settingsTable.id, missionStatement: settingsTable.missionStatement })
            .from(settingsTable)
            .limit(1);
        const stats = settingsRow
            ? await db.select().from(settingStats).where(eq(settingStats.settingId, settingsRow.id))
            : [];
        const values = settingsRow
            ? await db.select().from(settingValues).where(eq(settingValues.settingId, settingsRow.id))
            : [];

        settingsObj = {
            missionStatement: settingsRow?.missionStatement || settingsObj.missionStatement,
            stats,
            values,
        };
    }

    const settings = settingsObj;

    return (
        <div className="page">
            <JsonLd data={graph([businessNode(settings.missionStatement)])} />

            <section className="section section--snug" aria-labelledby="about-title">
                <div className="wrap wrap--wide split split--center">
                    <div className="stack">
                        <p className="eyebrow">{t('since')}</p>
                        <h1 id="about-title" className="title-1">{t('heading_1')}</h1>
                        <p className="title-3 accent">{t('heading_2')}</p>
                        <p className="lead">{settings.missionStatement}</p>
                    </div>

                    {settings.stats?.length > 0 && (
                        <dl className="stat-grid stat-grid--pair">
                            {settings.stats.map((stat: any, index: number) => (
                                <div key={index} className="stat">
                                    <dt>{stat.label}</dt>
                                    <dd><span className="stat__value">{stat.value}</span></dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </section>

            <section className="section surface-tint" aria-labelledby="standard-heading">
                <div className="wrap wrap--wide split">
                    <div className="stack">
                        <h2 id="standard-heading" className="title-2">{t('standard_heading')}</h2>
                        <p className="lead muted">{t('standard_desc')}</p>
                    </div>

                    {settings.values?.length > 0 && (
                        <ol className="values-list">
                            {settings.values.map((value: any, index: number) => (
                                <li key={index}>
                                    <div className="stack" style={{ '--stack-space': 'var(--space-3xs)' } as React.CSSProperties}>
                                        <h3 className="title-4">{value.title}</h3>
                                        <p className="muted">{value.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>

            {/* Confirmed facts only. This section used to show licence, insurance, IDA and BBB claims that aren't real. */}
            <section className="section" aria-labelledby="facts-heading">
                <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-l)' } as React.CSSProperties}>
                    <div className="stack" style={{ '--stack-space': 'var(--space-xs)' } as React.CSSProperties}>
                        <h2 id="facts-heading" className="title-2">{t('facts_heading')}</h2>
                        <p className="lead muted">{t('facts_lead')}</p>
                    </div>
                    <dl className="tile-grid">
                        <div className="tile">
                            <dt>{t('emergency_label')}</dt>
                            <dd>{t('emergency_value')}</dd>
                        </div>
                        <div className="tile">
                            <dt>{t('phone_label')}</dt>
                            <dd>
                                <a href={TEL_HREF} className="text-link">{BUSINESS.phoneDisplay}</a>
                            </dd>
                        </div>
                        <div className="tile">
                            <dt>{t('area_label')}</dt>
                            <dd>{t('area_value')}</dd>
                        </div>
                        <div className="tile">
                            <dt>{t('since_label')}</dt>
                            <dd>{BUSINESS.foundingYear}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            <section className="section--snug surface-red" aria-labelledby="about-cta">
                <div className="wrap wrap--wide cluster cluster--between">
                    <h2 id="about-cta" className="title-2">{t('cta_heading')}</h2>
                    <div className="cluster">
                        <a href="/contact" className="button">
                            {t('cta_button')}
                        </a>
                        <a href={TEL_HREF} className="text-link">
                            {t('call_cta', { phone: BUSINESS.phoneDisplay })}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
