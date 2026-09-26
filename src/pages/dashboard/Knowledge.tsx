import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, FileText, Globe, Upload, X, Sparkles, FileCode, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';
import { apiRequest } from '../../lib/api';

type Source = {
  id: string;
  type: 'page' | 'pdf' | 'docx' | 'image' | 'text';
  title: string;
  url_or_path: string;
  status: 'indexed' | 'crawling' | 'processing' | 'failed';
  chunk_count: number;
  image_description?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
};

type ImageUpload = { file: File; preview: string; description: string };

export default function Knowledge() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [error, setError] = useState('');
  const [isPaid, setIsPaid] = useState(true);

  const [showImageModal, setShowImageModal] = useState(false);
  const [pendingImages, setPendingImages] = useState<ImageUpload[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [showTextModal, setShowTextModal] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [savingText, setSavingText] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const fetchSources = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true);
      const data = await apiRequest<Source[]>('/sources/');
      setSources(data);
      setIsPaid(true);
    } catch (err: any) {
      if (err.message && err.message.includes('Payment required')) {
        setIsPaid(false);
      } else {
        setError(err.message || 'Failed to load sources.');
      }
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    const activeBackgroundTasks = sources.some(
      (s) => s.status === 'processing' || s.status === 'crawling'
    );
    if (!activeBackgroundTasks) return;
    const pollInterval = setInterval(() => {
      fetchSources(false);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [sources]);

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isPaid) return;
    setCrawling(true);
    setError('');
    try {
      await apiRequest('/sources/', {
        method: 'POST',
        body: JSON.stringify({ url, type: 'page' }),
      });
      setUrl('');
      await fetchSources(false);
    } catch (err: any) {
      if (err.message && err.message.includes('Payment required')) {
        setIsPaid(false);
      } else {
        setError(err.message || 'Failed to submit URL for crawling.');
      }
    } finally {
      setCrawling(false);
    }
  };

  const handleDocSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !isPaid) return;
    setError('');
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const docType = ext === 'pdf' ? 'pdf' : 'docx';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', docType);
      try {
        await apiRequest('/sources/', { method: 'POST', body: formData });
      } catch (err: any) {
        if (err.message && err.message.includes('Payment required')) {
          setIsPaid(false);
          return;
        }
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    e.target.value = '';
    fetchSources(false);
  };

  const saveManualText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim() || !isPaid) return;
    setSavingText(true);
    setError('');
    try {
      await apiRequest('/sources/', {
        method: 'POST',
        body: JSON.stringify({
          type: 'text',
          title: textTitle.trim() || 'Manual text note',
          content: textContent.trim(),
        }),
      });
      setTextTitle('');
      setTextContent('');
      setShowTextModal(false);
      await fetchSources(false);
    } catch (err: any) {
      if (err.message && err.message.includes('Payment required')) {
        setIsPaid(false);
        setShowTextModal(false);
      } else {
        setError(err.message || 'Failed to save text note.');
      }
    } finally {
      setSavingText(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPaid) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const uploads: ImageUpload[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: '',
    }));
    setPendingImages(uploads);
    setShowImageModal(true);
    e.target.value = '';
  };

  const updateDescription = (idx: number, desc: string) => {
    setPendingImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, description: desc } : img))
    );
  };

  const saveImages = async () => {
    setUploadingImages(true);
    setError('');
    for (const img of pendingImages) {
      const formData = new FormData();
      formData.append('file', img.file);
      formData.append('type', 'image');
      if (img.description) formData.append('description', img.description);
      try {
        await apiRequest('/sources/', { method: 'POST', body: formData });
      } catch (err: any) {
        if (err.message && err.message.includes('Payment required')) {
          setIsPaid(false);
          break;
        }
        setError(`Failed to upload ${img.file.name}`);
      }
    }
    setPendingImages([]);
    setShowImageModal(false);
    setUploadingImages(false);
    fetchSources(false);
  };

  const removeSource = async (id: string) => {
    try {
      await apiRequest(`/sources/${id}/`, { method: 'DELETE' });
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete source.');
    }
  };

  const iconFor = (type: Source['type']) => {
    switch (type) {
      case 'page': return <Globe size={14} strokeWidth={1.5} />;
      case 'pdf': case 'docx': return <FileText size={14} strokeWidth={1.5} />;
      case 'image': return <ImageIcon size={14} strokeWidth={1.5} />;
      case 'text': return <FileCode size={14} strokeWidth={1.5} />;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div>
      {!isPaid && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', color: '#fff', fontSize: '1rem', marginBottom: '0.2rem' }}>
                Knowledge Base Locked
              </strong>
              <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                Activate your subscription to crawl websites, upload documents, and train your AI chatbot.
              </span>
            </div>
          </div>
          <Link to="/dashboard/billing" className="btn btn-primary" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem', flexShrink: 0 }}>
            Activate Plan
          </Link>
        </div>
      )}

      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '620px' }}>
        {t('kb.intro')}
      </p>

      <form className="kb-form" onSubmit={handleCrawl}>
        <input
          type="url"
          className="form-input"
          placeholder={t('kb.placeholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={!isPaid}
        />
        <button type="submit" className="btn btn-primary" disabled={crawling || !isPaid}>
          {crawling ? t('kb.crawling') : t('kb.crawl')}
        </button>
      </form>

      {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap', opacity: isPaid ? 1 : 0.4, pointerEvents: isPaid ? 'all' : 'none' }}>
        <button type="button" className="btn btn-primary upload-btn" onClick={() => setShowTextModal(true)} style={{ background: '#ffffff', color: '#000000', fontWeight: 600 }}>
          <FileCode size={16} strokeWidth={2} /> ADD TEXT
        </button>
        <button type="button" className="btn btn-ghost upload-btn" onClick={() => docInputRef.current?.click()}>
          <FileText size={16} strokeWidth={1.5} /> {t('kb.uploadDocs')}
        </button>
        <button type="button" className="btn btn-ghost upload-btn" onClick={() => imageInputRef.current?.click()}>
          <ImageIcon size={16} strokeWidth={1.5} /> {t('kb.uploadImages')}
        </button>
        <button type="button" className="btn btn-ghost upload-btn" onClick={() => fetchSources(true)}>
          <Upload size={16} strokeWidth={1.5} /> {t('kb.refresh')}
        </button>
        <input ref={docInputRef} type="file" accept=".pdf,.docx" multiple hidden onChange={handleDocSelect} />
        <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageSelect} />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading knowledge base…</p>
      ) : sources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No sources added yet.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isPaid ? 'Paste your website URL above, upload a document, or click "ADD TEXT".' : 'Activate your plan to start adding sources.'}
          </p>
        </div>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>{t('kb.source')}</th>
              <th>{t('kb.type')}</th>
              <th>{t('kb.status')}</th>
              <th>{t('kb.chunks')}</th>
              <th>{t('kb.updated')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {s.thumbnail_url && (
                      <img src={s.thumbnail_url} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.type === 'text' ? s.image_description : (s.image_description || s.url_or_path)}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {iconFor(s.type)} {s.type}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${s.status === 'indexed' ? 'ai' : s.status === 'failed' ? 'pending' : 'live'}`}>
                    {s.status}
                  </span>
                </td>
                <td>{s.chunk_count || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{formatDate(s.created_at)}</td>
                <td>
                  <button type="button" onClick={() => removeSource(s.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showTextModal && (
        <div className="modal-overlay" onClick={() => !savingText && setShowTextModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Add Text Knowledge</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Paste FAQs, policies, pricing notes, or any raw text.
                </p>
              </div>
              <button type="button" onClick={() => setShowTextModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} disabled={savingText}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveManualText}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title / Subject</label>
                  <input className="form-input" placeholder="e.g. Refund Policy" value={textTitle} onChange={(e) => setTextTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea className="form-input" placeholder="Paste your text content here..." rows={8} value={textContent} onChange={(e) => setTextContent(e.target.value)} required style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowTextModal(false)} className="btn btn-ghost" style={{ border: '1px solid var(--border-color)' }} disabled={savingText}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingText || !textContent.trim()}>
                  {savingText ? 'Embedding…' : 'Save & Embed Text'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="modal-overlay" onClick={() => !uploadingImages && setShowImageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>{t('kb.modalTitle')}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('kb.modalSub')}</p>
              </div>
              <button type="button" onClick={() => setShowImageModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }} disabled={uploadingImages}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {pendingImages.map((img, idx) => (
                <div key={idx} className="image-upload-item">
                  <img src={img.preview} alt="preview" className="upload-preview" />
                  <div style={{ flex: 1 }}>
                    <textarea className="form-input" placeholder={t('kb.descPlaceholder')} value={img.description} onChange={(e) => updateDescription(idx, e.target.value)} rows={3} style={{ marginBottom: '0.5rem' }} />
                    <button type="button" onClick={() => updateDescription(idx, 'Official company visual or logo.')} className="btn btn-ghost" style={{ border: '1px solid var(--border-color)', fontSize: '0.7rem', padding: '0.35rem 0.75rem' }}>
                      <Sparkles size={12} style={{ marginRight: 4 }} /> {t('kb.generate')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowImageModal(false)} className="btn btn-ghost" style={{ border: '1px solid var(--border-color)' }} disabled={uploadingImages}>{t('kb.cancel')}</button>
              <button type="button" onClick={saveImages} className="btn btn-primary" disabled={pendingImages.length === 0 || uploadingImages}>
                {uploadingImages ? 'Saving…' : t('kb.addImages', { n: pendingImages.length })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}