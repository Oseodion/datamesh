import { useState, useEffect } from 'react'
import { shelbyClient } from '../lib/shelby'

export default function StatsBar() {
  const [fileCount, setFileCount] = useState<string>('...')
  const [dataStored, setDataStored] = useState<{ value: string, unit: string }>({ value: '...', unit: '' })

  useEffect(() => {
    shelbyClient.coordination.getBlobsCount({ where: { is_written: { _eq: 1 as any }, is_deleted: { _eq: 0 as any } } })
      .then(count => setFileCount(count.toLocaleString()))
      .catch(() => setFileCount('—'))

    shelbyClient.coordination.getTotalBlobsSize({ where: { is_written: { _eq: 1 as any }, is_deleted: { _eq: 0 as any } } })
      .then(bytes => {
        if (bytes > 1024 * 1024 * 1024) setDataStored({ value: (bytes / 1024 / 1024 / 1024).toFixed(2), unit: 'GB' })
        else setDataStored({ value: (bytes / 1024 / 1024).toFixed(1), unit: 'MB' })
      })
      .catch(() => setDataStored({ value: '—', unit: '' }))
  }, [])

  const stats = [
    { value: fileCount, label: 'Total Files' },
    { value: dataStored.value, unit: dataStored.unit, label: 'Data Stored' },
    { value: '34', label: 'Active Nodes' },
    { value: '~ 70%', label: 'Cheaper Than AWS' },
  ]

  return (
    <div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {stats.map((stat, i) => (
            <div key={stat.label} className="stat-cell" style={{ padding: '28px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6, color: 'var(--accent)' }}>
                {stat.value}
                {stat.unit && <span style={{ fontSize: 14, marginLeft: 6, color: 'var(--text)' }}>{stat.unit}</span>}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, whiteSpace: 'nowrap' as const }}>
                {stat.label}
              </div>
            </div>
          ))}
          <div className="stats-mobile-divider" style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  )
}
