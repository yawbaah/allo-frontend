import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiRequest, setTokens } from '../lib/api';
import { setUser } from '../lib/auth';
import { useTranslation } from '../lib/i18n';
import LangSelect from '../components/LangSelect';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiRequest<{ tokens: { access: string; refresh: string }; user: any }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '40px' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <LangSelect compact />
        </div>
        <Link to="/" className="logo-text" style={{ fontSize: '3rem', marginBottom: '1.5rem', display: 'inline-block' }}>
          Allo
        </Link>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('login.title')}</p>

        <form style={{ textAlign: 'left' }} onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('login.email')}</label>
            <input required type="email" className="form-input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{t('login.password')}</label>
              <Link to="/forgot-password" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                Forgot password?
              </Link>
            </div>
            <input required type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', marginBottom: '2rem' }} disabled={loading}>
            {loading ? 'Logging in…' : t('login.submit')}
          </button>
        </form>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {t('login.noAccount')}{' '}
          <Link to="/onboarding" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)' }}>
            {t('login.getStarted')}
          </Link>
        </p>
      </div>
    </main>
  );
}