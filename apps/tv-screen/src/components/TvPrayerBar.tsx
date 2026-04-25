import { PMETA } from '../hooks/usePrayers'
import { Lpn } from '../lib/lang'

interface PrayerEntry {
  key: string
  adhan: string
  iqamah: string | null
}

interface Props {
  lang: string
  theme: string
  prayers: PrayerEntry[]
  activeIdx: number
}

export function TvPrayerBar({ lang, theme, prayers, activeIdx }: Props) {
  return (
    <div className="tv-pbar">
      {prayers.map((pr, i) => {
        const meta = PMETA[i]
        const isActive = i === activeIdx
        const isShuruq = meta.key === 'Shuruq'
        const hasIq = meta.hasIq && pr.iqamah

        return (
          <div
            key={meta.key}
            className={`tv-pc${isActive ? ' active' : ''}${isShuruq ? ' shuruq' : ''}`}
          >
            {/* Mosque icon for H active */}
            <div className="tv-pc-mosque-ico">🕌</div>

            <div className="tv-pc-in">
              {/* Arabic name */}
              <div className="tv-par" dir="rtl">{meta.ar}</div>

              {/* Prayer name */}
              <div className="tv-pnm">
                {Lpn(lang, meta.key)}
              </div>

              {/* Adhan label */}
              <div className="tv-pal">ADHAN</div>

              {/* Adhan time */}
              <div className="tv-padhan">
                {pr.adhan || '--:--'}
              </div>

              {/* Divider line */}
              {hasIq && <div className="tv-pdiv" />}

              {/* Iqamah label */}
              {hasIq && <div className="tv-pql">IQAMAH</div>}

              {/* Iqamah time */}
              {hasIq ? (
                <div className="tv-piqt">
                  {pr.iqamah}
                </div>
              ) : isShuruq ? (
                <div className="tv-pno">—</div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
