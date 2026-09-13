'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { ContactHero } from '@/features/contact/ContactHero';
import { AddressAutocomplete } from '@/shared/ui/AddressAutocomplete';
import { ServiceAreaMap } from '@/shared/ui/ServiceAreaMap';
import { SquarePaymentModal } from '@/features/payment/SquarePaymentModal';
import { BUSINESS, TEL_HREF } from '@/lib/seo/site';

/*
 * Service request form. Redesigned markup only: the fields and their `name`s,
 * the handlers, the prefill and sessionStorage round-trips, the save-address
 * call, the Square payment modal and its amount, and every link destination
 * are unchanged. Labels are now associated with their controls.
 */

const ContactContent = () => {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const t = useTranslations('contact_page');

    // Determine Hero Type
    let heroType: 'repair' | 'install' | 'contractor' | 'general' = 'general';
    if (typeParam === 'repair') heroType = 'repair';
    if (typeParam === 'install') heroType = 'install';
    if (typeParam === 'contractor') heroType = 'contractor';

    const isFromPortal = searchParams.get('source') === 'portal';

    // State for urgency toggle
    const [urgency, setUrgency] = useState<'Standard' | 'Emergency'>('Standard');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [recentAddresses, setRecentAddresses] = useState<{ address: string; label: string | null }[]>([]);
    const [prefillLoaded, setPrefillLoaded] = useState(false);

    useEffect(() => {
        if (heroType === 'repair') {
            setUrgency('Emergency');
        } else {
            setUrgency('Standard');
        }
    }, [heroType]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        issue: '',
        scheduledTime: ''
    });

    // Smart prefill: fetch profile + addresses for logged-in users
    useEffect(() => {
        if (prefillLoaded) return;
        (async () => {
            try {
                const res = await fetch('/api/user/prefill', { credentials: 'include' });
                if (!res.ok) throw new Error('prefill failed');
                const data = await res.json();
                if (data.prefill) {
                    setFormData(prev => ({
                        ...prev,
                        name: prev.name || data.prefill.name,
                        email: prev.email || data.prefill.email,
                        phone: prev.phone || data.prefill.phone,
                        address: prev.address || data.prefill.lastAddress,
                    }));
                }
                if (data.recentAddresses?.length > 0) {
                    setRecentAddresses(data.recentAddresses);
                }
            } catch (e) {
                // Silent fail — non-logged-in users won't have data
            }

            // Restore form data saved before AI diagnosis round-trip
            try {
                const savedForm = sessionStorage.getItem('contactFormData');
                if (savedForm) {
                    const parsed = JSON.parse(savedForm);
                    setFormData(prev => ({ ...prev, ...parsed }));
                    sessionStorage.removeItem('contactFormData');
                }
            } catch {}

            // AI Diagnosis prefill from sessionStorage (overwrites issue field)
            try {
                const raw = sessionStorage.getItem('aiDiagnosis');
                if (raw) {
                    const diagnosis = JSON.parse(raw);
                    if (diagnosis.fromDiagnosis) {
                        setFormData(prev => ({
                            ...prev,
                            issue: diagnosis.issueDescription || prev.issue,
                        }));
                        if (diagnosis.urgency === 'emergency') {
                            setUrgency('Emergency');
                        }
                        sessionStorage.removeItem('aiDiagnosis');
                    }
                }
            } catch (e) {
                console.error('Failed to parse aiDiagnosis', e);
            }

            setPrefillLoaded(true);
        })();
    }, [prefillLoaded]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
        if (place.formatted_address) {
            setFormData(prev => ({ ...prev, address: place.formatted_address! }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Save the address for future prefill
        if (formData.address) {
            fetch('/api/user/save-address', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: formData.address }),
            }).catch(() => {});
        }
        // Open Payment Modal
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (paymentResult: any) => {
        // TODO: Create Service Request in Payload CMS
        console.log('Payment Successful:', paymentResult);
        setShowPaymentModal(false);
        setIsPaid(true);
        // alert('Payment Confirmed! Technician Dispatched.');
    };

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    const urgencyLabel = urgency === 'Emergency' ? t('emergency') : t('standard');

    if (isPaid) {
        return (
             <>
                <ContactHero type={heroType} />
                <section className="section section--snug">
                    <div className="wrap">
                        <div className="success-card" role="status">
                            <div className="success-card__icon">
                                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="title-2">{t('request_received')}</h2>
                            <p className="lead">
                                {t('success_intro', { address: formData.address || t('your_location') })}
                            </p>
                            <p className="muted">
                                {urgency === 'Emergency' ? t('success_emergency') : t('success_standard')}
                            </p>

                            <div className="status-box">
                                <span className="fine-print">{t('status_label')}</span>
                                <strong>{t('status_pending')}</strong>
                            </div>

                            {/* Map showing service area */}
                            <div className="w-full">
                                <ServiceAreaMap />
                            </div>

                            <p className="fine-print">
                                {t('priority_label')}: {urgencyLabel}
                            </p>
                            <a href="/portal" className="button">
                                {t('view_portal')}
                            </a>
                        </div>
                    </div>
                </section>
             </>
        );
    }

    return (
        <>
            <SquarePaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
                amount={99.00}
                customerDetails={{
                    ...formData,
                    urgency
                }}
            />

            <ContactHero type={heroType} />
            <section className="section section--snug surface-tint">
                <div className="wrap wrap--wide request-layout">
                    <div className="request-card">
                        <div className="stack" style={{ '--stack-space': 'var(--space-2xs)' } as React.CSSProperties}>
                            <h2 id="request-form-heading" className="title-2">{t('open_ticket')}</h2>
                            <p className="muted">{t('ticket_desc')}</p>
                        </div>

                        {/* Urgency Toggle */}
                        <div className="field">
                            <span id="urgency-label" className="field__label">{t('urgency_label')}</span>
                            <div className="urgency-toggle" role="group" aria-labelledby="urgency-label">
                                <button
                                    onClick={() => setUrgency('Standard')}
                                    className="urgency-toggle__option"
                                    aria-pressed={urgency === 'Standard'}
                                    type="button"
                                >
                                    {t('standard')}
                                </button>
                                <button
                                    onClick={() => setUrgency('Emergency')}
                                    className="urgency-toggle__option urgency-toggle__option--emergency"
                                    aria-pressed={urgency === 'Emergency'}
                                    type="button"
                                >
                                    {t('emergency')}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="request-form" data-request-form aria-labelledby="request-form-heading">
                            <div className="field">
                                <label className="field__label" htmlFor="request-name">{t('contact_name')}</label>
                                <input
                                    id="request-name"
                                    type="text"
                                    name="name"
                                    required
                                    autoComplete="name"
                                    value={formData.name}
                                    className="input"
                                    placeholder={t('full_name')}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="field-row">
                                <div className="field">
                                    <label className="field__label" htmlFor="request-email">{t('email_label')}</label>
                                    <input
                                        id="request-email"
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="email"
                                        value={formData.email}
                                        className="input"
                                        placeholder="john@example.com"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="field">
                                    <label className="field__label" htmlFor="request-phone">{t('phone_label')}</label>
                                    <input
                                        id="request-phone"
                                        type="tel"
                                        name="phone"
                                        required
                                        autoComplete="tel"
                                        value={formData.phone}
                                        className="input"
                                        placeholder="(555) 000-0000"
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="request-address">{t('location_label')}</label>
                                <AddressAutocomplete
                                    id="request-address"
                                    onAddressSelect={handleAddressSelect}
                                    className="input"
                                    placeholder={t('location_placeholder')}
                                    defaultValue={formData.address}
                                    recentAddresses={recentAddresses}
                                />
                            </div>

                            <div className="field">
                                <div className="field__label-row">
                                    <label className="field__label" htmlFor="request-issue">{t('issue_label')}</label>
                                    <a
                                        href="/diagnose"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            sessionStorage.setItem('contactFormData', JSON.stringify(formData));
                                            window.location.href = '/diagnose';
                                        }}
                                        className="text-link fine-print"
                                    >
                                        {t('ai_diagnosis')}
                                    </a>
                                </div>
                                <textarea
                                    id="request-issue"
                                    name="issue"
                                    rows={4}
                                    required
                                    value={formData.issue}
                                    className="input"
                                    placeholder={t('issue_placeholder')}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>

                            {/* Scheduling — Standard gets date picker, Emergency gets ASAP */}
                            <div className="field">
                                {urgency === 'Emergency' ? (
                                    <>
                                        <span className="field__label">{t('response_time') || 'Response Time'}</span>
                                        <div className="asap-note">
                                            <strong>{t('asap')}</strong>
                                            <span className="muted">{t('emergency_asap_note') || 'Our team will contact you within minutes.'}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label className="field__label" htmlFor="request-time">{t('preferred_time') || 'Preferred Date & Time'}</label>
                                        <input
                                            id="request-time"
                                            type="datetime-local"
                                            name="scheduledTime"
                                            value={formData.scheduledTime || ''}
                                            className="input"
                                            onChange={handleInputChange}
                                        />
                                    </>
                                )}
                            </div>

                            <button type="submit" className="button button--block">
                                {urgency === 'Emergency' ? t('submit_emergency') : t('submit_standard')}
                            </button>

                            <p className="fine-print text-center">
                                {t('secure_note')}
                            </p>
                        </form>
                    </div>

                    <div className="stack" style={{ '--stack-space': 'var(--space-m)' } as React.CSSProperties}>
                        <section className="contact-card surface-red" aria-labelledby="direct-contact-heading">
                            <h2 id="direct-contact-heading" className="title-3">{t('direct_contact')}</h2>
                            <a href={TEL_HREF} className="contact-card__link">
                                <span className="fine-print">{t('hotline')}</span>
                                <span className="contact-card__value">{BUSINESS.phoneDisplay}</span>
                            </a>
                            <a href="mailto:dispatch@mobilgarage.com" className="contact-card__link">
                                <span className="fine-print">{t('email_support')}</span>
                                <span>dispatch@mobilgarage.com</span>
                            </a>
                        </section>

                        {/* SERVICE AREA (Map Placeholder) */}
                        <ServiceAreaMap />
                    </div>
                </div>
            </section>
        </>
    );
};

function ContactLoading() {
    const t = useTranslations('contact_page');
    return (
        <div className="loading-state" role="status">
            <p className="muted">{t('loading')}</p>
        </div>
    );
}

export default function ContactPage() {
  return (
    <div className="page">
      <Suspense fallback={<ContactLoading />}>
        <ContactContent />
      </Suspense>
    </div>
  );
}
