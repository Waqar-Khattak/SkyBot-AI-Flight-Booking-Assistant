import React, { useState } from 'react'
import Navbar from './components/Navbar'
import ChatPage from './pages/ChatPage'

export default function App() {
  const [chatSessionKey, setChatSessionKey] = useState(0)

  const handleClearChat = () => {
    setChatSessionKey(prev => prev + 1)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Navbar onClearChat={handleClearChat} />
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <ChatPage key={chatSessionKey} />
      </main>
    </div>
  )
}
