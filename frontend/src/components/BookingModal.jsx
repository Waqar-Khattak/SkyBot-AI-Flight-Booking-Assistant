import React, { useState, useEffect } from 'react'
import { X, Plane, User, Mail, Loader2, AlertCircle, CheckCircle2, Ticket, ShieldCheck } from 'lucide-react'

export default function BookingModal({ flightId, onBook, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flightDetails, setFlightDetails] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, onClose])

  useEffect(() => {
    if (flightId) {
      fetch(`/flights`)
        .then(res => res.json())
        .then(flights => {
          const match = flights.find(f => f.flight_id?.toUpperCase() === flightId.toUpperCase())
          if (match) setFlightDetails(match)
        })
        .catch(() => {})
    }
  }, [flightId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide your full passenger name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address for your confirmation ticket.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onBook(flightId, name.trim(), email.trim())
    } catch (err) {
      setError(err.message || 'Unable to confirm booking. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'modalScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        {/* Airline Header */}
        <div style={{
          padding: '22px 26px',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ticket size={20} color="#ffffff" />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#bfdbfe' }}>
                  Boarding Pass Checkout
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                  Confirm Flight Reservation
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Flight Summary Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: '#1d4ed8',
                  background: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {flightId}
                </span>
                <span style={{ fontSize: 12.5, color: '#ffffff', fontWeight: 600 }}>
                  {flightDetails?.airline || 'Verified Airline'}
                </span>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'white', margin: '6px 0 0 0' }}>
                {flightDetails ? `${flightDetails.from} ➔ ${flightDetails.to}` : 'Confirmed Route'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11, color: '#bfdbfe' }}>Total Price</span>
              <p style={{ fontSize: 19, fontWeight: 800, color: '#4ade80', margin: 0 }}>
                ${flightDetails?.price || 'Confirmed'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 26px' }}>
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 10,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'messageSlideUp 0.2s ease-out'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Passenger Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 6
            }}>
              Full Passenger Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                placeholder="e.g. Captain James Kirk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  background: '#f8fafc',
                  color: '#0f172a',
                  transition: 'all 0.18s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.background = '#ffffff'
                  e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.background = '#f8fafc'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 6
            }}>
              Email Address for E-Ticket Delivery
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="email"
                placeholder="e.g. james.kirk@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  background: '#f8fafc',
                  color: '#0f172a',
                  transition: 'all 0.18s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.background = '#ffffff'
                  e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.background = '#f8fafc'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Secure Guarantee Chip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11.5,
            color: '#64748b',
            marginBottom: 20
          }}>
            <ShieldCheck size={15} color="#059669" />
            <span>Instant booking confirmation code stored directly to database.</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '11px 18px',
                borderRadius: 10,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.15s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '11px 22px',
                borderRadius: 10,
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.28)',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(29, 78, 216, 0.38)'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 78, 216, 0.28)'
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Issuing E-Ticket...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Issue Confirmed Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
