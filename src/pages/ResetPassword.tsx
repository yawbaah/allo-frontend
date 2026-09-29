import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiRequest } from '../lib/api';
import LangSelect from '../components/LangSelect';
import ThemeToggle from '../components/ThemeToggle';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiRequest('/auth/reset-password/', {
        method: 'POST',
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });
      navigate('/login', { state: { message: 'Password reset successfully! Please log in.' } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/login"
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
            <ArrowLeft size={16} /> Back to Log In
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle compact />
            <LangSelect compact />
          </div>
        </div>
        <Link to="/" className="logo-text" style={{ fontSize: '3rem', marginBottom: '1.5rem', display: 'inline-block' }}>
          Allo
        </Link>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Reset Password</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Enter the code sent to your email and your new password.
        </p>

        <form style={{ textAlign: 'left' }} onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Work Email</label>
            <input required type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label>6-Digit Reset Code</label>
            <input
              required
              type="text"
              className="form-input"
              style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              required
              type="password"
              className="form-input"
              placeholder="••••••••"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1.5rem' }} disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </main>
  );
}