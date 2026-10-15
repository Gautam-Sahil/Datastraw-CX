import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Auth from './Auth';

const API_BASE = 'http://localhost:5000/api';

const Icon = {
  Terminal: () => (
    
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Headset: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

const initials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

function Toast({ items }) {
  return (
    <div className="toast-wrap">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type || 'success'}`}>
          {t.type !== 'error' ? <Icon.Check /> : <Icon.Alert />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function ContextCard({ title, content }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`context-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(v => !v)}>
      <div className="ctx-head">
        <div className="ctx-title"><Icon.File /> {title}</div>
        <span className="ctx-expand-icon"><Icon.ChevronDown /></span>
      </div>
      <div className="ctx-body">{content}</div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('chat');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [senderMode, setSenderMode] = useState('customer');
  const [inputText, setInputText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [editableReply, setEditableReply] = useState('');
  const [daysInput, setDaysInput] = useState(1);
  const [brands, setBrands] = useState([]);
  const [selectedKbBrand, setSelectedKbBrand] = useState('');
  const [policies, setPolicies] = useState([]);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  const chatEndRef = useRef(null);
  const composerRef = useRef(null);

  const pushToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchBrands();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, aiLoading]);

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'g' && selectedConv && !aiLoading) {
        e.preventDefault();
        handleGenerateReply();
      }
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        composerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedConv, aiLoading]);

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  if (!token) {
    return (
      <Auth 
        onLoginSuccess={(newToken) => {
          localStorage.setItem('token', newToken);
          setToken(newToken);
        }} 
      />
    );
  }

  async function fetchConversations() {
    const res = await fetch(`${API_BASE}/conversations`);
    const data = await res.json();
    setConversations(data);
    if (data.length > 0 && !selectedConv) selectConversation(data[0]);
  }

  async function fetchBrands() {
    const res = await fetch(`${API_BASE}/brands`);
    const data = await res.json();
    setBrands(data);
    if (data.length > 0) {
      setSelectedKbBrand(data[0]._id);
      fetchPolicies(data[0]._id);
    }
  }

  async function fetchPolicies(brandId) {
    const res = await fetch(`${API_BASE}/policies/${brandId}`);
    const data = await res.json();
    setPolicies(data);
  }

  async function fetchLogs() {
    const res = await fetch(`${API_BASE}/logs`);
    const data = await res.json();
    setAuditLogs(data);
  }

  async function selectConversation(conv) {
    setSelectedConv(conv);
    setDaysInput(conv.orderDetails.deliveredDaysAgo);
    setAiResult(null);
    setEditableReply('');
    const res = await fetch(`${API_BASE}/messages/${conv._id}`);
    const data = await res.json();
    setMessages(data);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;
    await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selectedConv._id, sender: senderMode, text: inputText }),
    });
    setInputText('');
    const res = await fetch(`${API_BASE}/messages/${selectedConv._id}`);
    const data = await res.json();
    setMessages(data);
  }

  async function handleUpdateDays() {
    if (!selectedConv) return;
    const res = await fetch(`${API_BASE}/conversations/${selectedConv._id}/order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveredDaysAgo: Number(daysInput) }),
    });
    const updated = await res.json();
    setSelectedConv(updated);
    setConversations(conversations.map(c => (c._id === updated._id ? updated : c)));
    pushToast(`Order synced — ${daysInput} days since delivery`);
  }

  async function handleGenerateReply() {
    if (!selectedConv) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(`${API_BASE}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConv._id }),
      });
      const data = await res.json();
      setAiResult(data);
      setEditableReply(data.suggestedReply || '');
      if (window.innerWidth <= 1080) setAiPanelOpen(true);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleApproveReply() {
    if (!selectedConv || !aiResult || !editableReply.trim()) return;
    await fetch(`${API_BASE}/ai/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: selectedConv._id,
        customerMessage: aiResult.customerMessage,
        retrievedContext: aiResult.retrievedContext,
        aiGeneratedResponse: aiResult.suggestedReply,
        finalResponse: editableReply,
      }),
    });
    setAiResult(null);
    setEditableReply('');
    const res = await fetch(`${API_BASE}/messages/${selectedConv._id}`);
    const data = await res.json();
    setMessages(data);
    pushToast('Reply deployed to conversation');
  }

  function handleKbBrandChange(e) {
    const brandId = e.target.value;
    setSelectedKbBrand(brandId);
    fetchPolicies(brandId);
    setEditingPolicy(null);
    setKbTitle('');
    setKbContent('');
  }

  async function handleSavePolicy(e) {
    e.preventDefault();
    if (!kbTitle.trim() || !kbContent.trim() || !selectedKbBrand) return;
    if (editingPolicy) {
      await fetch(`${API_BASE}/policies/${editingPolicy._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: kbTitle, content: kbContent }),
      });
      pushToast('Policy updated');
    } else {
      await fetch(`${API_BASE}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: selectedKbBrand, title: kbTitle, content: kbContent }),
      });
      pushToast('Policy created');
    }
    setKbTitle('');
    setKbContent('');
    setEditingPolicy(null);
    fetchPolicies(selectedKbBrand);
  }

  function handleEditClick(policy) {
    setEditingPolicy(policy);
    setKbTitle(policy.title);
    setKbContent(policy.content);
  }

  async function handleDeletePolicy(id) {
    await fetch(`${API_BASE}/policies/${id}`, { method: 'DELETE' });
    fetchPolicies(selectedKbBrand);
    pushToast('Policy removed');
  }

  const guardrailIcon = (status) => {
    if (status === 'GROUNDED') return <Icon.Check />;
    if (status === 'POLICY_RESTRICTION') return <Icon.Alert />;
    return <Icon.X />;
  };

  return (
    <>
     <div className="mesh-bg" aria-hidden="true">
        <div className="orb" />
        <div className="noise" />
      </div>

      <nav className="navbar">
        <div className="brand-logo">
          <div className="logo-mark"><Icon.Logo /></div>
          <span>Datastraw CX</span>
        </div>
        <div className="nav-tabs">
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
            <Icon.Terminal /><span>Terminal</span>
          </button>
          <button className={activeTab === 'kb' ? 'active' : ''} onClick={() => setActiveTab('kb')}>
            <Icon.Book /><span>Knowledge Base</span>
          </button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => { setActiveTab('logs'); fetchLogs(); }}>
            <Icon.Activity /><span>Audit Logs</span>
          </button>
        </div>
        <div className="nav-meta" style={{display: 'flex', gap: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.55rem'}}>
            <span className="status-dot" />
            <span>Operational</span>
          </div>
          <button onClick={handleLogout} style={{color: 'var(--missing)', fontSize: '11px', fontWeight: 600}}>
            Logout
          </button>
        </div>
      </nav>

      <div className="app-container">
        {activeTab === 'chat' && (
          <div className="workspace-grid">
            <div className="panel">
              <div className="panel-header">
                <h2>Active Sessions</h2>
                <span className="header-sub">{conversations.length}</span>
              </div>
              <div className="conv-list">
                {conversations.map((conv) => (
                  <div key={conv._id} className={`conv-item ${selectedConv?._id === conv._id ? 'active' : ''}`} onClick={() => selectConversation(conv)}>
                    <span className="brand-badge">{conv.brandId?.name}</span>
                    <div className="conv-name">{conv.customerName}</div>
                    <div className="conv-meta">
                      <span>#{conv.orderDetails.orderId}</span><span className="dot" /><span>{conv.orderDetails.deliveredDaysAgo}d ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              {selectedConv ? (
                <>
                  <div className="panel-header">
                    <h2>{selectedConv.customerName}<span className="brand-badge" style={{ marginLeft: '0.4rem' }}>{selectedConv.brandId?.name}</span></h2>
                    <span className="header-sub">#{selectedConv.orderDetails.orderId}</span>
                  </div>
                  <div className="order-bar">
                    <div className="order-info">
                      <span className="item">{selectedConv.orderDetails.itemName}</span><span className="dot">•</span><span className="status">{selectedConv.orderDetails.status}</span>
                    </div>
                    <div className="order-sync">
                      <span>Delivered</span>
                      <input type="number" className="input days-input" value={daysInput} onChange={e => setDaysInput(e.target.value)} />
                      <span>days ago</span>
                      <button className="btn btn-secondary btn-sm" onClick={handleUpdateDays}><Icon.Refresh /> Sync</button>
                    </div>
                  </div>
                  <div className="chat-messages">
                    {messages.map(msg => (
                      <div key={msg._id} className={`msg-row ${msg.sender}`}>
                        <div className={`avatar ${msg.sender}`}>
                          {msg.sender === 'customer' ? initials(selectedConv.customerName) : 'AG'}
                        </div>
                        <div className={`msg-bubble ${msg.sender}`}>
                          <div className="msg-meta">{msg.sender === 'customer' ? selectedConv.customerName : 'Datastraw Agent'}</div>
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="msg-row agent">
                        <div className="avatar agent">AI</div>
                        <div className="msg-bubble agent">
                          <div className="msg-meta">Synthesizing</div>
                          <div className="thinking"><span /><span /><span /></div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form className="composer" onSubmit={handleSendMessage}>
                    <div className={`role-toggle ${senderMode}`}>
                      <div className="role-indicator" />
                      <button type="button" className={senderMode === 'customer' ? 'active' : ''} onClick={() => setSenderMode('customer')}>
                        <Icon.User /> Customer
                      </button>
                      <button type="button" className={senderMode === 'agent' ? 'active' : ''} onClick={() => setSenderMode('agent')}>
                        <Icon.Headset /> Agent
                      </button>
                    </div>
                    <div className="composer-row">
                      <input ref={composerRef} type="text" className="input" placeholder={senderMode === 'customer' ? 'Type as customer…  (⌘K to focus)' : 'Type manual agent reply…'} value={inputText} onChange={e => setInputText(e.target.value)} />
                      <button type="submit" className="btn btn-primary" disabled={!inputText.trim()}><Icon.Send /> Send</button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="empty-state">
                  <Icon.Terminal />
                  <div className="empty-title">No conversation selected</div>
                  <div className="empty-sub">Pick a session from the left to begin.</div>
                </div>
              )}
            </div>

            <div className={`panel ${aiPanelOpen ? 'open' : ''}`}>
              <div className="panel-header">
                <h2 className="panel-title-ai"><Icon.Sparkles /> AI Synthesis</h2>
                <button className="btn btn-primary btn-sm" onClick={handleGenerateReply} disabled={aiLoading || !selectedConv} title="Generate reply (⌘G)">
                  {aiLoading ? <><span className="spinner" /> Processing</> : aiResult ? <><Icon.Refresh /> Regenerate</> : <><Icon.Sparkles /> Generate</>}
                </button>
              </div>
              <div className="ai-body">
                {!aiResult && !aiLoading && (
                  <div className="empty-state">
                    <Icon.Sparkles />
                    <div className="empty-title">Ready to synthesize</div>
                    <div className="empty-sub">Generate a grounded reply for {selectedConv?.brandId?.name || 'the selected brand'}.</div>
                  </div>
                )}
                {aiLoading && !aiResult && (
                  <div className="empty-state">
                    <div className="thinking"><span /><span /><span /></div>
                    <div className="empty-title">Retrieving policies…</div>
                    <div className="empty-sub">Matching against brand knowledge base</div>
                  </div>
                )}
                {aiResult && (
                  <>
                    <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 10px', borderRadius: '999px', backgroundColor: aiResult.generationSource === 'GEMINI_AI' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)', color: aiResult.generationSource === 'GEMINI_AI' ? '#4ade80' : '#fbbf24', border: `1px solid ${aiResult.generationSource === 'GEMINI_AI' ? 'rgba(74, 222, 128, 0.25)' : 'rgba(251, 191, 36, 0.25)'}`, marginBottom: '4px' }}>
                     {aiResult.generationSource === 'OPENROUTER_AI' ? '⚡ OpenRouter Free AI Active' : '⚠️ Offline Fallback Mode'}
                    </div>
                    
                    <div className={`guardrail ${aiResult.guardrailStatus}`}>
                      <div className="guardrail-icon">{guardrailIcon(aiResult.guardrailStatus)}</div>
                      <div className="guardrail-content">
                        <div className="guardrail-label">{aiResult.guardrailStatus.replace(/_/g, ' ')}</div>
                        <div className="guardrail-detail">{aiResult.guardrailWarning}</div>
                      </div>
                    </div>
                    <div>
                      <div className="section-label"><span>Retrieved Context</span><span className="count">{aiResult.retrievedContext.length} matches</span></div>
                      {aiResult.retrievedContext.length === 0 ? (
                        <div className="context-card" style={{ color: 'var(--missing)' }}>
                          <div className="ctx-title"><Icon.Alert /> No matching policies</div>
                          <div className="ctx-body" style={{ WebkitLineClamp: 'unset', display: 'block' }}>The AI has been instructed not to guess. Verify manually.</div>
                        </div>
                      ) : (
                        aiResult.retrievedContext.map((ctx, idx) => <ContextCard key={idx} title={ctx.title} content={ctx.content} />)
                      )}
                    </div>
                    <div>
                      <div className="section-label">
                        <span>Suggested Reply</span>
                        {editableReply.trim() !== (aiResult.suggestedReply || '').trim() && <span className="count" style={{ color: 'var(--restriction)' }}>Edited</span>}
                      </div>
                      <div className="draft-editor">
                        <textarea value={editableReply} onChange={e => setEditableReply(e.target.value)} placeholder="AI-generated reply will appear here…" />
                        <div className="draft-footer">
                          <span className={editableReply.length > 500 ? 'char-count warn' : 'char-count'}>{editableReply.length} / 500</span>
                          {editableReply.trim() !== (aiResult.suggestedReply || '').trim() && <span className="edited-flag"><Icon.Edit /> Modified</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleApproveReply} disabled={!editableReply.trim()}><Icon.Check /> Approve & Send</button>
                      <button className="btn btn-secondary btn-icon" onClick={handleGenerateReply} disabled={aiLoading} title="Regenerate"><Icon.Refresh /></button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {!aiPanelOpen && <button className="btn btn-primary ai-fab" onClick={() => setAiPanelOpen(true)}><Icon.Sparkles /> AI</button>}
          </div>
        )}

        {activeTab === 'kb' && (
          <div className="kb-layout">
            <div className="panel">
              <div className="panel-header">
                <h2><Icon.Book /> Knowledge Base</h2>
                <select className="input" style={{ width: 200, padding: '0.45rem 0.7rem', fontSize: '0.75rem' }} value={selectedKbBrand} onChange={handleKbBrandChange}>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="kb-list">
                {policies.length === 0 ? (
                  <div className="empty-state">
                    <Icon.File />
                    <div className="empty-title">No policies yet</div>
                    <div className="empty-sub">Create the first policy for this brand.</div>
                  </div>
                ) : (
                  policies.map((p) => (
                    <div key={p._id} className="policy-card">
                      <h3>{p.title}</h3>
                      <p>{p.content}</p>
                      <div className="policy-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(p)}><Icon.Edit /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeletePolicy(p._id)}><Icon.Trash /> Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><h2 className="panel-title-ai">{editingPolicy ? <><Icon.Edit /> Edit Policy</> : <><Icon.Plus /> New Policy</>}</h2></div>
              <form className="kb-form" onSubmit={handleSavePolicy}>
                <div className="form-group">
                  <label>Policy Title</label>
                  <input type="text" className="input" placeholder="e.g. Return Policy — 14 days" value={kbTitle} onChange={e => setKbTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Policy Content</label>
                  <textarea className="input textarea" style={{ minHeight: 220 }} placeholder="Write the policy content the AI should reference…" value={kbContent} onChange={e => setKbContent(e.target.value)} required />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingPolicy ? <><Icon.Check /> Save Changes</> : <><Icon.Plus /> Create Policy</>}</button>
                  {editingPolicy && <button type="button" className="btn btn-secondary" onClick={() => { setEditingPolicy(null); setKbTitle(''); setKbContent(''); }}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-layout">
            {auditLogs.length === 0 ? (
              <div className="empty-state">
                <Icon.Activity />
                <div className="empty-title">No audit entries yet</div>
                <div className="empty-sub">Approved and edited replies will appear here.</div>
              </div>
            ) : (
              auditLogs.map((log) => {
                const edited = log.responseType === 'ai_edited_by_agent';
                const manual = log.responseType === 'manual_agent_reply';
                return (
                  <div key={log._id} className="log-card">
                    <div className="log-header">
                      <div className="log-title">
                        <span className="brand-chip">{log.brandId?.name}</span>
                        <span style={{ color: 'var(--text-3)' }}>·</span>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.7rem' }}>Conv #{String(log.conversationId?._id ?? log.conversationId ?? '').slice(-6) || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className={`log-type ${edited ? 'edited' : manual ? 'manual' : ''}`}>{log.responseType.replace(/_/g, ' ')}</span>
                        <span className="log-time">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="log-payload"><strong style={{ color: 'var(--text-3)', marginRight: 6 }}>CUSTOMER:</strong>"{log.customerMessage}"</div>
                    <div className="log-grid">
                      <div>
                        <strong>AI Synthesis</strong>
                        <div className="ai-out">{log.aiGeneratedResponse || '— Manual override —'}</div>
                      </div>
                      <div>
                        <strong>Final Dispatched</strong>
                        <div className={`final-out ${edited ? 'edited' : ''}`}>{log.finalResponse}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <Toast items={toasts} />
    </>
  );
}

export default App;