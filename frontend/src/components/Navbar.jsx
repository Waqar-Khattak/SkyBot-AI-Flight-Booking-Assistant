import React from 'react'
import { Plane, Sparkles, RotateCcw, ShieldCheck } from 'lucide-react'

export default function Navbar({ onClearChat }) {
  return (
    <header style={{
      height: 70,
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'relative',
      zIndex: 20
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #38bdf8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer'
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) rotate(-3deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
        >
          <Plane size={24} color="#ffffff" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--airline-navy)',
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              SkyBot <span style={{
                background: 'linear-gradient(135deg, #1d4ed8, #0284c7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900
              }}>Flights</span>
            </h1>
            <span style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              AI Assistant
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, margin: '2px 0 0 0' }}>
            Instant search, verified schedules & automated booking
          </p>
        </div>
      </div>

      {/* Middle Status Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 16px',
        borderRadius: 30,
        background: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        fontSize: 12.5,
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--airline-emerald)',
            display: 'inline-block',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }} />
          <span style={{ fontWeight: 600, color: 'var(--airline-navy)' }}>Active Flight Schedule</span>
        </div>
        <span style={{ color: '#cbd5e1' }}>•</span>
        <span style={{ color: '#0369a1', fontWeight: 600 }}>60 Realtime Routes</span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
          border: '1px solid #bbf7d0',
          fontSize: 12,
          fontWeight: 600,
          color: '#15803d'
        }}>
          <ShieldCheck size={15} />
          <span>Groq LLM Verified</span>
        </div>

        {onClearChat && (
          <button
            onClick={onClearChat}
            title="Start new conversation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 10,
              background: '#ffffff',
              border: '1.5px solid var(--glass-border)',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--airline-blue)'
              e.currentTarget.style.color = 'var(--airline-blue)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--glass-border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
          >
            <RotateCcw size={14} />
            <span>New Chat</span>
          </button>
        )}
      </div>
    </header>
  )
}
