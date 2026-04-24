import type { Prayer } from '../App'
import { L, Lpn } from '../lib/lang'
import { toHijri, pad } from '../lib/time'

interface Props {
  mosqueData: any
  now: Date
  lang: string
  nextP: { key: string; diff: number; adhanTime: string }
}

export function TvTopbar({ mosqueData, now, lang, nextP }: Props) {
  const theme = mosqueData?.themeSettings?.tvDesign || 'A'
  const isH = theme === 'H'
  const hijriStr = toHijri(now)

  return (
    <div className="tv-top">
      {/* Standard mosque name */}
      <div className="tv-mname-wrap">
        <div className="tv-mname">{mosqueData.name}</div>
        {mosqueData.address && <div className="tv-msub">{mosqueData.address}</div>}
      </div>

      {/* Theme H centered name */}
      <div className="tv-h-name">{mosqueData.name?.toUpperCase()}</div>
      <div className="tv-h-addr">{mosqueData.address}</div>

      {/* Right side */}
      <div className="tv-top-r">
        <div className="tv-hijri">{hijriStr}</div>
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.52vw' }}>
          <div style={{ width: '1.88vw', height: '1.88vw', background: 'var(--ta)', borderRadius: '0.42vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.83vw', fontWeight: 900, color: '#05070f' }}>★</span>
          </div>
          <span style={{ fontSize: '0.94vw', fontWeight: 700, color: 'var(--ta)', letterSpacing: '0.16vw', textTransform: 'uppercase' }}>
            DH<span style={{ color: 'var(--tt3)', fontWeight: 400 }}>Connect</span>
          </span>
        </div>
      </div>
    </div>
  )
}
