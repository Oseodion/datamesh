import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadModal from './UploadModal'

export default function Hero() {
  const [showUpload, setShowUpload] = useState(false)
  const navigate = useNavigate()

  const files = [
    { name: 'Twitter Sentiment Dataset', type: 'CSV', size: '124 MB', downloads: 18, price: '2.5 SUSD', color: '#f472b6' },
    { name: 'AI Art Pack Vol.1', type: 'PNG', size: '340 MB', downloads: 67, price: 'Free', color: '#34d399' },
    { name: 'LLaMA 3 Fine-tuning Scripts', type: 'ZIP', size: '2.1 MB', downloads: 103, price: 'Free', color: '#60a5fa' },
  ]

  const cardClasses = ['fc-1', 'fc-2', 'fc-3']

  return (
    <>
      <section className="hero-grid" style={{
        maxWidth: 1200, margin: '0 auto', padding: '72px 24px 68px',
        borderBottom: '1px solid var(--border)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 64, alignItems: 'center',
      }}>

        {/* Left */}
        <div>
          <div className="hero-badge" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '4px 12px', borderRadius: 100,
            border: '1px solid var(--border)', background: 'var(--surface)',
            fontSize: 11, fontWeight: 600, color: 'var(--accent)',
            fontFamily: 'monospace', letterSpacing: 0.5,
            textTransform: 'uppercase' as const, marginBottom: 26,
          }}>
            <span className="live-dot" style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)', display: 'inline-block',
            }} />
            Live on Shelby Testnet
          </div>

          <h1 className="hero-h1" style={{
            fontSize: 'clamp(38px, 4.8vw, 66px)', fontWeight: 800,
            lineHeight: 1.05, letterSpacing: -2.5, marginBottom: 22,
          }}>
            Store, Share<br />
            {'& '}<em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>Monetize</em><br />
            Any File.
          </h1>

          <p className="hero-sub" style={{
            fontSize: 15, color: 'var(--muted)', lineHeight: 1.75,
            marginBottom: 34, maxWidth: 400,
          }}>
            Upload anything to Shelby's decentralized network. Set a price,
            share publicly, or keep it private - you earn every time your data is served.
          </p>

          <div className="hero-actions" style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowUpload(true)} style={{
              background: 'var(--accent)', color: '#fff',
              padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}>
              Upload a File
            </button>
            <button onClick={() => navigate('/explore')} style={{
              background: 'var(--surface)', color: 'var(--text)',
              border: '1px solid var(--border)',
              padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}>
              Explore Marketplace
            </button>
          </div>
        </div>

        {/* Right - Floating Cards */}
        <div className="hero-cards" style={{ position: 'relative', height: 300 }}>
          {files.map((file, i) => (
            <div
              key={file.name}
              className={cardClasses[i]}
              style={{
                position: 'absolute',
                top: i * 100 + 10,
                left: i === 1 ? 16 : 0,
                right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: `${file.color}18`,
                border: `1px solid ${file.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={file.color} strokeWidth="2">
                  {i === 0 && <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}
                  {i === 1 && <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>}
                  {i === 2 && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></>}
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: 13, marginBottom: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {file.type} &middot; {file.size} &middot; {file.downloads} downloads
                </div>
              </div>
              <span style={{
                background: file.price === 'Free' ? '#34d39920' : '#f472b620',
                color: file.price === 'Free' ? '#34d399' : '#f472b6',
                padding: '3px 8px', borderRadius: 6,
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {file.price}
              </span>
            </div>
          ))}
        </div>

      </section>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  )
}