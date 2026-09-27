import { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useTranslation } from '../../lib/i18n';
import { getUser } from '../../lib/auth';
import { useIsMobile } from '../../hooks/useMediaQuery';

type Message = {
  id: string;
  sender_role: 'user' | 'ai' | 'agent';
  content: string;
  translated_content?: string;
  created_at: string;
};

type Conversation = {
  id: string;
  visitor_identifier: string;
  visitor_lang: string;
  status: 'ai' | 'human' | 'live' | 'resolved';
  preview_text: string;
  updated_at: string;
  messages?: Message[];
};

function renderFormattedMessage(text: string) {
  if (!text) return null;

  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(text)) !== null) {
    const [fullMatch, alt, src] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex, matchIndex)}</span>
      );
    }

    parts.push(
      <div key={`img-${matchIndex}`} style={{ marginTop: '8px', marginBottom: '8px' }}>
        <img
          src={src}
          alt={alt || 'Uploaded visual'}
          style={{
            maxWidth: '100%',
            maxHeight: '220px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            display: 'block',
            objectFit: 'contain',
            background: 'var(--card-bg)',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

export default function Inbox() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [agentLang] = useState('French');
  const [autoTranslate, setAutoTranslate] = useState(false);

  const activeIdRef = useRef<string | null>(null);
  const isMobileRef = useRef(isMobile);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const playAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Could not execute audio alert notification context', e);
    }
  };

  const fetchThreads = async () => {
    try {
      const data = await apiRequest<Conversation[]>('/chat/conversations/');
      setThreads(data);
      if (data.length > 0 && !activeIdRef.current && !isMobileRef.current) {
        setActiveId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async (id: string) => {
    try {
      const data = await apiRequest<Conversation>(`/chat/conversations/${id}/`);
      setActiveThread(data);
    } catch (err) {
      console.error('Failed to load thread details', err);
    }
  };

  useEffect(() => {
    fetchThreads();

    const currentUser = getUser();
    if (!currentUser || !currentUser.company_id) return;

    // Use WebSocket scheme and host dynamically
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBase = import.meta.env.VITE_WS_URL || `${wsProto}//localhost:8000`;
    const wsUrl = `${wsBase}/ws/dash/company/${currentUser.company_id}/`;
    const dashSocket = new WebSocket(wsUrl);

    dashSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'handoff_alert') {
        setThreads((prevThreads) => {
          const filtered = prevThreads.filter((t) => t.id !== data.conversation_id);
          const updatedThread: Conversation = {
            id: data.conversation_id,
            visitor_identifier: data.visitor_identifier,
            visitor_lang: 'en',
            status: data.status,
            preview_text: data.preview_text,
            updated_at: data.updated_at,
          };
          return [updatedThread, ...filtered];
        });

        if (data.status === 'human') {
          playAlertSound();
        }
      }
    };

    return () => {
      dashSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!activeId) {
      setActiveThread(null);
      return;
    }

    fetchThreadDetails(activeId);

    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBase = import.meta.env.VITE_WS_URL || `${wsProto}//localhost:8000`;
    const chatSocket = new WebSocket(`${wsBase}/ws/chat/conversation/${activeId}/`);

    chatSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'chat_message') {
        const newMsg: Message = data.message;
        setActiveThread((prev) => {
          if (!prev || prev.id !== activeId) return prev;
          const exists = prev.messages?.some((m) => m.id === newMsg.id);
          if (exists) return prev;

          return {
            ...prev,
            messages: [...(prev.messages || []), newMsg],
          };
        });
      }
    };

    return () => {
      chatSocket.close();
    };
  }, [activeId]);

  const handleJoin = async () => {
    if (!activeId) return;
    try {
      await apiRequest(`/chat/conversations/${activeId}/join/`, { method: 'POST' });
      fetchThreadDetails(activeId);
    } catch (err) {
      alert('Failed to join chat');
    }
  };

  const handleResolve = async () => {
    if (!activeId) return;
    try {
      await apiRequest(`/chat/conversations/${activeId}/resolve/`, { method: 'POST' });
      fetchThreadDetails(activeId);
    } catch (err) {
      alert('Failed to resolve chat');
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeId) return;

    setSending(true);
    try {
      await apiRequest(`/chat/conversations/${activeId}/reply/`, {
        method: 'POST',
        body: JSON.stringify({ content: reply }),
      });
      setReply('');
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading inbox…</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ border: '1px solid var(--border-color)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          onClick={fetchThreads}
        >
          <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh inbox
        </button>
      </div>

      {threads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No conversations yet.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            When visitors ask questions in your embed widget, conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="inbox-layout">
          {(!isMobile || !activeId) && (
            <div className="inbox-list">
              {threads.map((tItem) => (
                <div
                  key={tItem.id}
                  className={`inbox-item ${tItem.id === activeId ? 'active' : ''}`}
                  onClick={() => setActiveId(tItem.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{tItem.visitor_identifier}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{formatDate(tItem.updated_at)}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tItem.preview_text || 'No preview'}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      className={`badge ${
                        tItem.status === 'human'
                          ? 'badge-human'
                          : tItem.status === 'live'
                          ? 'badge-live'
                          : 'badge-ai'
                      }`}
                    >
                      {tItem.status === 'human'
                        ? t('inbox.needsHuman')
                        : tItem.status === 'live'
                        ? t('inbox.live')
                        : 'AI'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!isMobile || activeId) && (
            <div className="inbox-chat">
              {activeThread ? (
                <>
                  <div className="inbox-chat-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isMobile && (
                        <button
                          type="button"
                          className="inbox-back-btn"
                          onClick={() => setActiveId(null)}
                          title="Back to conversations"
                        >
                          <ArrowLeft size={16} />
                          <span>Back</span>
                        </button>
                      )}
                      <div>
                        <strong>{activeThread.visitor_identifier}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {t('inbox.speaking')}: {activeThread.visitor_lang || 'en'} · Status: {activeThread.status}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)} />
                        {t('inbox.autoTranslate')} {agentLang}
                      </label>

                      {activeThread.status === 'human' && (
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleJoin}>
                          {t('inbox.join')}
                        </button>
                      )}

                      {activeThread.status !== 'resolved' && (
                        <button className="btn btn-ghost" style={{ border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleResolve}>
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="inbox-messages">
                    {(activeThread.messages || []).map((m) => {
                      const isAgent = m.sender_role === 'agent';
                      return (
                        <div key={m.id} className={`msg ${m.sender_role === 'user' ? 'msg-user' : isAgent ? 'msg-agent' : 'msg-ai'}`}>
                          <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {renderFormattedMessage(m.content)}
                          </div>
                          <div style={{ fontSize: '0.65rem', marginTop: '0.4rem', opacity: 0.5, textAlign: isAgent ? 'right' : 'left' }}>
                            {m.sender_role === 'ai' ? 'Allo AI' : isAgent ? 'You' : 'Visitor'} · {formatDate(m.created_at)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="inbox-reply">
                    <form style={{ display: 'flex', gap: '0.75rem', width: '100%' }} onSubmit={sendReply}>
                      <input
                        className="form-input"
                        placeholder={t('inbox.placeholder')}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        disabled={sending || activeThread.status === 'resolved'}
                      />
                      <button type="submit" className="btn btn-primary" disabled={sending || activeThread.status === 'resolved'}>
                        {sending ? 'Sending…' : t('inbox.send')}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Select a conversation to view details.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}