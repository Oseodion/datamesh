import { useState } from 'react'

interface Props {
  onClose: () => void
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const SoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

export default function UploadModal({ onClose }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, width: '100%', maxWidth: 480,
        padding: 36, position: 'relative',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16,
      }} onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent)18', border: '1px solid var(--accent)30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
            Browser Uploads Coming Soon
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 360 }}>
            We're working on browser wallet signing support with Shelby Protocol.
            For now, files are uploaded directly to Shelby's decentralized network
            and available for everyone to browse and download.
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', maxWidth: 360, textAlign: 'center' as const }}>
            Uploads are done via CLI for now - head to <strong style={{ color: 'var(--accent)' }}>Drive</strong> to see the guide.
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', width: '100%', marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 12 }}>What you can do right now</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {[
              { icon: <CheckIcon />, text: 'Browse all files on the marketplace', done: true },
              { icon: <CheckIcon />, text: 'Download any file directly from Shelby', done: true },
              { icon: <CheckIcon />, text: 'Connect your wallet to view your files', done: true },
              { icon: <SoonIcon />, text: 'Upload files via browser wallet', done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.icon}
                <span style={{ fontSize: 13, color: item.done ? 'var(--text)' : 'var(--muted)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} style={{
          padding: '11px 32px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: 'var(--accent)', color: 'var(--on-accent)',
          border: 'none', cursor: 'pointer', marginTop: 4,
        }}>
          Got it
        </button>
      </div>
    </div>
  )
}
