import { useState, useEffect } from 'react'
import { L } from '../lib/lang'

interface Slide {
  type: 'content' | 'ann' | 'dars' | 'clean' | 'fallback'
  title?: string
  data?: any
}

interface Props {
  slides: Slide[]
  lang: string
  theme: string
  customAcc: string
  customGold: string
  fsArPx: number
  fsSlidePx: number
  slideIndex: number
  setSlideIndex: (i: number) => void
}

export function TvSlides({ slides, lang, theme, customAcc, customGold, fsArPx, fsSlidePx, slideIndex, setSlideIndex }: Props) {
  return (
    <div className="tv-slides">
      {/* Theme H: Announcements header */}
      <div className="tv-ann-panel-hdr">{L(lang, 'annLbl')}</div>

      {/* Progress bar */}
      <div className="tv-prog" style={{ width: '0%' }} />

      {/* Slide dots */}
      <div className="tv-dots">
        {slides.map((_, i) => (
          <div key={i} className={`tv-dot${i === slideIndex ? ' on' : ''}`} />
        ))}
      </div>

      {/* Theme H nav arrows */}
      <div className="tv-slide-nav">
        <div className="tv-slide-nav-btn" onClick={() => setSlideIndex((slideIndex - 1 + slides.length) % slides.length)}>《</div>
        <div />
        <div className="tv-slide-nav-btn" onClick={() => setSlideIndex((slideIndex + 1) % slides.length)}>》</div>
      </div>

      {/* Slides */}
      {slides.map((sl, i) => (
        <div key={i} className={`tv-slide${i === slideIndex ? ' on' : ''}${sl.type === 'content' ? ` tv-slide-${sl.data?.type || 'quran'}` : ''}`}>
          <SlideContent slide={sl} lang={lang} customAcc={customAcc} customGold={customGold} fsArPx={fsArPx} fsSlidePx={fsSlidePx} />
        </div>
      ))}
    </div>
  )
}

function SlideContent({ slide, lang, customAcc, customGold, fsArPx, fsSlidePx }: {
  slide: any; lang: string; customAcc: string; customGold: string; fsArPx: number; fsSlidePx: number
}) {
  if (slide.type === 'content') {
    const isHadith = slide.data?.type === 'hadith'
    return (
      <>
        <div className={isHadith ? 'tv-hlbl' : 'tv-qlbl'}>{slide.title}</div>
        <div className={isHadith ? 'tv-har' : 'tv-qar'} style={{ fontSize: `${fsArPx}px` }} dir="rtl">
          {slide.data?.ar}
        </div>
        <div className={isHadith ? 'tv-hbar' : 'tv-qbar'} />
        <div className={isHadith ? 'tv-htrans' : 'tv-qtrans'} style={{ fontSize: `${fsSlidePx}px` }}>
          {slide.data?.[lang] || slide.data?.en}
        </div>
        <div className={isHadith ? 'tv-hsrc' : 'tv-qsrc'}>{slide.data?.src}</div>
      </>
    )
  }

  if (slide.type === 'ann' && slide.data?.type === 'text') {
    return (
      <div className="tv-ann-slide" style={{ flexDirection: 'column', gap: '1.48vh', padding: '2.22vh 3.13vw' }}>
        <div className="tv-ann-icon" style={{ fontSize: `${Math.max(fsArPx, 36)}px` }}>{slide.data.icon}</div>
        <div className="tv-ann-title" style={{ fontSize: `${fsSlidePx}px` }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {slide.data?.[lang] || slide.data?.en}
        </div>
        <div className="tv-ann-sub" style={{ fontSize: `${Math.round(fsSlidePx * 0.7)}px` }}>
          {slide.data?.[`sub${lang.charAt(0).toUpperCase()}${lang.slice(1)}`] || slide.data?.subEn}
        </div>
      </div>
    )
  }

  if (slide.type === 'ann' && slide.data?.type === 'photo') {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${slide.data.photo})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        {(slide.data?.[lang] || slide.data?.en) && (
          <div style={{ position: 'absolute', bottom: '2.22vh', left: '1.56vw', right: '1.56vw', background: 'rgba(0,0,0,0.82)', padding: '0.93vh 1.04vw', borderRadius: '0.63vw', fontSize: `${fsSlidePx}px`, fontWeight: 700 }}>
            {slide.data?.[lang] || slide.data?.en}
          </div>
        )}
      </div>
    )
  }

  if (slide.type === 'dars') {
    const d = slide.data
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.93vh', textAlign: 'center', padding: '2.22vh 2.08vw' }}>
        <div style={{ background: customAcc, color: '#000', padding: '0.37vh 1.25vw', borderRadius: '2.08vw', fontWeight: 700, fontSize: `${Math.round(fsSlidePx * 0.6)}px`, letterSpacing: '0.1vw', textTransform: 'uppercase' }}>
          {d?.darsTag || L(lang, 'darsTag')}
        </div>
        <div style={{ fontSize: `${fsSlidePx}px`, fontWeight: 800 }}>{d?.darsTitle || 'Weekly Dars'}</div>
        <div style={{ fontSize: `${Math.round(fsSlidePx * 0.7)}px`, color: customGold }}>
          {d?.darsDay} • {d?.darsTime}
        </div>
        <div style={{ fontSize: `${Math.round(fsSlidePx * 0.6)}px` }}>📍 {d?.darsPlace}</div>
        <div style={{ fontSize: `${Math.round(fsSlidePx * 0.45)}px`, color: 'rgba(255,255,255,0.45)', marginTop: '0.56vh' }}>{d?.darsNote}</div>
      </div>
    )
  }

  if (slide.type === 'clean') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.11vh', textAlign: 'center' }}>
        <div className="tv-anim-bounce" style={{ fontSize: `${fsArPx + 10}px` }}>🧹</div>
        <div style={{ fontSize: `${fsSlidePx}px`, fontWeight: 700 }}>{L(lang, 'cleanTitle')}</div>
        <div style={{ fontSize: `${Math.round(fsSlidePx * 0.7)}px`, color: customAcc }}>{L(lang, 'cleanSub')}</div>
      </div>
    )
  }

  // Fallback default Quran verse
  return (
    <>
      <div className="tv-qlbl">{L(lang, 'quranLbl')}</div>
      <div className="tv-qar" style={{ fontSize: `${fsArPx}px` }} dir="rtl">
        وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ
      </div>
      <div className="tv-qbar" />
      <div className="tv-qtrans" style={{ fontSize: `${fsSlidePx}px` }}>
        "I did not create jinn and humans except to worship Me."
      </div>
      <div className="tv-qsrc">Quran 51:56</div>
    </>
  )
}
