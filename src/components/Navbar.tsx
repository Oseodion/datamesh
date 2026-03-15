import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import UploadModal from './UploadModal'

const navLinks = [
  { label: 'Explore', path: '/explore', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/> },
  { label: 'My Files', path: '/my-files', icon: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/> },
  { label: 'Drive', path: '/drive', icon: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></> },
  { label: 'Earnings', path: '/earnings', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></> },
]

export default function Navbar() {
  const { connect, disconnect, connected, account, wallets } = useWallet()
  const [dark, setDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setMenuOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleWallet = () => {
    if (connected) disconnect()
    else {
      const petra = wallets?.find(w => w.name === 'Petra')
      if (petra) connect(petra.name)
    }
  }

  const walletLabel = connected && account
    ? `${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`
    : 'Connect Wallet'

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 28px',
          height: 58, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect x="2" y="20" width="26" height="7" rx="2.5" fill="var(--accent)" opacity=".15" stroke="var(--accent)" strokeWidth="1.5"/>
              <rect x="5" y="13" width="20" height="7" rx="2.5" fill="var(--accent)" opacity=".35" stroke="var(--accent)" strokeWidth="1.5"/>
              <rect x="8" y="6" width="14" height="7" rx="2.5" fill="var(--accent)" opacity=".7" stroke="var(--accent)" strokeWidth="1.5"/>
            </svg>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8 }}>
              Data<span style={{ color: 'var(--accent)' }}>Mesh</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {navLinks.map(link => (
              <Link key={link.label} to={link.path} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: location.pathname === link.path ? 'var(--text)' : 'var(--muted)',
                textDecoration: 'none',
                fontSize: 13, fontWeight: 500,
                padding: '6px 12px', borderRadius: 7,
                transition: 'all .15s', whiteSpace: 'nowrap' as const,
                background: location.pathname === link.path ? 'var(--surface2)' : 'transparent',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface2)' }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = location.pathname === link.path ? 'var(--text)' : 'var(--muted)'
                  e.currentTarget.style.background = location.pathname === link.path ? 'var(--surface2)' : 'transparent'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {link.icon}
                </svg>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Theme toggle */}
            <button onClick={() => setDark(!dark)} style={{
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {dark
                  ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
                  : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                }
              </svg>
            </button>

            {/* Upload button - desktop only */}
            <button className="desktop-only" onClick={() => setShowUpload(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              background: 'transparent',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              cursor: 'pointer',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Upload
            </button>

            {/* Connect wallet - desktop only */}
            <button className="desktop-only" onClick={handleWallet} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              background: connected ? 'transparent' : 'var(--accent)',
              color: connected ? 'var(--accent)' : 'var(--on-accent)',
              border: connected ? '1px solid var(--accent)' : 'none',
              cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
              </svg>
              {walletLabel}
            </button>

            {/* Burger - mobile only */}
            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{
              display: 'none', width: 36, height: 36, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--muted)', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            display: 'flex', flexDirection: 'column' as const, gap: 2,
            padding: '10px 16px 14px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)', alignItems: 'center',
          }}>
            {navLinks.map(link => (
              <Link key={link.label} to={link.path} onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                color: location.pathname === link.path ? 'var(--text)' : 'var(--muted)',
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                padding: '10px 20px', borderRadius: 8,
                width: '100%', maxWidth: 280, justifyContent: 'center',
                background: location.pathname === link.path ? 'var(--surface2)' : 'transparent',
              }}>
                {link.label}
              </Link>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0', width: '100%', maxWidth: 280 }} />
            <button onClick={() => { setMenuOpen(false); setShowUpload(true) }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              width: '100%', maxWidth: 280, padding: '10px 20px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              background: 'transparent', color: 'var(--accent)',
              border: '1px solid var(--accent)', cursor: 'pointer', marginBottom: 8,
            }}>
              Upload a File
            </button>
            <button onClick={() => { setMenuOpen(false); handleWallet() }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              width: '100%', maxWidth: 280, padding: '10px 20px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              background: connected ? 'transparent' : 'var(--accent)',
              color: connected ? 'var(--accent)' : 'var(--on-accent)',
              border: connected ? '1px solid var(--accent)' : 'none',
              cursor: 'pointer',
            }}>
              {walletLabel}
            </button>
          </div>
        )}
      </nav>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  )
}
