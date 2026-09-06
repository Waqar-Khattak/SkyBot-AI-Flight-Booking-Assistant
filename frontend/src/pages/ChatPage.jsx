import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Plane, Compass, Sparkles, ShieldCheck, ArrowRight, Luggage, Wifi, Coffee } from 'lucide-react'
import BookingModal from '../components/BookingModal'

const POPULAR_DESTINATIONS = [
  { city: "Paris", route: "London → Paris", query: "Search flights from London to Paris", price: "$85", icon: "🗼", airline: "British Airways" },
  { city: "New York", route: "London → New York", query: "Show flights from London to New York", price: "$480", icon: "🗽", airline: "Virgin Atlantic" },
  { city: "Dubai", route: "Dubai → London", query: "Find flights from Dubai to London", price: "$390", icon: "🌆", airline: "Emirates" },
  { city: "Tokyo", route: "Tokyo → Sydney", query: "Show flights from Tokyo to Sydney", price: "$870", icon: "⛩️", airline: "Japan Airlines" }
]

const SIDEBAR_CATEGORIES = [
  {
    category: "Quick Route Finder",
    items: [
      { label: "London to Paris", query: "Search flights from London to Paris", code: "LHR → CDG", price: "from $85" },
      { label: "Dubai to London", query: "Find flights from Dubai to London", code: "DXB → LHR", price: "from $390" },
      { label: "New York to LA", query: "Search flights from New York to Los Angeles on 2024-12-10", code: "JFK → LAX", price: "from $260" },
      { label: "Tokyo to Sydney", query: "Show flights from Tokyo to Sydney", code: "HND → SYD", price: "from $870" },
      { label: "London to New York", query: "Show flights from London to New York", code: "LHR → JFK", price: "from $480" }
    ]
  },
  {
    category: "Booking Desk",
    items: [
      { label: "Check Booking SKY123456", query: "Check my booking SKY123456", code: "Lookup", price: "Active" },
      { label: "Cancellation Policy", query: "What is your flight cancellation policy?", code: "Policy", price: "Free" }
    ]
  }
]

function getCurrentTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      time: getCurrentTimeString(),
      isWelcome: true,
      content: "Hello! Welcome to **SkyBot Flights** ✈️\n\nI can help you search available routes, compare live prices, check flight schedules, and complete instant ticket bookings directly from our database.\n\nChoose a destination below or tell me where you'd like to travel!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingModal, setBookingModal] = useState(null)
  const [allFlights, setAllFlights] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch('/flights')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllFlights(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')

    const userMessageObj = { role: 'user', content: userMsg, time: getCurrentTimeString() }
    const newMessages = [...messages, userMessageObj]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply, time: getCurrentTimeString() }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please ensure the backend server is active and try again.",
          time: getCurrentTimeString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (flightId, name, email) => {
    const res = await fetch('/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flight_id: flightId, passenger_name: name, passenger_email: email })
    })
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || 'Failed to complete booking.')
    }
    const data = await res.json()
    setBookingModal(null)
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        time: getCurrentTimeString(),
        content: `🎉 **Booking Confirmed!**\n\nBooking Reference: **${data.booking_ref}**\n✈️ **${data.from} → ${data.to}**\n📅 Date: **${data.date}** | ⏰ **${data.departure_time} – ${data.arrival_time}**\n🏢 Carrier: **${data.airline}**\n💰 Total Fare: **$${data.price}**\n\nYour confirmed electronic ticket has been registered for **${data.passenger_name}** (${data.passenger_email}). Safe travels! 🛫`
      }
    ])
  }

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1d4ed8;">$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/•/g, '&bull;')
  }

  const extractFlightIds = (content) => {
    const matches = content.match(/FL\d{3}/g)
    return matches ? [...new Set(matches)] : []
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      height: 'calc(100vh - 70px)',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 280,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(226, 232, 240, 0.9)',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={17} color="#1d4ed8" />
          </div>
          <div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--airline-navy)' }}>
              Flight Explorer
            </span>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Instant route schedules</p>
          </div>
        </div>

        {/* Categories */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingRight: 4
        }}>
          {SIDEBAR_CATEGORIES.map((group, idx) => (
            <div key={idx}>
              <p style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
                paddingLeft: 4
              }}>
                {group.category}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(item.query)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.16s ease-out',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#93c5fd'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(37, 99, 235, 0.08)'
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--airline-navy)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        {item.code}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}>
                      {item.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Database Sync Tag */}
        <div style={{
          padding: '12px',
          borderRadius: 12,
          background: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <ShieldCheck size={14} color="#1d4ed8" />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1d4ed8' }}>
              Database Active
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
            60 verified flight routes ready to book.
          </p>
        </div>
      </aside>

      {/* Main Centered Chat Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Scrollable Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Centered Content Column (860px max-width) */}
          <div style={{
            maxWidth: 860,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            {messages.map((msg, i) => {
              const isBot = msg.role === 'assistant'
              const flightIds = isBot ? extractFlightIds(msg.content) : []

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    flexDirection: isBot ? 'row' : 'row-reverse',
                    alignItems: 'flex-start',
                    animation: 'messageSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    width: '100%'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isBot
                      ? 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)'
                      : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: 'white',
                    boxShadow: isBot
                      ? '0 3px 10px rgba(29, 78, 216, 0.2)'
                      : '0 3px 10px rgba(2, 132, 199, 0.2)'
                  }}>
                    {isBot ? <Bot size={20} /> : <User size={18} />}
                  </div>

                  {/* Message Bubble + Subcomponents */}
                  <div style={{
                    maxWidth: isBot ? '85%' : '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    width: '100%'
                  }}>
                    {/* Header: Sender & Time */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 5,
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontWeight: 500
                    }}>
                      <span>{isBot ? 'SkyBot Assistant' : 'You'}</span>
                      <span>•</span>
                      <span>{msg.time || getCurrentTimeString()}</span>
                    </div>

                    {/* Text Card */}
                    <div style={{
                      background: isBot ? '#ffffff' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                      color: isBot ? 'var(--airline-navy)' : '#ffffff',
                      padding: '16px 20px',
                      borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      border: isBot ? '1px solid rgba(226, 232, 240, 0.9)' : 'none',
                      boxShadow: isBot
                        ? '0 4px 16px -2px rgba(15, 23, 42, 0.04), 0 2px 4px rgba(15, 23, 42, 0.02)'
                        : '0 4px 14px rgba(29, 78, 216, 0.25)',
                      fontSize: 14,
                      lineHeight: 1.65,
                      width: 'fit-content'
                    }}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />

                    {/* Welcome Card: Quick Action Destinations (only in initial message) */}
                    {msg.isWelcome && (
                      <div style={{
                        marginTop: 14,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 10,
                        width: '100%'
                      }}>
                        {POPULAR_DESTINATIONS.map((dest, dIdx) => (
                          <button
                            key={dIdx}
                            onClick={() => sendMessage(dest.query)}
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: 12,
                              padding: '12px 14px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 4
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#3b82f6'
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.1)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#e2e8f0'
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 18 }}>{dest.icon}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: 4 }}>
                                {dest.price}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--airline-navy)', marginTop: 2 }}>
                              {dest.city}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {dest.route}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Flight Results Cards */}
                    {flightIds.length > 0 && (
                      <div style={{
                        marginTop: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        width: '100%'
                      }}>
                        {flightIds.map(fid => {
                          const flightInfo = allFlights.find(f => f.flight_id === fid)
                          return (
                            <div
                              key={fid}
                              style={{
                                background: '#ffffff',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: 14,
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                                gap: 14
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.borderColor = '#60a5fa'
                                e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(37, 99, 235, 0.12)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.borderColor = '#e2e8f0'
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.04)'
                              }}
                            >
                              {/* Left details */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 10,
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#1d4ed8'
                                }}>
                                  <Plane size={20} />
                                </div>

                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                      fontSize: 11.5,
                                      fontWeight: 700,
                                      color: '#1d4ed8',
                                      background: '#dbeafe',
                                      padding: '2px 7px',
                                      borderRadius: 5
                                    }}>
                                      {fid}
                                    </span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--airline-navy)' }}>
                                      {flightInfo?.airline || 'Scheduled Flight'}
                                    </span>
                                    <span style={{
                                      fontSize: 10.5,
                                      fontWeight: 600,
                                      color: '#059669',
                                      background: '#ecfdf5',
                                      padding: '1px 6px',
                                      borderRadius: 4
                                    }}>
                                      Direct
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                                    {flightInfo ? (
                                      <>
                                        <div>
                                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--airline-navy)' }}>
                                            {flightInfo.departure_time}
                                          </span>
                                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                                            {flightInfo.from}
                                          </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#94a3b8', fontSize: 11 }}>
                                          <span>───</span>
                                          <Plane size={12} style={{ transform: 'rotate(90deg)', color: '#1d4ed8' }} />
                                          <span>───</span>
                                        </div>

                                        <div>
                                          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--airline-navy)' }}>
                                            {flightInfo.arrival_time}
                                          </span>
                                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                                            {flightInfo.to}
                                          </span>
                                        </div>

                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                          ({flightInfo.date})
                                        </span>
                                      </>
                                    ) : (
                                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scheduled Option</span>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: 'var(--text-muted)' }}>
                                      <Luggage size={11} /> Baggage included
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: 'var(--text-muted)' }}>
                                      <Wifi size={11} /> Wi-Fi
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: 'var(--text-muted)' }}>
                                      <Coffee size={11} /> Refreshment
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price & Book CTA */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                {flightInfo?.price && (
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total</span>
                                    <p style={{ fontSize: 20, fontWeight: 800, color: '#059669', margin: 0 }}>
                                      ${flightInfo.price}
                                    </p>
                                  </div>
                                )}

                                <button
                                  onClick={() => setBookingModal(fid)}
                                  style={{
                                    padding: '9px 16px',
                                    borderRadius: 10,
                                    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                                    color: 'white',
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    boxShadow: '0 3px 10px rgba(29, 78, 216, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.16s ease-out',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 5px 14px rgba(29, 78, 216, 0.35)'
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(29, 78, 216, 0.25)'
                                  }}
                                >
                                  <span>Book</span>
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Typing Wave Animation */}
            {loading && (
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                animation: 'messageSlideUp 0.18s ease-out'
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 3px 10px rgba(29, 78, 216, 0.2)'
                }}>
                  <Bot size={20} />
                </div>

                <div style={{
                  background: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: '4px 16px 16px 16px',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#1d4ed8',
                      display: 'inline-block',
                      animation: 'typingBounce 1.4s infinite ease-in-out',
                      animationDelay: '0s'
                    }} />
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#1d4ed8',
                      display: 'inline-block',
                      animation: 'typingBounce 1.4s infinite ease-in-out',
                      animationDelay: '0.2s'
                    }} />
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#1d4ed8',
                      display: 'inline-block',
                      animation: 'typingBounce 1.4s infinite ease-in-out',
                      animationDelay: '0.4s'
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    SkyBot is querying live flight schedules...
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Bottom Input Bar — Contained in 860px Centered Column */}
        <div style={{
          padding: '14px 20px 20px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(226, 232, 240, 0.9)'
        }}>
          <div style={{
            maxWidth: 860,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Ask about flights, dates, prices, or lookup a reservation..."
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  background: '#ffffff',
                  color: 'var(--airline-navy)',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.18s'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#cbd5e1'
                  e.target.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.03)'
                }}
              />
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              title="Send Message"
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: loading || !input.trim()
                  ? '#e2e8f0'
                  : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                color: loading || !input.trim() ? '#94a3b8' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease-out',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                boxShadow: loading || !input.trim()
                  ? 'none'
                  : '0 3px 10px rgba(29, 78, 216, 0.25)'
              }}
              onMouseEnter={e => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 5px 14px rgba(29, 78, 216, 0.35)'
                }
              }}
              onMouseLeave={e => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(29, 78, 216, 0.25)'
                }
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {bookingModal && (
        <BookingModal
          flightId={bookingModal}
          onBook={handleBook}
          onClose={() => setBookingModal(null)}
        />
      )}
    </div>
  )
}
