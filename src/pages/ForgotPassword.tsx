import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import LangSelect from '../components/LangSelect';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRequest('/auth/forgot-password/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      navigate('/reset-password', { state: { email } });
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
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Forgot password?</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Enter your work email and we'll send you a 6-digit reset code.
        </p>

        <form style={{ textAlign: 'left' }} onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Work Email</label>
            <input
              required
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }} disabled={loading}>
            {loading ? 'Sending code…' : 'Send reset code'}
          </button>
        </form>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--text-primary)' }}>
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}