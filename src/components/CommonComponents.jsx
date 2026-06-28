import React from 'react';

export function LoadingIndicator() {
  return (
    <div className="app-container" style={{ backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '4px solid #F1F5F9',
          borderTopColor: 'var(--color-green-primary)',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '24px' }}>Auditing your AI usage stack...</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '300px' }}>
          Comparing subscription tiers, evaluating team overlaps, and calculating potential budget savings.
        </p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    </div>
  );
}

export function PurchaseSuccessModal({ show, planName, creditsCount, onClose }) {
  if (!show) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ textAlign: 'center', padding: '40px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h3 className="modal-title" style={{ fontSize: '24px', marginBottom: '8px' }}>Purchase Successful!</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          You have successfully purchased the <strong>{planName}</strong> package.
          <br />
          <strong>+{creditsCount} credits</strong> have been added to your account balance.
          </p>
        <button onClick={onClose} className="btn btn-black" style={{ width: '100%', padding: '12px' }}>
          Awesome, thank you!
        </button>
      </div>
    </div>
  );
}
