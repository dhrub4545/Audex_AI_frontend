import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { 
  User, Mail, Calendar, ShieldCheck, Zap, Sparkles, Clock, 
  CreditCard, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, 
  FileText, ExternalLink, Lock, Check, Copy, CheckCheck, Home,
  TrendingDown, Layers, ChevronRight
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ProfileView({
  user,
  token,
  onNavigateToView,
  onNavigateToLanding,
  onNavigateToStep1,
  onNavigateToHistory,
  onNavigateToModelAuditor,
  onNavigateToMarketIntel,
  onNavigateToSignIn,
  onLogout,
  onPurchase,
  renderCoinDropdown
}) {
  const [subStatus, setSubStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  const fetchSubscriptionDetails = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payment/subscription-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch live subscription status:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSubscriptionDetails();
    } else {
      setLoading(false);
    }
  }, [token, fetchSubscriptionDetails]);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your active subscription? Your plan benefits will stay active until the end of your current 30-day billing cycle.')) {
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/payment/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCancelMessage(data.message || 'Subscription canceled.');
        fetchSubscriptionDetails();
      }
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Date formatting helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Compute expiration countdown
  const getDaysRemaining = (expiresDateStr) => {
    if (!expiresDateStr) return null;
    const exp = new Date(expiresDateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const currentPlan = (subStatus?.plan || user?.plan || 'free').toLowerCase();
  const isEnterprise = currentPlan === 'enterprise';
  const isPro = currentPlan === 'pro';
  const isFree = !isEnterprise && !isPro;

  const subscriptionObj = subStatus?.subscription || user?.subscription || {};
  const startedAt = subscriptionObj.startedAt || user?.createdAt || new Date().toISOString();
  
  // Robust expiry date calculation
  let expiresAt = subscriptionObj.expiresAt;
  if (!expiresAt && !isFree) {
    const startMs = new Date(startedAt).getTime();
    expiresAt = new Date(startMs + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  const daysRemaining = getDaysRemaining(expiresAt);
  const status = subscriptionObj.status || (isFree ? 'none' : 'active');

  const transactions = subStatus?.recentTransactions || [];
  const unlockedAudits = subStatus?.unlockedAudits || user?.unlockedAudits || [];

  return (
    <div className="app-container" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        onLogout={onLogout}
        onNavigateToLanding={onNavigateToLanding}
        onNavigateToStep1={onNavigateToStep1}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToModelAuditor={onNavigateToModelAuditor}
        onNavigateToMarketIntel={onNavigateToMarketIntel}
        onNavigateToSignIn={onNavigateToSignIn}
        onNavigateToProfile={() => onNavigateToView('profile')}
        activeView="profile"
        renderCoinDropdown={renderCoinDropdown}
      />

      <main className="main-content" style={{ flex: 1, padding: '36px 16px 64px' }}>
        <div className="container" style={{ maxWidth: '980px', margin: '0 auto' }}>

          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: '#64748B' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} style={{ color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Home size={14} /> Home
            </a>
            <ChevronRight size={14} />
            <span style={{ color: '#0F172A', fontWeight: '700' }}>Account &amp; Subscription</span>
          </div>

          {/* Top User Profile Header Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '28px 24px',
            marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: '280px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: isEnterprise ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : isPro ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #475569, #334155)',
                color: '#FFFFFF',
                fontSize: '24px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isEnterprise ? '0 6px 18px rgba(124, 58, 237, 0.25)' : isPro ? '0 6px 18px rgba(16, 185, 129, 0.25)' : 'none'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '850', color: '#0F172A', margin: 0, fontFamily: 'var(--font-title)' }}>
                    {user?.name || 'User Account'}
                  </h1>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    backgroundColor: isEnterprise ? '#F5F3FF' : isPro ? '#ECFDF5' : '#F1F5F9',
                    color: isEnterprise ? '#7C3AED' : isPro ? '#047857' : '#475569',
                    border: `1px solid ${isEnterprise ? '#DDD6FE' : isPro ? '#A7F3D0' : '#E2E8F0'}`
                  }}>
                    {isEnterprise ? 'Enterprise' : isPro ? 'Professional' : 'Free Tier'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '13px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={14} /> {user?.email}
                  </span>
                  {user?.createdAt && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} /> Member since {formatShortDate(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => fetchSubscriptionDetails(true)}
                disabled={refreshing || loading}
                className="btn btn-outline"
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155'
                }}
                title="Sync live status from payment server"
              >
                <RefreshCw size={13} className={(refreshing || loading) ? 'spin-icon' : ''} />
                <span>{refreshing ? 'Syncing...' : (loading && !subStatus) ? 'Loading...' : 'Refresh Status'}</span>
              </button>

              <button
                onClick={() => onPurchase(isEnterprise ? 'enterprise' : isPro ? 'enterprise' : 'pro')}
                className="btn btn-green"
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '750',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: (isPro || isEnterprise) ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : undefined,
                  border: (isPro || isEnterprise) ? 'none' : undefined,
                  color: '#FFFFFF',
                  boxShadow: (isPro || isEnterprise) ? '0 4px 14px rgba(124, 58, 237, 0.25)' : undefined
                }}
              >
                <Sparkles size={14} /> {isEnterprise ? 'Renew Enterprise' : isPro ? 'Upgrade to Enterprise' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>

          {cancelMessage && (
            <div style={{ padding: '12px 18px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', color: '#92400E', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertCircle size={16} />
              <span>{cancelMessage}</span>
            </div>
          )}

          {/* Main Grid: Subscription Details & Entitlements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>

            {/* Subscription & Expiration Status Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>
                      Current Plan
                    </span>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', margin: '2px 0 0', fontFamily: 'var(--font-title)' }}>
                      {isEnterprise ? 'Enterprise Plan' : isPro ? 'Professional Plan' : 'Free Tier'}
                    </h2>
                  </div>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: status === 'active' ? '#ECFDF5' : status === 'canceled' ? '#FEF3C7' : '#F1F5F9',
                    color: status === 'active' ? '#047857' : status === 'canceled' ? '#B45309' : '#64748B',
                    border: `1px solid ${status === 'active' ? '#A7F3D0' : status === 'canceled' ? '#FDE68A' : '#E2E8F0'}`
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status === 'active' ? '#10B981' : status === 'canceled' ? '#F59E0B' : '#94A3B8' }}></span>
                    {status === 'active' ? 'Active' : status === 'canceled' ? 'Cancels at Period End' : isFree ? 'Free Active' : 'Inactive'}
                  </span>
                </div>

                {/* Price & Billing Info */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px 16px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Billing Rate:</span>
                    <span style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A' }}>
                      {isEnterprise ? '₹8,499 / month' : isPro ? '₹2,499 / month' : '₹0 / forever'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Payment Gateway:</span>
                    <span style={{ fontSize: '12.5px', fontWeight: '750', color: '#047857' }}>
                      Razorpay (UPI, GPay, PhonePe, Cards)
                    </span>
                  </div>
                </div>

                {/* Subscription Timeline & Expiration Dates */}
                {!isFree ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px 16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <Clock size={14} color="#64748B" /> Subscription Started:
                      </span>
                      <strong style={{ color: '#0F172A', fontWeight: '750' }}>{formatShortDate(startedAt)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <Calendar size={14} color="#64748B" /> Subscription Ends / Renews On:
                      </span>
                      <strong style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: '800' }}>
                        {formatDate(expiresAt)}
                      </strong>
                    </div>

                    <div style={{
                      marginTop: '4px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: daysRemaining <= 3 ? '#FEF2F2' : daysRemaining <= 7 ? '#FFFBEB' : '#ECFDF5',
                      border: `1px solid ${daysRemaining <= 3 ? '#FCA5A5' : daysRemaining <= 7 ? '#FDE68A' : '#A7F3D0'}`,
                      color: daysRemaining <= 3 ? '#B91C1C' : daysRemaining <= 7 ? '#B45309' : '#047857',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Clock size={14} />
                      <span>{daysRemaining !== null ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining in current 30-day billing cycle` : 'Active 30-day billing cycle'}</span>
                    </div>
                  </div>
                ) : null}

                {isFree && (
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px' }}>
                    You are currently on the Free Tier with up to 2 audited tools per report. Upgrade to Pro (₹2,499) or Enterprise (₹8,499) via UPI to unlock unlimited frontier models and deep history tracking.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                {isPro ? (
                  <>
                    <button
                      onClick={() => onPurchase('enterprise')}
                      className="btn"
                      style={{
                        flex: 1.3,
                        padding: '11px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '13px',
                        background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                        color: '#FFFFFF',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)'
                      }}
                    >
                      <Sparkles size={14} /> Upgrade to Enterprise (₹8,499)
                    </button>

                    <button
                      onClick={() => onPurchase('pro')}
                      className="btn btn-outline"
                      style={{
                        padding: '11px 14px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '12px',
                        color: '#047857',
                        borderColor: '#A7F3D0',
                        backgroundColor: '#ECFDF5',
                        cursor: 'pointer'
                      }}
                      title="Renew or extend your current Professional plan"
                    >
                      <RefreshCw size={13} /> Renew Pro
                    </button>
                  </>
                ) : isEnterprise ? (
                  <button
                    onClick={() => onPurchase('enterprise')}
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '13px',
                      background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={14} /> Extend Enterprise Subscription (₹8,499)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onPurchase('pro')}
                      className="btn btn-green"
                      style={{ flex: 1.2, padding: '11px', borderRadius: '10px', fontWeight: '750', fontSize: '13px', cursor: 'pointer' }}
                    >
                      <Sparkles size={14} /> Upgrade to Pro (₹2,499)
                    </button>
                    <button
                      onClick={() => onPurchase('enterprise')}
                      className="btn btn-outline"
                      style={{ padding: '11px 14px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', color: '#7C3AED', borderColor: '#DDD6FE', backgroundColor: '#F5F3FF', cursor: 'pointer' }}
                    >
                      Enterprise (₹8,499)
                    </button>
                  </>
                )}

                {!isFree && status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="btn btn-outline"
                    style={{ padding: '11px 14px', borderRadius: '10px', fontWeight: '650', fontSize: '12px', color: '#EF4444', borderColor: '#FCA5A5', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            </div>

            {/* Plan Entitlements & Features Overview */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>
                  Plan Capabilities
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: '2px 0 16px', fontFamily: 'var(--font-title)' }}>
                  Active Entitlements &amp; Limits
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Max Tools Audited:</span>
                    <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                      {isEnterprise ? 'Unlimited Tools' : isPro ? 'Up to 15 Tools' : 'Up to 2 Tools'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Live AI Model Auditor:</span>
                    <strong style={{ fontSize: '13px', color: isEnterprise ? '#7C3AED' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isEnterprise ? <><CheckCircle2 size={15} color="#7C3AED" /> Full Access</> : <><Lock size={14} /> Enterprise Only</>}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Audit History Retention:</span>
                    <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                      {isEnterprise ? 'Unlimited History' : isPro ? 'Last 10 Audits Saved' : 'No History Saving'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Unlocked Reports:</span>
                    <strong style={{ fontSize: '13px', color: '#047857' }}>
                      {unlockedAudits.length} Report{unlockedAudits.length !== 1 ? 's' : ''}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>PDF Exports &amp; Checklists:</span>
                    <strong style={{ fontSize: '13px', color: isFree ? '#94A3B8' : '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isFree ? <><Lock size={14} /> Pro &amp; Enterprise</> : <><CheckCircle2 size={15} color="#10B981" /> Enabled</>}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  onClick={onNavigateToHistory}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <FileText size={14} /> View Saved Audits
                </button>
                <button
                  onClick={onNavigateToModelAuditor}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Zap size={14} /> Model Auditor
                </button>
              </div>
            </div>

          </div>

          {/* Subscription Plans & Direct Activation Hub */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '28px 24px',
            marginBottom: '24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
          }}>
            <div style={{ marginBottom: '22px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>
                Subscription Management
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '2px 0 6px', fontFamily: 'var(--font-title)' }}>
                Available Plans &amp; Direct Activation
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                Activate, renew, or switch between Audex AI subscription tiers with instant UPI and card verification.
              </p>
            </div>

            {/* 3 Plan Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
              
              {/* 1. Free Tier */}
              <div style={{
                backgroundColor: isFree ? '#F8FAFC' : '#FFFFFF',
                borderRadius: '16px',
                border: isFree ? '2px solid #64748B' : '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Free Tier</h4>
                    {isFree && (
                      <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', marginBottom: '14px' }}>
                    ₹0 <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>/ forever</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Up to 2 Audited Tools</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Option A/B Spend Blueprints</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Full Market Intel Leaderboard</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}><Lock size={13} /> Live Model Auditor Access</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}><Lock size={13} /> Saved Audit History</li>
                  </ul>
                </div>
                <button
                  disabled={isFree}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    backgroundColor: isFree ? '#F1F5F9' : '#FFFFFF',
                    borderColor: '#CBD5E1',
                    color: isFree ? '#475569' : '#0F172A',
                    cursor: isFree ? 'default' : 'pointer'
                  }}
                >
                  {isFree ? 'Current Active Plan' : 'Base Included Tier'}
                </button>
              </div>

              {/* 2. Professional Plan */}
              <div style={{
                backgroundColor: isPro ? '#F0FDF4' : '#FFFFFF',
                borderRadius: '16px',
                border: isPro ? '2px solid #10B981' : '1.5px solid #A7F3D0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isPro ? '0 8px 24px -4px rgba(16,185,129,0.12)' : 'none'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Professional</h4>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: isPro ? '#DCFCE7' : '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '12px', border: '1px solid #86EFAC' }}>
                      {isPro ? 'CURRENT PLAN' : 'POPULAR'}
                    </span>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', marginBottom: '14px' }}>
                    ₹2,499 <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>/ month ($29)</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}><Check size={14} color="#10B981" /> <strong>Up to 15 Audited Tools</strong></li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Full PDF Exports &amp; Checklists</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Last 10 Audits Saved in History</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Priority AI Spend Assistant</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}><Lock size={13} /> Live Model Auditor Access</li>
                  </ul>
                </div>
                {isPro ? (
                  <button
                    onClick={() => onPurchase('pro')}
                    className="btn btn-outline"
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '750',
                      backgroundColor: '#ECFDF5',
                      borderColor: '#10B981',
                      color: '#047857',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Active (Click to Renew)
                  </button>
                ) : (
                  <button
                    onClick={() => onPurchase('pro')}
                    className="btn btn-green"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={14} /> Activate Pro (₹2,499)
                  </button>
                )}
              </div>

              {/* 3. Enterprise Plan */}
              <div style={{
                backgroundColor: isEnterprise ? '#FAF5FF' : '#FFFFFF',
                borderRadius: '16px',
                border: isEnterprise ? '2px solid #8B5CF6' : '1.5px solid #DDD6FE',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: '0 8px 24px -4px rgba(139,92,246,0.14)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Enterprise</h4>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#F5F3FF', color: '#7C3AED', padding: '2px 8px', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                      {isEnterprise ? 'CURRENT PLAN' : '⚡ FRONTIER ACCESS'}
                    </span>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', marginBottom: '14px' }}>
                    ₹8,499 <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>/ month ($99)</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#7C3AED' }}><Sparkles size={14} color="#7C3AED" /> <strong>Unlimited Tools Audited</strong></li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#7C3AED' }}><Zap size={14} color="#7C3AED" /> <strong>Live AI Model Auditor (570+ Models)</strong></li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Unlimited Saved Audit Reports</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Head-to-Head Model Deep Dives</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} color="#10B981" /> Full PDF &amp; Executive Briefs</li>
                  </ul>
                </div>
                {isEnterprise ? (
                  <button
                    onClick={() => onPurchase('enterprise')}
                    className="btn btn-outline"
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '750',
                      backgroundColor: '#F5F3FF',
                      borderColor: '#8B5CF6',
                      color: '#7C3AED',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Active (Click to Renew)
                  </button>
                ) : (
                  <button
                    onClick={() => onPurchase('enterprise')}
                    className="btn"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    <Sparkles size={14} /> Upgrade to Enterprise (₹8,499)
                  </button>
                )}
              </div>

            </div>

            {/* Single Report Unlock Banner */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} color="#2563EB" /> Need to unlock a single comprehensive audit without monthly renewal?
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Single Report Unlock provides lifetime access, PDF exports, and action plans for 1 audit up to 15 tools.
                </div>
              </div>
              <button
                onClick={() => onPurchase('single_unlock')}
                className="btn btn-outline"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#2563EB',
                  borderColor: '#93C5FD',
                  backgroundColor: '#EFF6FF',
                  cursor: 'pointer'
                }}
              >
                Unlock 1 Report (₹1,599)
              </button>
            </div>
          </div>

          {/* UPI Transaction History & Receipts Ledger */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>
                  Billing &amp; Invoices
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0', fontFamily: 'var(--font-title)' }}>
                  Recent Transactions
                </h3>
              </div>

              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                {transactions.length} record{transactions.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <CreditCard size={32} color="#94A3B8" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '14.5px', fontWeight: '750', color: '#334155', margin: '0 0 4px' }}>No payment transactions found yet</h4>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                  Your subscription upgrades and single report unlock receipts will appear here.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 12px' }}>Order ID</th>
                      <th style={{ padding: '10px 12px' }}>Product / Plan</th>
                      <th style={{ padding: '10px 12px' }}>Amount (INR)</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Razorpay Payment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id || tx.orderId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#1E293B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{tx.orderId}</span>
                            <button
                              onClick={() => handleCopy(tx.orderId, tx.orderId)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}
                              title="Copy Order ID"
                            >
                              {copiedOrderId === tx.orderId ? <CheckCheck size={13} color="#10B981" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: '700', color: tx.productId === 'enterprise' ? '#7C3AED' : tx.productId === 'pro' ? '#047857' : '#0F172A' }}>
                            {tx.productId === 'enterprise' ? 'Enterprise Plan' : tx.productId === 'pro' ? 'Professional Plan' : 'Single Report Unlock'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: '850', color: '#10B981' }}>
                          ₹{tx.amountInr?.toLocaleString() || tx.amountInr}
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500', marginLeft: '4px' }}>(${tx.amountUsd})</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            backgroundColor: tx.status === 'completed' ? '#ECFDF5' : '#FEF3C7',
                            color: tx.status === 'completed' ? '#047857' : '#B45309'
                          }}>
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#64748B' }}>
                          {formatShortDate(tx.createdAt)}
                        </td>
                        <td style={{ padding: '12px', color: '#475569', fontFamily: 'monospace', fontSize: '12px' }}>
                          {tx.utrNumber || 'Verified via UPI'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer
        onNavigateToStep1={onNavigateToStep1}
        onNavigateToLanding={onNavigateToLanding}
      />
    </div>
  );
}
