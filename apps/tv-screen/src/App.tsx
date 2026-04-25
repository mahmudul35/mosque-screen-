import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './lib/firebase'
import { addMins, pad } from './lib/time'
import { L } from './lib/lang'
import { usePrayers, PMETA } from './hooks/usePrayers'

import { TvTopbar } from './components/TvTopbar'
import { TvClockPanel } from './components/TvClockPanel'
import { TvSlides } from './components/TvSlides'
import { TvJumuahStrip } from './components/TvJumuahStrip'
import { TvPrayerBar } from './components/TvPrayerBar'
import { TvOverlay } from './components/TvOverlay'

import './tv.css'

const ADHAN_SHOW_SECS = 30     // how long to show Adhan overlay
const IQ_WARN_SECS_BEFORE = 120 // start Iqamah overlay 2 minutes before iqamah (shows 2:00 countdown)

function App() {
  const [mosqueData, setMosqueData] = useState<any>(null)
  const [error, setError]  = useState<string | null>(null)
  const [now, setNow]      = useState(new Date())
  const [slideIndex, setSlideIndex] = useState(0)

  // Overlay state
  const [overlay, setOverlay] = useState<{
    show: boolean; type: 'adhan' | 'iqamah'; key: string; countdown: number; total: number
  }>({ show: false, type: 'adhan', key: 'Fajr', countdown: 0, total: 0 })

  const lang  = mosqueData?.displayLang   || 'en'
  const theme = mosqueData?.themeSettings?.tvDesign || 'A'

  const { apiData } = usePrayers(mosqueData)

  // ── 1. Firebase listener ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const docId  = params.get('id')
    if (!docId) { setError('Mosque ID missing. Add ?id=YOUR_DOC_ID'); return }
    const unsub = onSnapshot(doc(db, 'mosques', docId), snap => {
      if (snap.exists()) setMosqueData(snap.data())
      else setError('Mosque not found.')
    }, e => setError(e.message))
    return () => unsub()
  }, [])

  // ── 2. Clock tick ──
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── 3. Build slide list ──
  const slides = useMemo(() => {
    if (!mosqueData) return [{ type: 'fallback' as const }]
    const s: any[] = []
    const cfg = mosqueData.slideConfig || {}
    if (cfg.showQuran  !== '0') {
      ;(mosqueData.contentItems || []).filter((c: any) => c.type === 'quran')
        .forEach((i: any) => s.push({ type: 'content', title: L(lang, 'quranLbl'), data: { ...i, type: 'quran' } }))
    }
    if (cfg.showHadith !== '0') {
      ;(mosqueData.contentItems || []).filter((c: any) => c.type === 'hadith')
        .forEach((i: any) => s.push({ type: 'content', title: L(lang, 'hadithLbl'), data: { ...i, type: 'hadith' } }))
    }
    if (cfg.showAnn    !== '0') {
      ;(mosqueData.annItems || []).filter((c: any) => c.visible !== false)
        .forEach((i: any) => s.push({ type: 'ann', data: i }))
    }
    if (cfg.showDars   !== '0') s.push({ type: 'dars', data: cfg })
    if (cfg.showClean  !== '0') s.push({ type: 'clean' })
    return s.length > 0 ? s : [{ type: 'fallback' as const }]
  }, [mosqueData, lang])

  const durMs = parseInt(mosqueData?.slideConfig?.slideDur || '10') * 1000

  // ── 4. Slide timer ──
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setSlideIndex(p => (p + 1) % slides.length), durMs)
    return () => clearInterval(t)
  }, [slides.length, durMs])

  // ── 5. Overlay engine ──
  useEffect(() => {
    if (!mosqueData || Object.keys(apiData).length === 0) return

    const nowH = now.getHours()
    const nowM = now.getMinutes()
    const nowS = now.getSeconds()
    const nowTotal = nowH * 3600 + nowM * 60 + nowS

    for (const p of PMETA) {
      const adhanStr = apiData[p.key]?.adhan
      if (!adhanStr) continue

      const [ah, am] = adhanStr.split(':').map(Number)
      const adhanTotal = ah * 3600 + am * 60

      // Show Adhan overlay just at adhan time for ADHAN_SHOW_SECS
      const sinceAdhan = nowTotal - adhanTotal
      if (sinceAdhan >= 0 && sinceAdhan < ADHAN_SHOW_SECS) {
        const remaining = ADHAN_SHOW_SECS - sinceAdhan
        setOverlay({ show: true, type: 'adhan', key: p.key, countdown: remaining, total: ADHAN_SHOW_SECS })
        return
      }

      // Show Iqamah overlay counting down
      if (p.hasIq) {
        const iqStr = computeIqStr(p.key, adhanStr, mosqueData)
        if (iqStr && iqStr !== '--:--') {
          const [iqh, iqm] = iqStr.split(':').map(Number)
          const iqTotal = iqh * 3600 + iqm * 60
          const secsToIq = iqTotal - nowTotal
          if (secsToIq >= 0 && secsToIq <= IQ_WARN_SECS_BEFORE) {
            setOverlay({ show: true, type: 'iqamah', key: p.key, countdown: secsToIq, total: IQ_WARN_SECS_BEFORE })
            return
          }
        }
      }
    }

    setOverlay(prev => prev.show ? { ...prev, show: false } : prev)
  }, [now, apiData, mosqueData])

  // ── EARLY RETURNS ──
  if (error) return <div style={{ background:'#000', height:'100vh', color:'#f44', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3vw' }}>{error}</div>
  if (!mosqueData) return <div style={{ background:'#000', height:'100vh', color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5vw' }}>Loading Mosque Display...</div>

  // ── COMPUTED VALUES ──
  const customAcc  = mosqueData.themeSettings?.customAcc  || '#00e676'
  const customGold = mosqueData.themeSettings?.customGold || '#ffd54f'
  const customIq   = mosqueData.themeSettings?.customIq   || '#00e676'
  const bgBlur     = parseInt(mosqueData.themeSettings?.bgBlur    || '0')
  const bgOpacity  = parseFloat(mosqueData.themeSettings?.bgOpacity || '0.85')
  const dsBg       = mosqueData.themeSettings?.bgImage

  // Convert admin 'px' numbers to 'vw' for true responsiveness (1vw on 960px reference = 9.6px)
  const fsClockVw = parseInt(mosqueData.typography?.fsClock || '88') / 9.6
  const fsAdhanVw = parseInt(mosqueData.typography?.fsAdhan || '25') / 9.6
  const fsIqVw    = parseInt(mosqueData.typography?.fsIq    || '34') / 9.6
  const fsNmVw    = parseInt(mosqueData.typography?.fsNm    || '10') / 9.6
  const fsSlideVw = parseInt(mosqueData.typography?.fsSlide || '14') / 9.6
  const fsArVw    = parseInt(mosqueData.typography?.fsAr    || '28') / 9.6

  const orientationClass = mosqueData.orientation === 'portrait'
    ? 'tv-orientation-software-portrait'
    : 'tv-orientation-software-landscape'

  // Active prayer index
  const nowMins = now.getHours() * 60 + now.getMinutes()
  let activeIdx = 0
  PMETA.forEach((p, i) => {
    const [h, m] = (apiData[p.key]?.adhan || '00:00').split(':').map(Number)
    if (nowMins >= h * 60 + m) activeIdx = i
  })

  // Next prayer
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  let nextP: { key: string; diff: number; adhanTime: string } | null = null
  for (const p of PMETA) {
    const adhn = apiData[p.key]?.adhan || '00:00'
    const [h, m] = adhn.split(':').map(Number)
    const diff = h * 3600 + m * 60 - nowSec
    if (diff > 0) { nextP = { key: p.key, diff, adhanTime: adhn }; break }
  }
  
  // If no next prayer found today (past Isha), next prayer is Fajr tomorrow
  if (!nextP) {
    const fajrAdhan = apiData['Fajr']?.adhan || '00:00'
    const [fh, fm] = fajrAdhan.split(':').map(Number)
    const diff = (24 * 3600 - nowSec) + (fh * 3600 + fm * 60)
    nextP = { key: 'Fajr', diff, adhanTime: fajrAdhan }
  }

  // Build prayer list for PrayerBar
  const prayers = PMETA.map((p) => ({
    key: p.key,
    adhan: apiData[p.key]?.adhan || '--:--',
    iqamah: p.hasIq ? computeIqStr(p.key, apiData[p.key]?.adhan || '', mosqueData) : null,
  }))

  return (
    <div className={orientationClass}>

      {/* TV Frame — sets theme class and CSS color variables */}
      <div
        className="tv-frame"
        data-t={theme}
        style={{
          ['--ta' as string]: customAcc,
          ['--tg' as string]: customGold,
          ['--ti' as string]: customIq,
          ['--fs-clock' as string]: `${fsClockVw}vw`,
          ['--fs-adhan' as string]: `${fsAdhanVw}vw`,
          ['--fs-iq' as string]: `${fsIqVw}vw`,
          ['--fs-nm' as string]: `${fsNmVw}vw`,
          ['--fs-slide' as string]: `${fsSlideVw}vw`,
          ['--fs-ar' as string]: `${fsArVw}vw`,
          fontFamily: mosqueData.typography?.fontFamily || "'DM Sans',-apple-system,system-ui,sans-serif",
        }}
      >
        {/* ── Layer 0: Background image (inside tv-frame, above theme color) ── */}
        {dsBg && (
          <div
            className="tv-bgl"
            style={{
              backgroundImage: `url('${dsBg}')`,
              filter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
              transform: bgBlur > 0 ? 'scale(1.06)' : 'none',
            }}
          />
        )}
        {/* ── Layer 0: Dark tint overlay ── */}
        <div
          className="tv-bgo"
          style={{
            background: 'rgba(5,7,15,0.97)',
            opacity: dsBg ? bgOpacity : 0,
          }}
        />

        {/* Adhan / Iqamah fullscreen overlay */}
        <TvOverlay
          show={overlay.show}
          type={overlay.type}
          prayerKey={overlay.key}
          prayerAr={PMETA.find(p => p.key === overlay.key)?.arN || ''}
          lang={lang}
          countdown={overlay.countdown}
          totalSecs={overlay.total}
        />

        {/* Top bar */}
        <TvTopbar
          mosqueData={mosqueData}
          now={now}
          lang={lang}
          nextP={nextP}
        />

        {/* Body: clock + slides */}
        <div className="tv-body">
          <TvClockPanel
            now={now}
            lang={lang}
            theme={theme}
            nextP={nextP}
            customAcc={customAcc}
            customGold={customGold}
          />

          <TvSlides
            slides={slides as any}
            lang={lang}
            theme={theme}
            customAcc={customAcc}
            customGold={customGold}
            slideIndex={slideIndex}
            setSlideIndex={setSlideIndex}
          />
        </div>

        {/* Jumuah strip */}
        <TvJumuahStrip
          lang={lang}
          theme={theme}
          jumuahIq={mosqueData.prayerConfig?.jumuahIq || '13:30'}
          jumuahNote={mosqueData.prayerConfig?.jumuahNote || ''}
        />

        {/* Prayer cards */}
        <TvPrayerBar
          lang={lang}
          theme={theme}
          prayers={prayers}
          activeIdx={activeIdx}
        />
      </div>
    </div>
  )
}

// Iqamah computation helper
function computeIqStr(key: string, adhanStr: string, mosqueData: any): string | null {
  if (key === 'Shuruq') return null
  const pt = mosqueData?.prayerConfig?.prayerTimes?.[key]
  if (!pt && adhanStr) return addMins(adhanStr, 15)
  if (pt?.m === 'fixed') return pt.iq || null
  if (pt?.m === 'delay') return addMins(adhanStr, pt.d || 15)
  return adhanStr ? addMins(adhanStr, 15) : null
}

export type Prayer = ReturnType<typeof computeIqStr>
export default App
