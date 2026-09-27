import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { apiRequest, setTokens } from '../lib/api';
import { setUser } from '../lib/auth';
import { useTranslation } from '../lib/i18n';
import LangSelect from '../components/LangSelect';
import ThemeToggle from '../components/ThemeToggle';

export default function Onboarding() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan') || 'starter';

  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [website, setWebsite] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1 || step === 2) {
      setStep(step + 1);
      return;
    }

    if (step === 3) {
      setLoading(true);
      try {
        await apiRequest('/auth/register/', {
          method: 'POST',
          body: JSON.stringify({
            company_name: company,
            email,
            password,
            industry,
            size,
            website_url: website,
            plan: planParam,
          }),
        });
        setStep(4);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 4) {
      setLoading(true);
      try {
        const response = await apiRequest<{ tokens: { access: string; refresh: string }; user: any }>('/auth/verify-email/', {
          method: 'POST',
          body: JSON.stringify({ email, code }),
        });

        setTokens(response.tokens.access, response.tokens.refresh);
        setUser(response.user);
        
        // Send user directly to billing page to pay for their selected plan
        navigate('/dashboard/billing');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const titles = [t('onboard.s1'), t('onboard.s2'), t('onboard.s3'), t('onboard.s4')];

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                padding: '0.35rem 0.65rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                textDecoration: 'none',
                background: 'var(--hover-bg)',
              }}
            >
              <LogIn size={13} /> Log In
            </Link>
            <ThemeToggle compact />
            <LangSelect compact />
          </div>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>{titles[step - 1]}</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem' }}>
          {t('onboard.step', { n: step })}
        </p>

        <form onSubmit={handleNext}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label>{t('onboard.company')}</label>
                <input required type="text" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t('onboard.email')}</label>
                <input required type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t('onboard.password')}</label>
                <input required type="password" className="form-input" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label>{t('onboard.industry')}</label>
                <select required className="form-input" style={{ appearance: 'none' }} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="">{t('onboard.industry.placeholder')}</option>
                  <option value="saas">{t('onboard.ind.saas')}</option>
                  <option value="ecommerce">{t('onboard.ind.ecom')}</option>
                  <option value="healthcare">{t('onboard.ind.health')}</option>
                  <option value="education">{t('onboard.ind.edu')}</option>
                  <option value="finance">{t('onboard.ind.fin')}</option>
                  <option value="other">{t('onboard.ind.other')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('onboard.size')}</label>
                <select required className="form-input" style={{ appearance: 'none' }} value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="">{t('onboard.size.placeholder')}</option>
                  <option value="1-10">{t('onboard.size.1')}</option>
                  <option value="11-50">{t('onboard.size.2')}</option>
                  <option value="51-200">{t('onboard.size.3')}</option>
                  <option value="200+">{t('onboard.size.4')}</option>
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label>{t('onboard.website')}</label>
                <input required type="url" className="form-input" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {t('onboard.website.help')}
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('onboard.code.help')} <strong style={{ color: '#fff' }}>{email}</strong>
              </p>
              <div className="form-group">
                <input
                  required
                  type="text"
                  className="form-input"
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' }}
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
            </>
          )}

          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing…' : step === 4 ? t('onboard.complete') : t('onboard.continue')}
          </button>

          {step > 1 ? (
            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: '0.75rem', border: '1px solid var(--border-color)' }} onClick={() => setStep((s) => s - 1)} disabled={loading}>
              {t('onboard.back')}
            </button>
          ) : (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)', fontWeight: 500 }}>
                  Log In
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}