import { useState, useEffect } from 'react'
import { shelbyClient } from '../lib/shelby'

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

const getFileName = (fullName: string) => {
  const parts = fullName.split('/')
  return parts[parts.length - 1] || fullName
}

const PAGE_SIZE = 50

export default function Explore() {
  const [search, setSearch] = useState('')
  const [blobs, setBlobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [priceFilter, setPriceFilter] = useState<'free' | 'paid'>('free')
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setError(false)
    shelbyClient.coordination.getBlobs({
      pagination: { limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE },
    })
      .then(data => {
        const all = (data || []).filter((b: any) => b.isWritten && !b.isDeleted)
        setHasMore(all.length > PAGE_SIZE)
        setBlobs(all.slice(0, PAGE_SIZE))
        setIsLoading(false)
      })
      .catch(err => { console.error('Load error:', err); setError(true); setIsLoading(false) })
  }, [page])

  const filtered = blobs.filter(blob =>
    getFileName(blob.name).toLowerCase().includes(search.toLowerCase())
  )

  const handleDownload = async (blob: any) => {
    const key = blob.name
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
        a.download = getFileName(blob.name)
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

  const goToPage = (p: number) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>Marketplace</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Browse files stored on the Shelby decentralized network</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' as const }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
          style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['free', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setPriceFilter(f)} style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: priceFilter === f ? 'var(--accent)' : 'var(--surface)',
            color: priceFilter === f ? 'var(--on-accent)' : 'var(--muted)',
            border: '1px solid var(--border)', cursor: 'pointer',
          }}>{f === 'free' ? 'Free' : 'Paid'}</button>
        ))}
      </div>

      {priceFilter === 'paid' && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Paid Files Coming Soon</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            Token-gated and paid file access is part of the Shelby payment channel system, coming in a future update.
          </div>
        </div>
      )}

      {priceFilter === 'free' && (
        <>
          {isLoading && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>Loading files from Shelby network...</div>}
          {error && <div style={{ textAlign: 'center', color: '#f87171', padding: '64px 0', fontSize: 14 }}>Could not load files. Check your connection.</div>}
          {!isLoading && !error && filtered.length === 0 && <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '64px 0', fontSize: 14 }}>No files found.</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(blob => {
              const fileName = getFileName(blob.name)
              const color = colorForType(fileName)
              const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE'
              const sizeKB = blob.size ? blob.size > 1024 * 1024
                ? (blob.size / 1024 / 1024).toFixed(1) + ' MB'
                : (blob.size / 1024).toFixed(1) + ' KB'
                : 'Unknown'
              const isDownloading = downloading === blob.name

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
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', background: '#4ade8018', border: '1px solid #4ade8030', padding: '3px 8px', borderRadius: 20 }}>Free</span>
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{fileName}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ext} · {sizeKB}</div>
                  </div>

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
                </div>
              )
            })}
          </div>

          {!isLoading && !error && (page > 0 || hasMore) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 40 }}>
              <button onClick={() => goToPage(page - 1)} disabled={page === 0} style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--surface)', color: page === 0 ? 'var(--muted)' : 'var(--text)',
                border: '1px solid var(--border)', cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}>← Prev</button>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Page {page + 1}</span>
              <button onClick={() => goToPage(page + 1)} disabled={!hasMore} style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--surface)', color: !hasMore ? 'var(--muted)' : 'var(--text)',
                border: '1px solid var(--border)', cursor: !hasMore ? 'not-allowed' : 'pointer',
              }}>Next →</button>
            </div>
          )}
        </>
      )}

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--accent)', color: 'var(--on-accent)',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      )}
    </div>
  )
}
