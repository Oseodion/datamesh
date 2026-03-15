import { useState, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { shelbynetClient as shelbyClient } from '../lib/shelby'

const colorForType = (name: string) => {
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE'
  const map: Record<string, string> = {
    CSV: '#f472b6', PNG: '#4ade80', ZIP: '#60a5fa', PDF: '#f472b6',
    MP4: '#a78bfa', JSON: '#4ade80', TAR: '#60a5fa', BIN: '#a78bfa',
    JPEG: '#4ade80', JPG: '#4ade80', TXT: '#60a5fa', VCF: '#f472b6',
    PPTX: '#f472b6', DOCX: '#60a5fa', XLSX: '#4ade80',
  }
  return map[ext] || '#8a7a70'
}

const formatSize = (bytes: number) => {
  if (!bytes) return 'Unknown'
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(1) + ' KB'
}

export default function MyFiles() {
  const { connected, account } = useWallet()
  const [blobs, setBlobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!account) return
    setIsLoading(true)
    shelbyClient.coordination.getAccountBlobs({ account: account.address.toString() })
      .then(data => {
        setBlobs((data || []).filter((b: any) => !b.isDeleted))
        setIsLoading(false)
      })
      .catch(() => { setError(true); setIsLoading(false) })
  }, [account])

  const handleDownload = async (blob: any) => {
    const key = blob.blobNameSuffix
    setDownloading(key)
    try {
      const ownerBytes = blob.owner?.data || {}
      const account = "0x" + Object.values(ownerBytes).map((b: any) => b.toString(16).padStart(2, "0")).join("")
      const result = await shelbyClient.download({ account, blobName: blob.blobNameSuffix })
      const reader = result.readable.getReader()
      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      const uint8 = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
      let offset = 0
      for (const chunk of chunks) { uint8.set(chunk, offset); offset += chunk.length }
      const url = URL.createObjectURL(new Blob([uint8]))
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
      if (isMobile) {
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = blob.blobNameSuffix
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (err) {
      console.error('Download failed:', err)
    }
    setDownloading(null)
  }

  if (!connected) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' as const }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
          </svg>
        </div>
        <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connect your wallet</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Connect your Petra wallet to view your uploaded files</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>My Files</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace" }}>
          {account?.address?.toString().slice(0, 6)}...{account?.address?.toString().slice(-4)}
        </p>
      </div>

      {isLoading && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>Loading your files from Shelby...</div>}
      {error && <div style={{ textAlign: 'center', color: '#f87171', padding: '64px 0', fontSize: 14 }}>Could not load files. Check your connection.</div>}
      {!isLoading && !error && blobs.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>You have not uploaded any files yet.</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {blobs.map(blob => {
          const fileName = blob.blobNameSuffix || blob.name
          const color = colorForType(fileName)
          const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE'
          const isDownloading = downloading === blob.blobNameSuffix

          return (
            <div key={blob.name} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '20px',
              display: 'flex', flexDirection: 'column' as const, gap: 12,
              transition: 'border-color .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '18', border: '1px solid ' + color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  </svg>
                </div>
                {blob.isWritten
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', background: '#60a5fa18', border: '1px solid #60a5fa30', padding: '3px 8px', borderRadius: 20 }}>Yours</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: '#f59e0b18', border: '1px solid #f59e0b30', padding: '3px 8px', borderRadius: 20 }}>Pending</span>
                }
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{fileName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ext} · {formatSize(blob.size)}</div>
              </div>

              {blob.isWritten ? (
                <button onClick={() => handleDownload(blob)} disabled={isDownloading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: isDownloading ? 'var(--surface2)' : 'var(--accent)',
                  color: isDownloading ? 'var(--muted)' : 'var(--on-accent)',
                  border: 'none', cursor: isDownloading ? 'not-allowed' : 'pointer',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {isDownloading ? 'Downloading...' : 'Download'}
                </button>
              ) : (
                <a href={`https://explorer.shelby.xyz/shelbynet/account/${account?.address?.toString()}`} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: 'var(--surface2)', color: '#f59e0b',
                  border: '1px solid #f59e0b30', cursor: 'pointer', textDecoration: 'none',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  View on Explorer
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
