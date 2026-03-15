import { useState, useEffect } from 'react'
import CLIGuideModal from '../components/CLIGuideModal'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { shelbynetClient as shelbyClient } from '../lib/shelby'

const typeColor: Record<string, string> = {
  PDF: '#f472b6', ZIP: '#60a5fa', CSV: '#f472b6',
  MP4: '#a78bfa', JSON: '#4ade80', DEFAULT: '#8a7a70',
}

export default function Drive() {
  const { connected, account } = useWallet()
  const [blobs, setBlobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showCLIGuide, setShowCLIGuide] = useState(false)

  useEffect(() => {
    if (!account) return
    setIsLoading(true)
    shelbyClient.coordination.getAccountBlobs({ account: account.address.toString() })
      .then(data => { setBlobs((data || []).filter((b: any) => !b.isDeleted)); setIsLoading(false) })
      .catch(() => { setError(true); setIsLoading(false) })
  }, [account])

  if (!connected) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' as const }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connect your wallet</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Connect your Petra wallet to access your decentralized drive</p>
      </div>
    )
  }

  const totalBytes = blobs.reduce((sum, b) => sum + (b.size || 0), 0)
  const totalMB = (totalBytes / 1024 / 1024).toFixed(1)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap' as const, gap: 16 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>Drive</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your personal decentralized storage on Shelby</p>
        </div>
        <button onClick={() => setShowCLIGuide(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: 'var(--on-accent)', border: 'none', cursor: 'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          How to Upload via CLI
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Storage used</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }}>{totalMB} MB</span>
        </div>
        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min((totalBytes / (10 * 1024 * 1024 * 1024)) * 100, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 99 }} />
        </div>
      </div>

      {isLoading && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>Loading your drive...</div>}
      {error && <div style={{ textAlign: 'center', color: '#f87171', padding: '64px 0', fontSize: 14 }}>Could not load files. Check your connection.</div>}
      {!isLoading && !error && blobs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>Your drive is empty. Upload a file to get started.</div>}

      {blobs.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
            {['Name', 'Type', 'Size'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: 0.6 }}>{h}</div>
            ))}
          </div>
          {blobs.map((blob, i) => {
            const ext = blob.name.split('.').pop()?.toUpperCase() || 'FILE'
            const color = typeColor[ext] || typeColor.DEFAULT
            const sizeKB = blob.size ? blob.size > 1024*1024 ? (blob.size/1024/1024).toFixed(1)+' MB' : (blob.size/1024).toFixed(1)+' KB' : '—'
            return (
              <div key={blob.name} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', padding: '14px 20px', alignItems: 'center', borderBottom: i < blobs.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', border: '1px solid ' + color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{blob.blobNameSuffix || blob.name}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ext}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sizeKB}</div>
              </div>
            )
          })}
        </div>
      )}
    {showCLIGuide && <CLIGuideModal onClose={() => setShowCLIGuide(false)} />}
    </div>
  )
}
