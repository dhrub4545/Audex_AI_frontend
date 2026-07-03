import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';

export default function HistoryView({
  pastAudits,
  user,
  onLogout,
  onNavigateToView,
  onLoadPastAuditDetail,
  onRefreshList,
  renderCoinDropdown
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
                    <span className="history-card-savings" style={{ color: '#10B981', fontSize: '18px' }}>
                      +${(audit.savings?.totalMonthly || 0).toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="history-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>👥 Team Size:</span>
                      <strong>{audit.teamSize} seats</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>💼 Use Case:</span>
                      <strong>{audit.useCase}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🛠 Active Tools:</span>
                      <strong>{audit.allocations?.length || 0} tools</strong>
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
