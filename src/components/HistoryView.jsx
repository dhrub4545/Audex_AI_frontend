import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';

export default function HistoryView({
  pastAudits,
  user,
  onLogout,
  onNavigateToView,
  onLoadPastAuditDetail,
  onRefreshList,
  renderCoinDropdown,
  onDeleteAudit
}) {
  return (
    <div className="app-container">
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
            <button onClick={onRefreshList} className="btn btn-outline" style={{ fontSize: '13px' }}>
              🔄 Refresh List
            </button>
          </div>

          {pastAudits.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px' }}>📋</span>
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
                <div key={audit._id} className="history-card" style={{ cursor: 'default' }}>
                  <div className="history-card-header">
                    <div>
                      <span className="history-card-date" style={{ fontWeight: '600' }}>
                        {new Date(audit.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>👥 Team Size:</span>
                      <strong>{audit.teamSize} seats</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🛠 Active Tools:</span>
                      <strong>{audit.allocations?.length || 0} tools</strong>
                    </div>

                    {/* Compact Detailed Audited Tools Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '4px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '4px' }}>
                        📋 Audited Tools:
                      </div>
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
                  
                  <div style={{ 
                    borderTop: '1px dashed var(--color-border)', 
                    paddingTop: '14px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px' 
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '2px' }}>
                      🔍 View Saved Report:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button 
                        onClick={() => onLoadPastAuditDetail(audit._id, 'saved_plan')}
                        className="btn btn-outline"
                        style={{ 
                          fontSize: '11px', 
                          padding: '8px 10px', 
                          height: 'auto', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          borderColor: '#3B82F6',
                          color: '#2563EB',
                          backgroundColor: '#F0F9FF',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        📋 Final Plan
                      </button>
                      <button 
                        onClick={() => onLoadPastAuditDetail(audit._id, 'saved_report')}
                        className="btn btn-outline"
                        style={{ 
                          fontSize: '11px', 
                          padding: '8px 10px', 
                          height: 'auto', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          borderColor: '#10B981',
                          color: '#059669',
                          backgroundColor: '#F0FDF4',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        📊 Detailed Report
                      </button>
                    </div>
                    {onDeleteAudit && (
                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this saved audit?")) {
                            onDeleteAudit(audit._id);
                          }
                        }}
                        className="btn btn-outline"
                        style={{ 
                          fontSize: '11px', 
                          padding: '8px 10px', 
                          height: 'auto', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px',
                          borderColor: '#EF4444',
                          color: '#DC2626',
                          backgroundColor: '#FEF2F2',
                          fontWeight: '800',
                          cursor: 'pointer',
                          marginTop: '8px',
                          width: '100%',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        🗑️ Delete Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
