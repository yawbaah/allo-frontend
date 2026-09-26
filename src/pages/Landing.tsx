import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';

const topImages = [
  'https://images.megapixl.com/mpt/91070562520.jpg?h=220',
  'https://images.megapixl.com/mpt/869147644715.jpg?h=220',
  'https://images.megapixl.com/mpt/010549773830.jpg?h=220',
  'https://images.megapixl.com/mpt/115941338740.jpg?h=220',
  'https://images.megapixl.com/mpt/812702988510.jpg?h=220',
];

const bottomImages = [
  'https://images.megapixl.com/mpt/966982697525.jpg?h=220',
  'https://images.megapixl.com/mpt/861920903915.jpg?h=220',
  'https://images.megapixl.com/mpt/810177362810.jpg?h=220',
  'https://images.megapixl.com/mpt/869233933915.jpg?h=220',
  'https://images.megapixl.com/mpt/96763059825.jpg?h=220',
];

export default function Landing() {
  const { t } = useTranslation();

  return (
    <main>
      <section className="container hero">
        <h1>{t('hero.title')}</h1>
        <p>{t('hero.subtitle')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Link to="/onboarding" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            {t('hero.cta')}
          </Link>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('hero.guarantee')}</span>
        </div>
      </section>

      <section className="marquee-wrapper">
        <div className="marquee-track left">
          {[...topImages, ...topImages].map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      </section>
      <section className="marquee-wrapper" style={{ marginTop: '1rem', paddingBottom: '4rem' }}>
        <div className="marquee-track right">
          {[...bottomImages, ...bottomImages].map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      </section>

      <section className="container section" style={{ textAlign: 'center' }} id="product">
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '4rem',
            maxWidth: '800px',
            margin: '0 auto 4rem',
          }}
        >
          {t('stats.headline')}
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(2rem, 6vw, 6rem)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 300 }}>10M+</div>
            <div
              style={{
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.8rem',
              }}
            >
              {t('stats.questions')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 300 }}>94%</div>
            <div
              style={{
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.8rem',
              }}
            >
              {t('stats.resolution')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 300 }}>1.2s</div>
            <div
              style={{
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.8rem',
              }}
            >
              {t('stats.response')}
            </div>
          </div>
        </div>
      </section>

      <section className="container section" id="solutions">
        <div className="grid-3">
          <div className="feature-card">
            <h3>{t('feat.ingest.title')}</h3>
            <p>{t('feat.ingest.desc')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('feat.code.title')}</h3>
            <p>{t('feat.code.desc')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('feat.handoff.title')}</h3>
            <p>{t('feat.handoff.desc')}</p>
          </div>
        </div>
      </section>

      <section className="container section" id="how">
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '3.5rem', textAlign: 'center' }}>
          {t('how.title')}
        </h2>
        <div className="how-grid">
          <div className="how-step">
            <div className="how-num">01</div>
            <h3>{t('how.1.title')}</h3>
            <p>{t('how.1.desc')}</p>
          </div>
          <div className="how-step">
            <div className="how-num">02</div>
            <h3>{t('how.2.title')}</h3>
            <p>{t('how.2.desc')}</p>
          </div>
          <div className="how-step">
            <div className="how-num">03</div>
            <h3>{t('how.3.title')}</h3>
            <p>{t('how.3.desc')}</p>
          </div>
          <div className="how-step">
            <div className="how-num">04</div>
            <h3>{t('how.4.title')}</h3>
            <p>{t('how.4.desc')}</p>
          </div>
        </div>
      </section>

      <section
        className="container section"
        style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)' }}
      >
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '2rem' }}>{t('cta.title')}</h2>
        <Link to="/onboarding" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
          {t('cta.button')}
        </Link>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>{t('cta.sub')}</p>
      </section>
    </main>
  );
}