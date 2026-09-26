import { useState, useEffect, useRef } from 'react';
import { Globe, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useTranslation } from '../../lib/i18n';
import { getUser } from '../../lib/auth';

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

export default function Inbox() {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [agentLang] = useState('French');
  const [autoTranslate, setAutoTranslate] = useState(false);

  // Refs for tracking active references inside socket event handlers
  const activeIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Keep ref up to date
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Subtle synth notification tone for human handoffs
  const playAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Could not execute audio alert notification context", e);
    }
  };

  const fetchThreads = async () => {
    try {
      const data = await apiRequest<Conversation[]>('/chat/conversations/');
      setThreads(data);
      if (data.length > 0 && !activeIdRef.current) {
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

  // 1. Establish dashboard-wide company alert socket
  useEffect(() => {
    fetchThreads();

    const currentUser = getUser();
    if (!currentUser || !currentUser.company_id) return;

    const wsUrl = `ws://localhost:8000/ws/dash/company/${currentUser.company_id}/`;
    const dashSocket = new WebSocket(wsUrl);

    dashSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'handoff_alert') {
        // Refresh thread sidebar sorting
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

        // Trigger synth sound if alert transitions to "human" handoff
        if (data.status === 'human') {
          playAlertSound();
        }
      }
    };

    dashSocket.onclose = () => {
      console.log('Dashboard global alerts channel closed. Reconnecting shortly.');
    };

    return () => {
      dashSocket.close();
    };
  }, []);

  // 2. Fetch full details on active thread switch
  useEffect(() => {
    if (activeId) {
      fetchThreadDetails(activeId);
    }
  }, [activeId]);

  // 3. Establish specific, real-time message stream for the active thread
  useEffect(() => {
    if (!activeId) return;

    const chatSocket = new WebSocket(`ws://localhost:8000/ws/chat/conversation/${activeId}/`);

    chatSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'chat_message') {
        const newMsg: Message = data.message;
        
        // Append the message to the active conversation context in real-time
        setActiveThread((prev) => {
          if (!prev || prev.id !== activeId) return prev;
          
          // Check for duplicate messages
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
          {/* Sidebar List */}
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

          {/* Active Chat Window */}
          <div className="inbox-chat">
            {activeThread ? (
              <>
                <div className="inbox-chat-header">
                  <div>
                    <strong>{activeThread.visitor_identifier}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {t('inbox.speaking')}: {activeThread.visitor_lang || 'en'} · Status: {activeThread.status}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

                {/* Message Log */}
                <div className="inbox-messages">
                  {(activeThread.messages || []).map((m) => {
                    const isAgent = m.sender_role === 'agent';
                    return (
                      <div key={m.id} className={`msg ${m.sender_role === 'user' ? 'msg-user' : isAgent ? 'msg-agent' : 'msg-ai'}`}>
                        <div style={{ fontSize: '0.9rem' }}>{m.content}</div>
                        <div style={{ fontSize: '0.65rem', marginTop: '0.4rem', opacity: 0.5, textAlign: isAgent ? 'right' : 'left' }}>
                          {m.sender_role === 'ai' ? 'Allo AI' : isAgent ? 'You' : 'Visitor'} · {formatDate(m.created_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#0a0a0a' }}>
                  <form style={{ display: 'flex', gap: '0.75rem' }} onSubmit={sendReply}>
                    <input
                      className="form-input"
                      placeholder={t('inbox.placeholder')}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      disabled={sending || activeThread.status === 'resolved'}
                      style={{ background: '#000' }}
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
        </div>
      )}
    </div>
  );
}