import { L, Lpn } from '../lib/lang'
import { pad } from '../lib/time'

interface Props {
  show: boolean
  type: 'adhan' | 'iqamah'
  prayerKey: string
  prayerAr: string
  lang: string
  countdown: number   // seconds remaining
  totalSecs: number   // total overlay duration
}

export function TvOverlay({ show, type, prayerKey, prayerAr, lang, countdown, totalSecs }: Props) {
  if (!show) return null

  const pct = totalSecs > 0 ? (countdown / totalSecs) * 100 : 0
  const isUrgent = countdown <= 10

  return (
    <div className="tv-ov show">
      <div className="tv-ov-ar" dir="rtl">{prayerAr}</div>
      <div className="tv-ov-nm">{Lpn(lang, prayerKey)}</div>

      <div className="tv-ov-card">
        {type === 'adhan' ? (
          <>
            <div className="tv-adhan-call" dir="rtl">اللَّهُ أَكْبَرُ</div>
            <div className="tv-adhan-sub">{L(lang, 'itIsTime')}</div>
            <div className="tv-adhan-tmr">{L(lang, 'closingIn')}{countdown}...</div>
          </>
        ) : (
          <>
            <div className="tv-ov-lbl">{L(lang, 'iqIn')}</div>
            <div className={`tv-ov-count${isUrgent ? ' urgent' : ''}`}>
              {pad(Math.floor(countdown / 60))}:{pad(countdown % 60)}
            </div>
            <div className="tv-ov-pb">
              <div className="tv-ov-pf" style={{ width: `${pct}%` }} />
            </div>
            <div className="tv-ov-sub">{L(lang, 'prepare')}</div>
          </>
        )}
      </div>
    </div>
  )
}
