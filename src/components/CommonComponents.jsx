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
  const isUnlock = planName === 'unlock' || creditsCount === 19;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ textAlign: 'center', padding: '40px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h3 className="modal-title" style={{ fontSize: '22px', fontWeight: '850', marginBottom: '8px', color: '#0F172A', fontFamily: 'var(--font-title)' }}>
          {isUnlock ? 'Report Unlocked!' : 'Subscription Activated!'}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
          {isUnlock ? (
            <span>You have successfully unlocked access to this spend report. You can now view all optimization details and checklists.</span>
          ) : (
            <span>You are now subscribed to the <strong>{planName === 'enterprise' ? 'Enterprise' : 'Professional'} Plan</strong>! Your extended auditing limits are now active.</span>
          )}
        </p>
        <button onClick={onClose} className="btn btn-black" style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '750' }}>
          Awesome, thank you!
        </button>
      </div>
    </div>
  );
}

export function CheckoutModal({ show, type, price, onConfirm, onClose }) {
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [name, setName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
        border: '1px solid #E2E8F0',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          border: 'none',
          background: 'none',
          fontSize: '20px',
          color: '#94A3B8',
          cursor: 'pointer'
        }}>✕</button>

        <h3 style={{ fontSize: '22px', fontWeight: '850', color: '#0F172A', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>
          Secure Checkout
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', lineHeight: '1.4' }}>
          Enter payment details to confirm your Audex AI optimization upgrade.
        </p>

        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.05em' }}>Item</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', marginTop: '2px' }}>
              {type === 'pro' && 'Professional Subscription'}
              {type === 'enterprise' && 'Enterprise Subscription'}
              {type !== 'pro' && type !== 'enterprise' && 'Single Report Unlock'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.05em' }}>Total</div>
            <div style={{ fontSize: '18px', fontWeight: '950', color: '#10B981', marginTop: '2px' }}>
              ${price}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Cardholder Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #D2D6DC',
                fontSize: '13.5px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Card Number</label>
            <input 
              type="text" 
              required
              placeholder="4111 1111 1111 1111"
              maxLength="19"
              value={cardNumber}
              onChange={(e) => {
                let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let matches = v.match(/\d{4,16}/g);
                let match = matches && matches[0] || '';
                let parts = [];
                for (let i=0, len=match.length; i<len; i+=4) {
                  parts.push(match.substring(i, i+4));
                }
                if (parts.length > 0) {
                  setCardNumber(parts.join(' '));
                } else {
                  setCardNumber(v);
                }
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #D2D6DC',
                fontSize: '13.5px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Expiration</label>
              <input 
                type="text" 
                required
                placeholder="MM/YY"
                maxLength="5"
                value={expiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9]/g, '');
                  if (v.length >= 2) {
                    setExpiry(v.substring(0,2) + '/' + v.substring(2,4));
                  } else {
                    setExpiry(v);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #D2D6DC',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>CVV</label>
              <input 
                type="password" 
                required
                placeholder="•••"
                maxLength="3"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #D2D6DC',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-green"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: '750',
              fontSize: '14px',
              marginTop: '12px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            {isSubmitting ? 'Processing Payment...' : `Pay $${price} & Confirm`}
          </button>
        </form>
      </div>
    </div>
  );
}
