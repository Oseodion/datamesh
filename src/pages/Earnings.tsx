import { useState, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { shelbynetClient as shelbyClient } from '../lib/shelby'

export default function Earnings() {
  const { connected, account } = useWallet()
  const [blobs, setBlobs] = useState<any[]>([])

  useEffect(() => {
    if (!account) return
    shelbyClient.coordination.getAccountBlobs({ account: account.address.toString() })
      .then(data => setBlobs((data || []).filter((b: any) => !b.isDeleted)))
      .catch(() => {})
  }, [account])

  if (!connected) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' as const }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
        <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connect your wallet</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Connect your Petra wallet to view your earnings</p>
      </div>
    )
  }

  const fileCount = blobs.length
  const totalBytes = blobs.reduce((sum, b) => sum + (b.size || 0), 0)
  const totalMB = (totalBytes / 1024 / 1024).toFixed(1)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>Earnings</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Revenue from your files being downloaded</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Earned', value: '0.0 SUSD', color: '#4ade80' },
          { label: 'Files Uploaded', value: String(fileCount), color: 'var(--accent)' },
          { label: 'Total Storage', value: `${totalMB} MB`, color: 'var(--accent)' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 10 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: -0.5, wordBreak: 'break-word' as const }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px', textAlign: 'center' as const }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Transaction History</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          Payment channel history coming soon. Upload files and share them to start earning SUSD.
        </div>
      </div>
    </div>
  )
}
