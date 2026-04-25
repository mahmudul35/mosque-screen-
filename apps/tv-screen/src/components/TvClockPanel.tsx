import { toHijri, pad } from '../lib/time'
import { L, Lpn } from '../lib/lang'

interface Props {
  now: Date
  lang: string
  theme: string
  nextP: { key: string; diff: number; adhanTime: string }
  customAcc: string
  customGold: string
}

export function TvClockPanel({ now, lang, theme, nextP, customAcc, customGold }: Props) {
  const isH = theme === 'H'
  const isE = theme === 'E' || theme === 'E2'

  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
  const blinkOn = now.getSeconds() % 2 === 0

  const diffH = Math.floor(nextP.diff / 3600)
  const diffM = Math.floor((nextP.diff % 3600) / 60)
  const diffS = nextP.diff % 60
  const cntStr = `${pad(diffH)}:${pad(diffM)}:${pad(diffS)}`

  const dateDay = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateRest = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const hijriStr = toHijri(now)

  return (
    <div className="tv-clock">
      {/* Arabic "The time now" label */}
      <div className="tv-clock-ar">{L(lang, 'nowTime')}</div>

      {/* AM/PM (shown Theme H) */}
      {isH && <div className="tv-ampm">{ampm}</div>}

      {/* Main clock */}
      <div className="tv-time">
        <span>{hh}</span>
        <span className="tv-blink" style={{ opacity: blinkOn ? 1 : 0.06 }}>:</span>
        <span>{mm}</span>
      </div>

      {/* Ornament */}
      <div className="tv-orn">
        <div className="tv-ol" />
        <div className="tv-osd" />
        <div className="tv-ol" />
      </div>

      {/* Date */}
      <div className="tv-date">{`${dateDay}\n${dateRest}`}</div>

      {/* Hijri */}
      <div className="tv-hijri2">{hijriStr}</div>

      {/* Next prayer — standard (Theme E) */}
      {isE && (
        <div className="tv-nxp">
          <div className="tv-nxp-lbl">{L(lang, 'nextPrayer')}</div>
          <div className="tv-nxp-name">{Lpn(lang, nextP.key)}</div>
          <div className="tv-nxp-cnt">{cntStr}</div>
          <div style={{ width:'82%', height:'3px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', margin:'0.56vh auto 0', overflow:'hidden' }}>
            <div style={{ height:'100%', background:'var(--ta)', borderRadius:'2px', width:'70%' }} />
          </div>
        </div>
      )}

      {/* Next prayer — Theme H */}
      {isH && (
        <div className="tv-nxp-h">
          <div className="tv-nxp-h-lbl">{L(lang, 'nextPrayer')}</div>
          <div className="tv-nxp-h-name">{Lpn(lang, nextP.key)}</div>
          <div className="tv-nxp-h-time">{nextP.adhanTime}</div>
          <div className="tv-nxp-h-cnt">{`in ${pad(diffM)}:${pad(diffS)}`}</div>
        </div>
      )}
    </div>
  )
}
