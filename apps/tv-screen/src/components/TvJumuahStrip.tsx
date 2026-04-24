import { L } from '../lib/lang'

interface Props {
  lang: string
  theme: string
  jumuahIq: string
  jumuahNote: string
}

export function TvJumuahStrip({ lang, theme, jumuahIq, jumuahNote }: Props) {
  return (
    <div className="tv-jstrip">
      <div className="tv-jin">
        <div className="tv-jdot" />
        <div className="tv-jar" dir="rtl">الجمعة</div>
        <div className="tv-jsep" />
        <div className="tv-jlbl">{jumuahNote || L(lang, 'friday')}</div>
        <div className="tv-jiq">{jumuahIq || '13:30'}</div>
        <div className="tv-jdot" />
      </div>
    </div>
  )
}
