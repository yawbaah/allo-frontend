import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useTranslation } from '../../lib/i18n';
import { getUser, setUser, type UserProfile } from '../../lib/auth';

type Company = {
  id: string;
  name: string;
  website_url: string;
  support_email: string;
  notification_email: string;
  escalation_topics: string;
  business_hours: string;
  notify_on_handoff: boolean;
  plan: string;
  industry: string;
  size: string;
};

export default function Settings() {
  const { t } = useTranslation();
  const [company, setCompanyData] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [topics, setTopics] = useState('');
  const [hours, setHours] = useState('');
  const [notifyOnHandoff, setNotifyOnHandoff] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<Company>('/companies/me/');
        if (cancelled) return;
        setCompanyData(data);
        setName(data.name || '');
        setWebsite(data.website_url || '');
        setSupportEmail(data.support_email || '');
        setNotificationEmail(data.notification_email || data.support_email || '');
        setTopics(data.escalation_topics || '');
        setHours(data.business_hours || '');
        setNotifyOnHandoff(data.notify_on_handoff ?? true);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load company');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await apiRequest<Company>('/companies/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          website_url: website,
          support_email: supportEmail,
          notification_email: notificationEmail,
          escalation_topics: topics,
          business_hours: hours,
          notify_on_handoff: notifyOnHandoff,
        }),
      });

      setCompanyData(updated);

      const currentUser = getUser();
      if (currentUser) {
        const updatedUser: UserProfile = { ...currentUser, company_name: updated.name, company: updated.name };
        setUser(updatedUser);
      }

      setMessage('Settings saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading settings…</p>;
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      {company && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Plan: <strong style={{ color: '#fff' }}>{company.plan}</strong>
          {company.industry ? ` · ${company.industry}` : ''}
          {company.size ? ` · ${company.size}` : ''}
        </p>
      )}

      <form onSubmit={handleSave}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {t('set.company')}
        </h2>

        <div className="form-group">
          <label>Company ID (UUID)</label>
          <input className="form-input" value={company?.id || ''} readOnly style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', cursor: 'default' }} />
        </div>

        <div className="form-group">
          <label>{t('set.name')}</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>{t('set.website')}</label>
          <input className="form-input" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <div className="form-group">
          <label>{t('set.supportEmail')}</label>
          <input className="form-input" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Notification email (handoffs)</label>
          <input className="form-input" type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Where Allo emails when a visitor needs a human.
          </p>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={notifyOnHandoff} onChange={(e) => setNotifyOnHandoff(e.target.checked)} />
          Email me when a chat needs human help
        </label>

        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '2rem 0 1.5rem' }}>
          {t('set.escalation')}
        </h2>

        <div className="form-group">
          <label>{t('set.topics')}</label>
          <input className="form-input" value={topics} onChange={(e) => setTopics(e.target.value)} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {t('set.topicsHelp')}
          </p>
        </div>

        <div className="form-group">
          <label>{t('set.hours')}</label>
          <input className="form-input" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
        {message && <p style={{ color: '#86efac', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{message}</p>}

        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={saving}>
          {saving ? 'Saving…' : t('set.save')}
        </button>
      </form>
    </div>
  );
}