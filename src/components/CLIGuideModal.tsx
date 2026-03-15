interface Props { onClose: () => void }

const Step = ({ num, title, code }: { num: number, title: string, code?: string }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--accent)18', border: '1px solid var(--accent)40', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{num}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: code ? 6 : 0 }}>{title}</div>
      {code && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#4ade80', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', wordBreak: 'break-all' as const }}>{code}</div>}
    </div>
  </div>
)

export default function CLIGuideModal({ onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 520, padding: 36, position: 'relative', display: 'flex', flexDirection: 'column' as const, gap: 20, maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Upload via CLI</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>Upload files to the Shelby network from your terminal. Your files will appear in the Marketplace once uploaded.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <Step num={1} title="Set up pnpm globals (first time only)" code="pnpm setup && source ~/.zshrc" />
          <Step num={2} title="Install the Shelby CLI" code="pnpm add -g @shelby-protocol/cli" />
          <Step num={3} title="Initialize Shelby and follow the prompts" code="shelby init" />
          <Step num={4} title="Fund your account with ShelbyUSD (opens browser)" code="shelby faucet" />
          <Step num={5} title="On the faucet page, also click 'Aptos Tokens' to get APT for gas fees — use the address shown in your terminal" />
          <Step num={6} title="Upload your file" code="shelby upload ./yourfile.png yourfile.png --context shelbynet --expiration 2026-12-31" />
          <Step num={7} title="Your file will appear in the Marketplace once written to the network ✓" />
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          Need more help? Check the full docs at{' '}
          <a href="https://docs.shelby.xyz/tools/cli" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>docs.shelby.xyz/tools/cli</a>
        </div>

        <button onClick={onClose} style={{ padding: '11px 32px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: 'var(--on-accent)', border: 'none', cursor: 'pointer' }}>Got it</button>
      </div>
    </div>
  )
}
