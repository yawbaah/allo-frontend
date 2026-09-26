import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export default function Pricing() {
  const { t } = useTranslation();

  const tiers = [
    {
      key: 'starter',
      name: t('pricing.starter.name'),
      priceUsd: '$29',
      priceEur: '€27',
      description: t('pricing.starter.desc'),
      cta: t('pricing.starter.cta'),
      highlighted: false,
      features: [t('pricing.f1'), t('pricing.f2'), t('pricing.f3'), t('pricing.f4'), t('pricing.f5'), t('pricing.f6')],
      enterprise: false,
    },
    {
      key: 'growth',
      name: t('pricing.growth.name'),
      priceUsd: '$99',
      priceEur: '€92',
      description: t('pricing.growth.desc'),
      cta: t('pricing.growth.cta'),
      highlighted: true,
      features: [
        t('pricing.f7'),
        t('pricing.f8'),
        t('pricing.f9'),
        t('pricing.f10'),
        t('pricing.f11'),
        t('pricing.f12'),
        t('pricing.f13'),
      ],
      enterprise: false,
    },
    {
      key: 'business',
      name: t('pricing.business.name'),
      priceUsd: '$299',
      priceEur: '€279',
      description: t('pricing.business.desc'),
      cta: t('pricing.business.cta'),
      highlighted: false,
      features: [
        t('pricing.f14'),
        t('pricing.f15'),
        t('pricing.f16'),
        t('pricing.f17'),
        t('pricing.f18'),
        t('pricing.f19'),
        t('pricing.f20'),
      ],
      enterprise: false,
    },
    {
      key: 'enterprise',
      name: t('pricing.enterprise.name'),
      priceUsd: 'Custom',
      priceEur: '',
      description: t('pricing.enterprise.desc'),
      cta: t('pricing.enterprise.cta'),
      highlighted: false,
      features: [
        t('pricing.f21'),
        t('pricing.f22'),
        t('pricing.f23'),
        t('pricing.f24'),
        t('pricing.f25'),
        t('pricing.f26'),
        t('pricing.f27'),
      ],
      enterprise: true,
    },
  ];

  const faqs = [
    { q: t('pricing.faq1.q'), a: t('pricing.faq1.a') },
    { q: t('pricing.faq2.q'), a: t('pricing.faq2.a') },
    { q: t('pricing.faq3.q'), a: t('pricing.faq3.a') },
    { q: t('pricing.faq4.q'), a: t('pricing.faq4.a') },
    { q: t('pricing.faq5.q'), a: t('pricing.faq5.a') },
  ];

  return (
    <main>
      <section className="container" style={{ padding: '10rem 2rem 4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1rem' }}>
          {t('pricing.title')}
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
          {t('pricing.subtitle')}
        </p>
      </section>

      <section className="container" style={{ paddingBottom: '6rem' }}>
        <div className="pricing-grid">
          {tiers.map((tier) => (
            <div key={tier.name} className={`pricing-card ${tier.highlighted ? 'highlighted' : ''}`}>
              {tier.highlighted && <div className="pricing-badge">{t('pricing.popular')}</div>}
              <h3 className="pricing-name">{tier.name}</h3>
              <div className="pricing-price">
                <span className="price-value">{tier.priceUsd}</span>
                {tier.priceEur && <span className="price-eur">/ {tier.priceEur}</span>}
                {tier.priceUsd !== 'Custom' && (
                  <span className="price-period">{t('pricing.perMonth')}</span>
                )}
              </div>
              <p className="pricing-description">{tier.description}</p>
              <Link
                to={tier.enterprise ? 'mailto:ernestbaah478@gmail.com' : `/onboarding?plan=${tier.key}`}
                className={`btn ${tier.highlighted ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  width: '100%',
                  marginBottom: '2rem',
                  border: tier.highlighted ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {tier.cta}
              </Link>
              <ul className="pricing-features">
                {tier.features.map((f) => (
                  <li key={f}>
                    <Check size={16} strokeWidth={1.75} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '8rem' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>{t('pricing.faqTitle')}</h2>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {faqs.map((f) => (
            <div key={f.q} className="faq-item">
              <h4 className="faq-q">{f.q}</h4>
              <p className="faq-a">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="container"
        style={{ padding: '6rem 2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}
      >
        <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>{t('pricing.ctaTitle')}</h2>
        <Link to="/onboarding" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
          {t('pricing.ctaButton')}
        </Link>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
          {t('pricing.ctaSub')}
        </p>
      </section>
    </main>
  );
}