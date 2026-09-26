import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { useTranslation } from '../../lib/i18n';

type OverviewData = {
  total_conversations: number;
  ai_resolution_rate: number;
  pages_indexed: number;
  avg_response_time: string;
  recent_conversations: Array<{
    id: string;
    visitor: string;
    preview: string;
    status: string;
    time: string;
  }>;
};

export default function Overview() {
  const { t } = useTranslation();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<OverviewData>('/companies/analytics/');
        setData(res);
      } catch (err) {
        console.error('Failed to load overview analytics', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading overview metrics…</p>;
  }

  return (
    <div>
      {/* Metrics Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">{t('ov.conversations')}</div>
          <div className="value">{data?.total_conversations ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('ov.resolution')}</div>
          <div className="value">{data?.ai_resolution_rate ?? 100}%</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('ov.pages')}</div>
          <div className="value">{data?.pages_indexed ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('ov.avg')}</div>
          <div className="value">{data?.avg_response_time ?? '1.2s'}</div>
        </div>
      </div>

      {/* Recent Activity Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.125rem' }}>{t('ov.recent')}</h2>
        <Link to="/dashboard/inbox" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {t('ov.viewAll')}
        </Link>
      </div>

      {/* Recent Conversations Table */}
      {!data?.recent_conversations || data.recent_conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No conversations yet.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            When visitors chat with your widget, recent conversations will appear here.
          </p>
        </div>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>{t('ov.visitor')}</th>
              <th>{t('ov.message')}</th>
              <th>{t('ov.status')}</th>
              <th>{t('ov.time')}</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_conversations.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.visitor}</td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.preview}
                </td>
                <td>
                  <span className={`badge ${r.status === 'human' ? 'badge-human' : r.status === 'live' ? 'badge-live' : 'badge-ai'}`}>
                    {r.status === 'human' ? t('ov.human') : r.status === 'live' ? 'Live' : t('ov.ai')}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{formatTime(r.time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}