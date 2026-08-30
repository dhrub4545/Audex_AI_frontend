import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { ShieldCheck, AlertCircle, Zap, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

// Dynamically load official Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const isUnlock = planName === 'unlock' || planName === 'single_unlock' || creditsCount === 19;
  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div className="modal-card" style={{ textAlign: 'center', padding: '36px 28px', maxWidth: '420px', width: '100%', borderRadius: '24px', backgroundColor: '#FFFFFF', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: '48px', marginBottom: '14px' }}>🎉</div>
        <h3 className="modal-title" style={{ fontSize: '22px', fontWeight: '850', marginBottom: '8px', color: '#0F172A', fontFamily: 'var(--font-title)' }}>
          {isUnlock ? 'Report Unlocked!' : 'Payment Verified & Plan Active!'}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
          {isUnlock ? (
            <span>Your payment has been cryptographically confirmed by Razorpay. You now have full lifetime access to this spend audit report and developer checklists.</span>
          ) : (
            <span>Your subscription to the <strong>{planName === 'enterprise' ? 'Enterprise' : 'Professional'} Plan</strong> is confirmed by the banking gateway. All features are immediately active.</span>
          )}
        </p>
        <button onClick={onClose} className="btn btn-green" style={{ width: '100%', padding: '13px', borderRadius: '10px', fontWeight: '750', fontSize: '14px', cursor: 'pointer' }}>
          Awesome, Take Me There!
        </button>
      </div>
    </div>
  );
}

export function CheckoutModal({ show, type, auditId, token, onConfirm, onClose }) {
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  // Initialize secure Razorpay order from backend
  useEffect(() => {
    if (!show) {
      setOrder(null);
      setError(null);
      return;
    }

    const initOrder = async () => {
      setLoadingOrder(true);
      setError(null);
      try {
        const planId = (type === 'unlock' || type === 'single_unlock') ? 'single_unlock' : (type || 'pro');
        const res = await fetch(`${API_BASE_URL}/payment/create-upi-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ planId, auditId })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to initialize Razorpay payment order.');
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Payment order error:', err);
        setError(err.message || 'Could not connect to payment gateway.');
      } finally {
        setLoadingOrder(false);
      }
    };

    initOrder();
  }, [show, type, auditId, token]);

  if (!show) return null;

  // Launch Official Razorpay UPI & Banking Checkout Popup
  const handleOpenRazorpay = async () => {
    if (!order) return;

    if (!order.razorpayKeyId) {
      setError('Please add your RAZORPAY_KEY_ID in backend/.env to activate live payments.');
      return;
    }

    setError(null);
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setError('Could not connect to Razorpay secure checkout SDK. Please check your internet connection.');
      return;
    }

    const options = {
      key: order.razorpayKeyId,
      amount: Math.round(order.amountInr * 100),
      currency: 'INR',
      name: 'Audex AI',
      description: `${order.product?.name || 'Subscription'} Upgrade`,
      order_id: order.razorpayOrderId,
      prefill: {
        name: order.user?.name || '',
        email: order.user?.email || ''
      },
      theme: {
        color: '#10B981'
      },
      handler: async function (response) {
        setVerifying(true);
        setError(null);
        try {
          const res = await fetch(`${API_BASE_URL}/payment/verify-upi-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Cryptographic payment signature verification failed.');
          }

          const data = await res.json();
          onConfirm(data.user, type);
        } catch (err) {
          setError(err.message || 'Payment verification failed.');
        } finally {
          setVerifying(false);
        }
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay modal closed by user');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const planId = (type === 'unlock' || type === 'single_unlock') ? 'single_unlock' : (type || 'pro');
  const planTitle = planId === 'enterprise' ? 'Enterprise Subscription' : (planId === 'pro' ? 'Professional Subscription' : 'Single Report Unlock');
  const isEnterprise = planId === 'enterprise';
  const isPro = planId === 'pro';

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '16px',
      boxSizing: 'border-box'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '28px 24px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        boxSizing: 'border-box',
        border: '1px solid #E2E8F0',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '18px',
          right: '18px',
          border: 'none',
          background: '#F1F5F9',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#64748B',
          cursor: 'pointer'
        }}>✕</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#047857', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', border: '1px solid #A7F3D0' }}>
            <ShieldCheck size={13} style={{ marginRight: '4px' }} /> Razorpay Secure Gateway
          </span>
        </div>
        <h3 style={{ fontSize: '21px', fontWeight: '850', color: '#0F172A', margin: '4px 0 6px', fontFamily: 'var(--font-title)' }}>
          {planTitle}
        </h3>
        <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 18px', lineHeight: '1.4' }}>
          Instant bank-verified upgrade via UPI (Google Pay, PhonePe, Paytm, BHIM, Cred, QR) or Debit/Credit Cards.
        </p>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', color: '#B91C1C', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {loadingOrder ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', gap: '14px' }}>
            <div className="spinner" style={{
              width: '36px',
              height: '36px',
              border: '3px solid #E2E8F0',
              borderTopColor: 'var(--color-green-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}></div>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Connecting to Razorpay secure gateway...</span>
          </div>
        ) : order ? (
          <div>
            {/* Price Card with INR & USD conversion */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1.5px solid #E2E8F0',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>Amount Payable</div>
                <div style={{ fontSize: '24px', fontWeight: '950', color: '#10B981', marginTop: '2px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span>₹{order.amountInr?.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>INR</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: '750', backgroundColor: '#EDE9FE', color: '#7C3AED', padding: '3px 8px', borderRadius: '6px', display: 'inline-block' }}>
                  ${order.amountUsd} USD equivalent
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>
                  {order.product?.billingInterval === 'month' ? '30-Day Billing Cycle' : 'One-Time Payment'}
                </div>
              </div>
            </div>

            {/* What you get checklist */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', marginBottom: '10px' }}>
                What&apos;s Included in {order.product?.name}:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                {isEnterprise && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10B981" /> Full access to Live AI Model Auditor (624+ Models)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10B981" /> Unlimited tools audited per report
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10B981" /> Unlimited saved audit history retention
                    </div>
                  </>
                )}
                {isPro && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10B981" /> Audit up to 15 tools simultaneously
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10B981" /> Save &amp; track up to 10 past audit reports
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10B981" /> Complete migration checklists &amp; PDF exports
                    </div>
                  </>
                )}
                {!isEnterprise && !isPro && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={15} color="#10B981" /> Permanent lifetime unlock for this audit report
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Button: Opens Razorpay Checkout Popup */}
            <button
              type="button"
              onClick={handleOpenRazorpay}
              disabled={verifying}
              className="btn btn-green"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: '850',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                cursor: verifying ? 'wait' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {verifying ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  <span>Verifying Bank Payment...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Pay ₹{order.amountInr?.toLocaleString()} with Razorpay</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8' }}>
              <Lock size={12} />
              <span>Secured by Razorpay • UPI, GPay, PhonePe, Cards, NetBanking</span>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
