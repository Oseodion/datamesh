export default function Footer() {
  return (
    <footer>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '20px 20px',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
        gap: 8, borderTop: '1px solid var(--border)', textAlign: 'center' as const,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Built on</span>
          {['Shelby Protocol', 'Aptos Labs', 'DoubleZero', 'Jump Crypto'].map((name, i, arr) => (
            <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', opacity: 0.7, whiteSpace: 'nowrap' as const }}>{name}</span>
              {i < arr.length - 1 && <span style={{ color: 'var(--muted)', fontSize: 11 }}>·</span>}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>© 2026 DataMesh</span>
      </div>
    </footer>
  )
}