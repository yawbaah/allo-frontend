import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Sparkles, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useTranslation } from '../../lib/i18n';

interface BillingData {
  plan: 'starter' | 'growth' | 'business' | 'enterprise';
  subscription_status: string;
  message_usage: number;
  message_limit: number;
  usage_percentage: number;
  current_period_end: string | null;
  has_active_credits: boolean;
}

export default function Billing() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [polling, setPolling] = useState(false);

  // Universal browser interval ref type
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    // Check if redirected from Stripe Checkout
    if (searchParams.get('session_id')) {
      setShowSuccessBanner(true);
      setPolling(true);
      startStatusPolling();
    } else {
      fetchBillingData();
    }

    return () => {
      stopStatusPolling();
    };
  }, [searchParams]);

  const fetchBillingData = async () => {
    try {
      const data = await apiRequest<BillingData>('/billing/dashboard/');
      setBilling(data);
      return data;
    } catch (err) {
      console.error('Failed to load billing details', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Polls backend status dynamically after checkout redirects
  const startStatusPolling = () => {
    stopStatusPolling();
    pollCountRef.current = 0;

    pollIntervalRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      const data = await fetchBillingData();

      // Stop polling once the account is active
      if (data && data.subscription_status === 'active') {
        stopStatusPolling();
        setPolling(false);
        // Clear session query params to clean URL state
        searchParams.delete('session_id');
        setSearchParams(searchParams);
      }

      // Stop polling after 12 attempts (~24 seconds) if payment is pending
      if (pollCountRef.current >= 12) {
        stopStatusPolling();
        setPolling(false);
      }
    }, 2000);
  };

  const stopStatusPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleUpgrade = async (planKey: string) => {
    setActionLoading(planKey);
    try {
      const res = await apiRequest<{ checkout_url: string }>('/billing/checkout/', {
        method: 'POST',
        body: JSON.stringify({ plan: planKey }),
      });
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate checkout.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading('portal');
    try {
      const res = await apiRequest<{ portal_url: string }>('/billing/portal/', {
        method: 'POST',
      });
      if (res.portal_url) {
        window.location.href = res.portal_url;
      }
    } catch (err: any) {
      alert(err.message || 'Failed to open customer portal.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !polling) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading billing status…</p>;
  }

  if (!billing) {
    return <p style={{ color: '#f87171' }}>Failed to retrieve billing information.</p>;
  }

  const isPaid = billing.subscription_status === 'active';

  const tiers = [
    {
      key: 'starter',
      name: t('pricing.starter.name'),
      price: '€27',
      limit: '1,000 msgs / mo',
      features: [t('pricing.f1'), t('pricing.f3'), t('pricing.f4'), t('pricing.f6')],
    },
    {
      key: 'growth',
      name: t('pricing.growth.name'),
      price: '€92',
      limit: '5,000 msgs / mo',
      features: [t('pricing.f7'), t('pricing.f9'), t('pricing.f10'), t('pricing.f11'), t('pricing.f12')],
      highlighted: true,
    },
    {
      key: 'business',
      name: t('pricing.business.name'),
      price: '€279',
      limit: '20,000 msgs / mo',
      features: [t('pricing.f14'), t('pricing.f16'), t('pricing.f17'), t('pricing.f18'), t('pricing.f19')],
    },
  ];

  return (
    <div style={{ maxWidth: '1000px' }}>
      {showSuccessBanner && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid #22c55e',
            borderRadius: '4px',
            color: '#86efac',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Sparkles size={18} />
          <span>
            {isPaid 
              ? "Payment successful! Your subscription is now active." 
              : "Payment received. Activating subscription workspace features..."}
          </span>
        </div>
      )}

      {/* UNPAID LOCKOUT BANNER */}
      {!isPaid && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldAlert size={28} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', color: '#fff', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                Account Locked — Payment Required
              </strong>
              <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                You selected the <strong style={{ color: '#fff' }}>{billing.plan.toUpperCase()}</strong> plan but no payment has been received.
                Complete payment below to unlock knowledge ingestion, live chat, and your embed widget.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem', flexShrink: 0 }}
            onClick={() => handleUpgrade(billing.plan)}
            disabled={actionLoading === billing.plan}
          >
            {actionLoading === billing.plan ? 'Opening Stripe…' : `Pay & Activate ${billing.plan.toUpperCase()}`}
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="stat-card">
          <div className="label">Current Status</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.75rem', textTransform: 'capitalize', fontWeight: 500 }}>
              {billing.plan} Plan
            </span>
            <span
              className="badge"
              style={{
                background: isPaid ? '#fff' : 'rgba(239, 68, 68, 0.15)',
                color: isPaid ? '#000' : '#ef4444',
                border: isPaid ? 'none' : '1px solid #ef4444',
              }}
            >
              {isPaid ? 'Active' : 'Unpaid'}
            </span>
          </div>
          {isPaid && billing.current_period_end && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Renews on {new Date(billing.current_period_end).toLocaleDateString()}
            </p>
          )}
          {!isPaid && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              No active subscription. Features are locked.
            </p>
          )}
          {isPaid && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleManageBilling}
              disabled={actionLoading === 'portal'}
              style={{
                border: '1px solid var(--border-color)',
                marginTop: '1.25rem',
                width: '100%',
                fontSize: '0.75rem',
              }}
            >
              <CreditCard size={14} style={{ marginRight: '0.5rem' }} />
              {actionLoading === 'portal' ? 'Redirecting…' : 'Manage Invoices & Cards'}
            </button>
          )}
        </div>

        <div className="stat-card">
          <div className="label">Monthly Message Credits</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 300 }}>
              {isPaid ? billing.message_usage.toLocaleString() : '—'}{' '}
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                / {billing.message_limit.toLocaleString()}
              </span>
            </span>
            {isPaid && (
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {billing.usage_percentage}% used
              </span>
            )}
          </div>
          <div
            style={{
              height: '8px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                width: isPaid ? `${Math.min(billing.usage_percentage, 100)}%` : '0%',
                height: '100%',
                background: '#ffffff',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            {isPaid ? 'Active monthly credits.' : 'Activate your plan to start using credits.'}
          </p>
        </div>
      </div>

      <h2 className="panel-title" style={{ marginBottom: '1.25rem' }}>
        {isPaid ? 'Change Plan' : 'Select & Activate a Plan'}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {tiers.map((tier) => {
          const isSelected = billing.plan.toLowerCase() === tier.key;
          return (
            <div
              key={tier.key}
              className={`pricing-card ${tier.highlighted && !isPaid ? 'highlighted' : ''}`}
              style={{
                borderColor: isSelected && isPaid ? 'var(--text-primary)' : undefined,
              }}
            >
              <h3 className="pricing-name">{tier.name}</h3>
              <div className="pricing-price">
                <span className="price-value">{tier.price}</span>
                <span className="price-period">/ mo</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {tier.limit}
              </p>

              <button
                type="button"
                className={`btn ${isSelected && isPaid ? 'btn-ghost' : 'btn-primary'}`}
                style={{
                  width: '100%',
                  marginBottom: '1.5rem',
                  border: isSelected && isPaid ? '1px solid var(--border-color)' : 'none',
                }}
                disabled={isSelected && isPaid}
                onClick={() => handleUpgrade(tier.key)}
              >
                {isSelected && isPaid
                  ? 'Current Plan (Active)'
                  : actionLoading === tier.key
                  ? 'Connecting Stripe…'
                  : isSelected && !isPaid
                  ? `Pay & Activate ${tier.price}/mo`
                  : `Select ${tier.name}`}
              </button>

              <ul className="pricing-features">
                {tier.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={14} strokeWidth={2} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}