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
        <div className="hero-cta-wrapper">
          <Link to="/onboarding" className="btn btn-primary hero-cta-btn">
            {t('hero.cta')}
          </Link>
          <span className="hero-guarantee">{t('hero.guarantee')}</span>
        </div>
      </section>

      <section className="marquee-wrapper">
        <div className="marquee-track left">
          {[...topImages, ...topImages].map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      </section>
      <section className="marquee-wrapper marquee-bottom">
        <div className="marquee-track right">
          {[...bottomImages, ...bottomImages].map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      </section>

      <section className="container section" id="product">
        <h2 className="landing-stats-headline">
          {t('stats.headline')}
        </h2>
        <div className="landing-stats-row">
          <div className="landing-stat-item">
            <div className="landing-stat-val">10M+</div>
            <div className="landing-stat-label">
              {t('stats.questions')}
            </div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-val">94%</div>
            <div className="landing-stat-label">
              {t('stats.resolution')}
            </div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-val">1.2s</div>
            <div className="landing-stat-label">
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
        <h2 className="landing-how-headline">
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

      <section className="container section landing-cta-section">
        <h2 className="landing-cta-title">{t('cta.title')}</h2>
        <Link to="/onboarding" className="btn btn-primary landing-cta-btn">
          {t('cta.button')}
        </Link>
        <p className="landing-cta-sub">{t('cta.sub')}</p>
      </section>
    </main>
  );
}