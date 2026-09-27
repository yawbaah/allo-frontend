import { useState, useEffect, useRef } from 'react';
import { Upload, MessageSquare, X, Copy, Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { useTranslation } from '../../lib/i18n';

type Company = {
  id: string;
  name: string;
  plan: string;
  subscription_status: string;
  widget_name: string;
  widget_color: string;
  widget_position: 'right' | 'left';
  widget_launcher: 'icon' | 'logo-circle' | 'logo-square';
  widget_logo_url: string;
  widget_welcome_msg: string;
};

export default function Deploy() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const [companyId, setCompanyId] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [welcome, setWelcome] = useState('Hi! How can we help you today?');
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [widgetName, setWidgetName] = useState('Support Team');
  const [launcherStyle, setLauncherStyle] = useState<'icon' | 'logo-circle' | 'logo-square'>('icon');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [open, setOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest<Company>('/companies/me/');
        setCompanyId(data.id);
        setColor(data.widget_color || '#ffffff');
        setWelcome(data.widget_welcome_msg || 'Hi! How can we help you today?');
        setPosition(data.widget_position || 'right');
        setWidgetName(data.widget_name || data.name || 'Support');
        setLauncherStyle(data.widget_launcher || 'icon');
        setLogoUrl(data.widget_logo_url || '');
        setIsPaid(data.subscription_status === 'active');
      } catch (err) {
        console.error('Failed to load deploy settings', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!isPaid) return;
    setSaving(true);
    setSaveMessage('');

    try {
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('logo_file', selectedFile);
        fileData.append('widget_name', widgetName);
        fileData.append('widget_color', color);
        fileData.append('widget_position', position);
        fileData.append('widget_launcher', launcherStyle);
        fileData.append('widget_welcome_msg', welcome);

        const response = await apiRequest<Company>('/companies/me/', {
          method: 'PATCH',
          body: fileData,
        });
        setLogoUrl(response.widget_logo_url);
        setSelectedFile(null);
      } else {
        await apiRequest('/companies/me/', {
          method: 'PATCH',
          body: JSON.stringify({
            widget_name: widgetName,
            widget_color: color,
            widget_position: position,
            widget_launcher: launcherStyle,
            widget_logo_url: logoUrl,
            widget_welcome_msg: welcome,
          }),
        });
      }

      setSaveMessage('Widget appearance saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const currentHost = window.location.origin;
  const snippet = `<script
  src="${currentHost}/widget.js"
  data-company-id="${companyId || 'YOUR_COMPANY_ID'}"
  data-name="${widgetName}"
  data-color="${color}"
  data-position="${position}"
  data-launcher="${launcherStyle}"${logoUrl ? `\n  data-logo="${logoUrl}"` : ''}
  async
></script>`;

  const copySnippet = async () => {
    if (!isPaid) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLogoUrl(URL.createObjectURL(file));
      if (launcherStyle === 'icon') setLauncherStyle('logo-circle');
    }
  };

  const isLight = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
  const contrastColor = isLight ? '#000000' : '#ffffff';

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading widget settings…</p>;
  }

  return (
    <div>
      {!isPaid && (
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            color: '#fca5a5',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock size={20} />
            <span>Your embed snippet is locked. Please activate your subscription to go live.</span>
          </div>
          <Link to="/dashboard/billing" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            Activate Plan
          </Link>
        </div>
      )}

      <div className="deploy-layout" style={{ opacity: isPaid ? 1 : 0.45, pointerEvents: isPaid ? 'all' : 'none' }}>
        <div className="deploy-settings">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {t('dep.intro')}
          </p>

          <div style={{ marginBottom: '2rem', padding: '0.85rem 1.1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Your Company ID (UUID)</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#fff', marginTop: '0.25rem', wordBreak: 'break-all' }}>
              {companyId}
            </div>
          </div>

          <h2 className="panel-title">{t('dep.embed')}</h2>
          <div className="code-block-wrapper" style={{ marginBottom: '2.5rem' }}>
            <div className="code-block-header">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>HTML Embed Code</span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={copySnippet}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
              >
                {copied ? (
                  <>
                    <Check size={12} style={{ marginRight: 4 }} /> {t('dep.copied')}
                  </>
                ) : (
                  <>
                    <Copy size={12} style={{ marginRight: 4 }} /> {t('dep.copy')}
                  </>
                )}
              </button>
            </div>
            <pre className="code-block-pre">{snippet}</pre>
          </div>

          <h2 className="panel-title">{t('dep.appearance')}</h2>

          <div className="form-group">
            <label>{t('dep.headerName')}</label>
            <input className="form-input" value={widgetName} onChange={(e) => setWidgetName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>{t('dep.launcher')}</label>
            <div className="launcher-buttons-row">
              <button
                type="button"
                onClick={() => setLauncherStyle('icon')}
                className={`btn ${launcherStyle === 'icon' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ border: launcherStyle === 'icon' ? 'none' : '1px solid var(--border-color)', justifyContent: 'center' }}
              >
                {t('dep.icon')}
              </button>
              <button
                type="button"
                onClick={() => setLauncherStyle('logo-circle')}
                className={`btn ${launcherStyle === 'logo-circle' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ border: launcherStyle === 'logo-circle' ? 'none' : '1px solid var(--border-color)', justifyContent: 'center' }}
              >
                {t('dep.circle')}
              </button>
              <button
                type="button"
                onClick={() => setLauncherStyle('logo-square')}
                className={`btn ${launcherStyle === 'logo-square' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ border: launcherStyle === 'logo-square' ? 'none' : '1px solid var(--border-color)', justifyContent: 'center' }}
              >
                {t('dep.square')}
              </button>
            </div>
          </div>

          {launcherStyle !== 'icon' && (
            <div className="form-group">
              <label>{t('dep.logo')}</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: 'cover',
                      borderRadius: launcherStyle === 'logo-circle' ? '50%' : '8px',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0,
                    }}
                  />
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ border: '1px solid var(--border-color)', padding: '0.5rem 1rem' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} style={{ marginRight: '0.5rem' }} /> {t('dep.upload')}
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>{t('dep.color')}</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 44,
                  height: 44,
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
              />
              <input
                className="form-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ maxWidth: 140 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('dep.welcome')}</label>
            <input className="form-input" value={welcome} onChange={(e) => setWelcome(e.target.value)} />
          </div>

          <div className="form-group">
            <label>{t('dep.position')}</label>
            <select
              className="form-input"
              style={{ appearance: 'none', maxWidth: '100%' }}
              value={position}
              onChange={(e) => setPosition(e.target.value as 'right' | 'left')}
            >
              <option value="right">{t('dep.right')}</option>
              <option value="left">{t('dep.left')}</option>
            </select>
          </div>

          {saveMessage && <p style={{ color: '#86efac', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{saveMessage}</p>}

          <button type="button" className="btn btn-primary deploy-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : t('dep.save')}
          </button>
        </div>

        <div className="widget-preview-frame">
          <div className="widget-preview-label">{t('dep.preview')}</div>
          <div className="fake-site">
            <div className="fake-site-nav">yoursite.com</div>
            <div className="fake-site-body">
              <div className="fake-line" style={{ width: '60%' }} />
              <div className="fake-line" style={{ width: '80%' }} />
              <div className="fake-line" style={{ width: '45%' }} />
            </div>

            <button
              type="button"
              className={`widget-bubble pos-${position}`}
              style={{
                background: open ? color : launcherStyle === 'icon' ? color : 'transparent',
                color: contrastColor,
                borderRadius: launcherStyle === 'logo-square' && !open ? '12px' : '50%',
                padding: launcherStyle !== 'icon' && !open ? '0' : '',
                overflow: 'hidden',
                border: launcherStyle !== 'icon' && !open ? '1px solid var(--border-color)' : 'none',
              }}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X size={24} strokeWidth={2} />
              ) : launcherStyle === 'icon' ? (
                <MessageSquare size={24} strokeWidth={2} style={{ fill: 'currentColor' }} />
              ) : (
                <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </button>

            {open && (
              <div className={`widget-window pos-${position}`}>
                <div className="widget-window-header" style={{ background: color, color: contrastColor }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    {launcherStyle !== 'icon' && logoUrl && (
                      <img src={logoUrl} alt="Logo" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{widgetName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', flexShrink: 0 }}
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
                <div className="widget-window-body">
                  <div className="widget-msg widget-msg-bot">{welcome}</div>
                </div>
                <div className="widget-window-input">
                  <input placeholder="Type a message…" disabled />
                  <button type="button" style={{ background: color, color: contrastColor }}>
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}