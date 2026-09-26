import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useTranslation } from '../../lib/i18n';

type AnalyticsData = {
  total_conversations: number;
  ai_resolution_rate: number;
  messages_this_month: number;
  human_handoffs: number;
  avg_response_time: string;
  weekly_activity: Array<{ day: string; value: number; date: string }>;
};

const topics = [
  { name: 'Product features', pct: 45 },
  { name: 'Pricing & Plans', pct: 25 },
  { name: 'Account & Login', pct: 18 },
  { name: 'Refunds & Support', pct: 12 },
];

export default function Analytics() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<AnalyticsData>('/companies/analytics/');
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxVal = Math.max(...(data?.weekly_activity?.map((d) => d.value) || [1]), 1);

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading analytics dashboard…</p>;
  }

  return (
    <div>
      {/* Metric Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">{t('an.msgs')}</div>
          <div className="value">{data?.messages_this_month ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('an.resolution')}</div>
          <div className="value">{data?.ai_resolution_rate ?? 100}%</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('an.avg')}</div>
          <div className="value">{data?.avg_response_time ?? '1.2s'}</div>
        </div>
        <div className="stat-card">
          <div className="label">{t('an.handoffs')}</div>
          <div className="value">{data?.human_handoffs ?? 0}</div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Weekly Activity Bar Chart */}
        <div className="analytics-panel">
          <h3 className="panel-title">{t('an.week')}</h3>
          <div className="bar-chart">
            {(data?.weekly_activity || []).map((d) => (
              <div key={d.date} className="bar-col">
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${(d.value / maxVal) * 100}%` }}
                    title={`${d.value} conversations on ${d.date}`}
                  />
                </div>
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topics Breakdown */}
        <div className="analytics-panel">
          <h3 className="panel-title">{t('an.topics')}</h3>
          <div className="topic-list">
            {topics.map((t) => (
              <div key={t.name} className="topic-row">
                <div className="topic-meta">
                  <span>{t.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.pct}%</span>
                </div>
                <div className="topic-track">
                  <div className="topic-fill" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resolution Breakdown */}
      <div className="analytics-panel" style={{ marginTop: '1.25rem' }}>
        <h3 className="panel-title">{t('an.breakdown')}</h3>
        <div className="resolution-row">
          <div className="resolution-item">
            <div className="resolution-pct">{data?.ai_resolution_rate ?? 100}%</div>
            <div className="resolution-label">{t('an.aiResolved')}</div>
          </div>
          <div className="resolution-item">
            <div className="resolution-pct">
              {data?.total_conversations && data.total_conversations > 0
                ? roundPct((data.human_handoffs / data.total_conversations) * 100)
                : 0}%
            </div>
            <div className="resolution-label">{t('an.handed')}</div>
          </div>
          <div className="resolution-item">
            <div className="resolution-pct">0%</div>
            <div className="resolution-label">{t('an.abandoned')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function roundPct(val: number) {
  return Math.round(val);
}