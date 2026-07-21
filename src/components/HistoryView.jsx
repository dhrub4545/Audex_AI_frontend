import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import logoImg from '../assets/audex-ai-logo.png';
import ChatDrawer from './ChatDrawer';
import {
  Users,
  Briefcase,
  Bot,
  Search,
  ClipboardCheck,
  BarChart3,
  RefreshCw,
  Target,
  Sparkles,
  Trash2,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function HistoryView({
  pastAudits,
  user,
  token,
  backendUrl = API_BASE_URL,
  onLogout,
  onNavigateToView,
  onLoadPastAuditDetail,
  onRefreshList,
  renderCoinDropdown,
  onDeleteAudit
}) {
  const [activeChatAudit, setActiveChatAudit] = useState(null);
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  return (
    <div className="app-container">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F8FAFC;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
      `}} />
      {/* Header */}
      <header className="navbar">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="nav-actions">
            {renderCoinDropdown && renderCoinDropdown()}
            {user && <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginRight: '8px' }}>Hi, {user.name}</span>}
            <button onClick={onLogout} className="btn btn-outline" style={{ marginRight: '8px' }}>
              Sign out
            </button>
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black">
              New Audit
            </button>
          </div>
        </div>
      </header>

      {/* History content */}
      <main className="main-content" style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="history-header">
            <div>
              <h2 style={{ fontSize: '32px' }}>Saved Audits History</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>Review past AI subscription audits saved to your database.</p>
            </div>
            <button onClick={onRefreshList} className="btn btn-outline" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} strokeWidth={2} /> Refresh List
            </button>
          </div>

          {pastAudits.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
              <ClipboardCheck size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{ marginTop: '16px' }}>No saved reports found</h3>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontSize: '14px' }}>
                Complete an audit wizard flow and the report will be saved to MongoDB.
              </p>
              <button onClick={() => onNavigateToView('step1')} className="btn btn-black" style={{ marginTop: '24px' }}>
                Run First Audit
              </button>
            </div>
          ) : (
            <div className="history-grid">
              {pastAudits.map((audit) => (
                <div key={audit._id} className="history-card" style={{ cursor: 'default', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="history-card-header">
                    <div>
                      <span className="history-card-date" style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {audit.isUnlocked === false ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }}>
                            <Lock size={10} /> Locked
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ECFDF5', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }}>
                            <ShieldCheck size={10} /> Unlocked
                          </span>
                        )}
                        <span>
                          {new Date(audit.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </span>
                    </div>
                    <span className="history-card-savings" style={{ 
                      color: (audit.savings?.totalMonthly || 0) >= 0 ? '#10B981' : '#EF4444', 
                      fontSize: '18px',
                      fontWeight: '800'
                    }}>
                      {(audit.savings?.totalMonthly || 0) >= 0 
                        ? `+$${(audit.savings?.totalMonthly || 0).toLocaleString()}/mo` 
                        : `-$${Math.abs(audit.savings?.totalMonthly || 0).toLocaleString()}/mo`}
                    </span>
                  </div>
                  <div className="history-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        <Users size={15} strokeWidth={2} /> Team Size:
                      </span>
                      <strong style={{ fontSize: '13px' }}>{audit.teamSize} seats</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        <Target size={15} strokeWidth={2} /> Audit Mode:
                      </span>
                      <strong style={{ 
                        fontSize: '11px',
                        fontWeight: '800',
                        color: audit.optimizationGoal === 'cost' ? '#DC2626' : (audit.optimizationGoal === 'quality' ? '#2563EB' : 'var(--color-green-primary)'),
                        backgroundColor: audit.optimizationGoal === 'cost' ? '#FEE2E2' : (audit.optimizationGoal === 'quality' ? '#EFF6FF' : 'var(--color-green-light)'),
                        padding: '2px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        {audit.optimizationGoal === 'cost' ? 'Cost Cutting' : (audit.optimizationGoal === 'quality' ? 'Quality Focus' : 'Performance Preservation Mode')}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        <Bot size={15} strokeWidth={2} /> Active Tools:
                      </span>
                      <strong style={{ fontSize: '13px' }}>{audit.allocations?.length || 0} tools</strong>
                    </div>

                    {/* Compact Detailed Audited Tools Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '4px' }}>
                        Audited Tools
                      </div>
                      <div 
                        className="custom-scrollbar"
                        data-lenis-prevent
                        style={{ 
                          maxHeight: '135px', 
                          overflowY: 'auto',
                          paddingRight: '4px'
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: '#334155' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }}>
                              <th style={{ padding: '4px 0', fontWeight: '800' }}>Tool</th>
                              <th style={{ padding: '4px 0', fontWeight: '800', textAlign: 'center' }}>Type</th>
                              <th style={{ padding: '4px 0', fontWeight: '800', textAlign: 'center' }}>Seats</th>
                              <th style={{ padding: '4px 0', fontWeight: '800', textAlign: 'right' }}>Use Case</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(audit.allocations || []).map((alloc, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '6px 0', fontWeight: '700', color: '#1E293B' }}>{alloc.toolName}</td>
                                <td style={{ padding: '6px 0', textAlign: 'center' }}>
                                  <span style={{ 
                                    fontSize: '8.5px', 
                                    fontWeight: '800', 
                                    color: alloc.type === 'api' ? '#2563EB' : '#059669',
                                    backgroundColor: alloc.type === 'api' ? '#EFF6FF' : '#ECFDF5',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    textTransform: 'uppercase'
                                  }}>
                                    {alloc.type === 'api' ? 'API' : 'Sub'}
                                  </span>
                                </td>
                                <td style={{ padding: '6px 0', textAlign: 'center', fontWeight: '600' }}>{alloc.seats || 1}</td>
                                <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '600', color: '#475569' }}>{alloc.purpose || 'Mixed'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    borderTop: '1px solid var(--color-border)', 
                    paddingTop: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    marginTop: 'auto'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button 
                        onClick={() => onLoadPastAuditDetail(audit._id, 'saved_plan')}
                        style={{ 
                          fontSize: '11.5px', 
                          padding: '10px 12px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text-primary)',
                          backgroundColor: '#FFFFFF',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <ClipboardCheck size={14} style={{ color: '#2563EB' }} /> Final Plan
                      </button>
                      <button 
                        onClick={() => onLoadPastAuditDetail(audit._id, 'saved_report')}
                        style={{ 
                          fontSize: '11.5px', 
                          padding: '10px 12px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text-primary)',
                          backgroundColor: '#FFFFFF',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <BarChart3 size={14} style={{ color: '#059669' }} /> Detailed Report
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveChatAudit(audit);
                        setShowChatDrawer(true);
                      }}
                      style={{ 
                        fontSize: '12px', 
                        padding: '11px 12px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '6px',
                        border: '1px solid var(--color-green-primary)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        backgroundColor: 'var(--color-green-primary)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginTop: '4px',
                        width: '100%',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-green-hover)';
                        e.currentTarget.style.borderColor = 'var(--color-green-hover)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-green-primary)';
                        e.currentTarget.style.borderColor = 'var(--color-green-primary)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <Sparkles size={14} /> Consult AI Spend Specialist
                    </button>

                    {onDeleteAudit && (
                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this saved audit?")) {
                            onDeleteAudit(audit._id);
                          }
                        }}
                        style={{ 
                          fontSize: '11px', 
                          padding: '6px 12px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          border: '1px solid transparent',
                          borderRadius: '8px',
                          color: 'var(--color-text-muted)',
                          backgroundColor: 'transparent',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginTop: '4px',
                          width: '100%',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#DC2626';
                          e.currentTarget.style.backgroundColor = '#FEF2F2';
                          e.currentTarget.style.borderColor = '#FCA5A5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <Trash2 size={13} /> Delete Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ChatDrawer 
        show={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        audit={activeChatAudit}
        token={token}
        backendUrl={backendUrl}
      />
    </div>
  );
}
