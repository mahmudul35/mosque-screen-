import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './lib/firebase'
import { toHijri, addMins, pad } from './lib/time'
import { L, Lpn } from './lib/lang'
import { usePrayers, PMETA } from './hooks/usePrayers'

function App() {
  const [mosqueData, setMosqueData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const [slideIndex, setSlideIndex] = useState(0)

  const lang = mosqueData?.displayLang || 'en'

  const { apiData } = usePrayers(mosqueData)

  // ── ALL HOOKS BEFORE ANY EARLY RETURN ──

  // 1. Firebase listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const docId = params.get('id')
    if (!docId) { setError("Mosque ID is missing. Add ?id=YOUR_DOC_ID"); return }
    const unsub = onSnapshot(doc(db, "mosques", docId), (snap) => {
      if (snap.exists()) setMosqueData(snap.data())
      else setError("Mosque not found.")
    }, (e) => setError(e.message))
    return () => unsub()
  }, [])

  // 2. Clock Tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // 3. Build slide list
  const slides = useMemo(() => {
    if (!mosqueData) return [{ type: 'fallback' }]
    const s: any[] = []
    if (mosqueData?.slideConfig?.showQuran !== '0') {
      const q = mosqueData?.contentItems?.filter((c: any) => c.type === 'quran') || []
      q.forEach((i: any) => s.push({ type: 'content', title: L(lang, 'quranLbl'), data: i }))
    }
    if (mosqueData?.slideConfig?.showHadith !== '0') {
      const h = mosqueData?.contentItems?.filter((c: any) => c.type === 'hadith') || []
      h.forEach((i: any) => s.push({ type: 'content', title: L(lang, 'hadithLbl'), data: i }))
    }
    if (mosqueData?.slideConfig?.showAnn !== '0') {
      const a = mosqueData?.annItems?.filter((c: any) => c.visible !== false) || []
      a.forEach((i: any) => s.push({ type: 'ann', data: i }))
    }
    if (mosqueData?.slideConfig?.showDars !== '0') s.push({ type: 'dars', data: mosqueData?.slideConfig })
    if (mosqueData?.slideConfig?.showClean !== '0') s.push({ type: 'clean' })
    return s.length > 0 ? s : [{ type: 'fallback' }]
  }, [mosqueData, lang])

  const durMs = parseInt(mosqueData?.slideConfig?.slideDur || '10') * 1000

  // 4. Slide timer
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setSlideIndex(prev => (prev + 1) % slides.length), durMs)
    return () => clearInterval(t)
  }, [slides.length, durMs])

  // ── EARLY RETURNS ──
  if (error) return (
    <div style={{ color: '#ff4444', textAlign: 'center', marginTop: '20vh', fontSize: '3vw', background: '#000', height: '100vh' }}>
      {error}
    </div>
  )
  if (!mosqueData) return (
    <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh', fontSize: '3vw', background: '#000', height: '100vh' }}>
      Loading Mosque Data...
    </div>
  )

  // ── COMPUTED VALUES ──
  const customAcc  = mosqueData?.themeSettings?.customAcc  || '#00d4ff'
  const customGold = mosqueData?.themeSettings?.customGold || '#ffd700'
  const customIq   = mosqueData?.themeSettings?.customIq   || '#00ff88'
  const bgBlur     = parseInt(mosqueData?.themeSettings?.bgBlur  || '0')
  const bgOpacity  = parseFloat(mosqueData?.themeSettings?.bgOpacity || '0.85')
  const dsBg       = mosqueData?.themeSettings?.bgImage

  const fsClock = mosqueData?.typography?.fsClock ? `${parseInt(mosqueData.typography.fsClock)/10}vw` : '8vw'
  const fsAdhan = mosqueData?.typography?.fsAdhan ? `${parseInt(mosqueData.typography.fsAdhan)/10}vw` : '2.5vw'
  const fsIq    = mosqueData?.typography?.fsIq    ? `${parseInt(mosqueData.typography.fsIq)/20}vw`   : '1.7vw'
  const fsNm    = mosqueData?.typography?.fsNm    ? `${parseInt(mosqueData.typography.fsNm)/10}vw`   : '2vw'
  const fsSlide = mosqueData?.typography?.fsSlide ? `${parseInt(mosqueData.typography.fsSlide)/10}vw` : '2.5vw'
  const fsAr    = mosqueData?.typography?.fsAr    ? `${parseInt(mosqueData.typography.fsAr)/10}vw`   : '3.5vw'

  const orientationClass = mosqueData?.orientation === 'portrait'
    ? 'tv-orientation-software-portrait'
    : 'tv-orientation-software-landscape'

  // Active prayer
  const nowMins = now.getHours() * 60 + now.getMinutes()
  let activeIdx = 0
  PMETA.forEach((p, i) => {
    const [h, m] = (apiData[p.key]?.adhan || '00:00').split(':').map(Number)
    if (nowMins >= h * 60 + m) activeIdx = i
  })

  // Next prayer countdown
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  let nextP = { key: 'Fajr', diff: 0 }
  for (const p of PMETA) {
    const [h, m] = (apiData[p.key]?.adhan || '00:00').split(':').map(Number)
    const diff = h * 3600 + m * 60 - nowSec
    if (diff > 0) { nextP = { key: p.key, diff }; break }
  }
  const cnt = `${pad(Math.floor(nextP.diff / 3600))}:${pad(Math.floor((nextP.diff % 3600) / 60))}:${pad(nextP.diff % 60)}`

  const computeIq = (key: string) => {
    const pt = mosqueData?.prayerConfig?.prayerTimes?.[key]
    if (key === 'Shuruq') return null
    if (!pt) return addMins(apiData[key]?.adhan || '00:00', 15)
    if (pt.m === 'fixed') return pt.iq
    if (pt.m === 'delay') return addMins(apiData[key]?.adhan || '00:00', pt.d || 15)
    return null
  }

  const activeSlide = slides[slideIndex] || slides[0]
  const blinkOn = now.getSeconds() % 2 === 0

  return (
    <div className={orientationClass}>
      {/* Background image layer */}
      {dsBg && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('${dsBg}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
          transform: bgBlur > 0 ? 'scale(1.06)' : 'none',
        }} />
      )}
      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'rgba(5,7,15,.97)',
        opacity: dsBg ? bgOpacity : 1,
        transition: 'opacity 1s ease',
      }} />

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', height: '100%',
        display: 'flex', gap: '2vw', padding: '2vw', boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif", color: '#fff',
        ['--ta' as string]: customAcc,
        ['--tg' as string]: customGold,
        ['--ti' as string]: customIq,
      }}>

        {/* ── LEFT: Prayer Table ── */}
        <div style={{
          width: '34vw', background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '2vw', padding: '2vw', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', gap: '1.2vw',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {/* Mosque name */}
          <div style={{ textAlign: 'center', paddingBottom: '1vw', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '2.6vw', fontWeight: 800, lineHeight: 1.1 }}>{mosqueData.name}</div>
            {mosqueData.address && (
              <div style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.5)', marginTop: '0.3vw' }}>{mosqueData.address}</div>
            )}
          </div>

          {/* Prayer rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7vw', flex: 1 }}>
            {PMETA.map((p, i) => {
              const isActive = i === activeIdx
              const iq = computeIq(p.key)
              return (
                <div key={p.key} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0.9vw 1.2vw', borderRadius: '1vw',
                  background: isActive ? customAcc : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#000' : '#fff',
                  transition: 'all 0.5s ease',
                  boxShadow: isActive ? `0 0 2vw ${customAcc}55` : 'none',
                }}>
                  <div style={{ flex: 1, fontSize: fsNm, fontWeight: 700 }}>{Lpn(lang, p.key)}</div>
                  <div style={{ fontSize: fsAdhan, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {apiData[p.key]?.adhan || '--:--'}
                  </div>
                  {iq && (
                    <div style={{ marginLeft: '1.2vw', fontSize: fsIq, opacity: 0.7 }}>
                      | {iq}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Jumu'ah */}
          <div style={{
            padding: '0.8vw 1.2vw', borderRadius: '1vw', textAlign: 'center',
            background: 'rgba(0,0,0,0.3)', border: `1px solid ${customGold}33`,
          }}>
            <div style={{ fontSize: '1.1vw', color: customGold, fontWeight: 600 }}>{L(lang, 'friday')}</div>
            <div style={{ fontSize: '2.2vw', fontWeight: 800 }}>{mosqueData?.prayerConfig?.jumuahIq || '13:30'}</div>
          </div>
        </div>

        {/* ── RIGHT: Clock + Slides ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5vw', minWidth: 0 }}>

          {/* Clock bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
            borderRadius: '2vw', padding: '1.4vw 2.5vw',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div>
              <div style={{ fontSize: '1.3vw', color: customAcc, fontWeight: 600 }}>{toHijri(now)}</div>
              <div style={{ fontSize: '1.3vw', color: 'rgba(255,255,255,0.65)', marginTop: '0.3vw' }}>
                {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
            <div style={{ fontSize: fsClock, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
              <span>{pad(now.getHours())}</span>
              <span style={{ opacity: blinkOn ? 1 : 0.2, transition: 'opacity 0.4s' }}>:</span>
              <span>{pad(now.getMinutes())}</span>
            </div>
          </div>

          {/* Countdown */}
          <div style={{
            textAlign: 'center', padding: '0.9vw 2vw',
            background: `linear-gradient(90deg, rgba(255,255,255,0.02), ${customAcc}18, rgba(255,255,255,0.02))`,
            borderRadius: '1.5vw', border: `1px solid ${customAcc}22`,
          }}>
            <div style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {L(lang, 'nextPrayer')}
            </div>
            <div style={{ fontSize: '3vw', fontWeight: 800, color: customGold, fontVariantNumeric: 'tabular-nums' }}>
              {Lpn(lang, nextP.key)} — {cnt}
            </div>
          </div>

          {/* Slide panel */}
          <div style={{
            flex: 1, borderRadius: '2vw', position: 'relative', overflow: 'hidden',
            background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
            minHeight: 0,
          }}>
            <div
              key={slideIndex}
              className="animate-tvFadeUp"
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                padding: '4vw', textAlign: 'center',
              }}
            >
              {activeSlide.type === 'content' && (
                <>
                  <div style={{ fontSize: '1.3vw', color: customAcc, marginBottom: '1.5vw', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{activeSlide.title}</div>
                  <div style={{ fontSize: fsAr, lineHeight: 1.7, fontFamily: "'Amiri', serif" }} dir="rtl">{activeSlide.data.ar}</div>
                  <div style={{ fontSize: fsSlide, color: 'rgba(255,255,255,0.68)', marginTop: '2vw', lineHeight: 1.5 }}>
                    {activeSlide.data[lang] || activeSlide.data.en}
                  </div>
                  <div style={{ fontSize: '1vw', color: customGold, marginTop: '1vw' }}>{activeSlide.data.src}</div>
                </>
              )}

              {activeSlide.type === 'ann' && activeSlide.data.type === 'text' && (
                <>
                  <div style={{ fontSize: '5vw', marginBottom: '1vw' }}>{activeSlide.data.icon}</div>
                  <div style={{ fontSize: fsSlide, fontWeight: 700, lineHeight: 1.3 }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {activeSlide.data[lang] || activeSlide.data.en}
                  </div>
                  <div style={{ fontSize: '1.7vw', color: customAcc, marginTop: '1vw' }}>
                    {activeSlide.data[`sub${lang.charAt(0).toUpperCase()}${lang.slice(1)}`] || activeSlide.data.subEn}
                  </div>
                </>
              )}

              {activeSlide.type === 'ann' && activeSlide.data.type === 'photo' && (
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${activeSlide.data.photo})`,
                  backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'inherit',
                }}>
                  {(activeSlide.data[lang] || activeSlide.data.en) && (
                    <div style={{ position: 'absolute', bottom: '2vw', left: '2vw', right: '2vw', background: 'rgba(0,0,0,0.82)', padding: '1vw', borderRadius: '1vw', fontSize: '2vw', fontWeight: 700 }}>
                      {activeSlide.data[lang] || activeSlide.data.en}
                    </div>
                  )}
                </div>
              )}

              {activeSlide.type === 'dars' && (
                <>
                  <div style={{ fontSize: '1.5vw', background: customAcc, color: '#000', padding: '0.5vw 2vw', borderRadius: '2vw', marginBottom: '2vw', fontWeight: 700 }}>
                    {activeSlide.data.darsTag || 'Weekly Invitation'}
                  </div>
                  <div style={{ fontSize: fsSlide, fontWeight: 800 }}>{activeSlide.data.darsTitle || 'Weekly Dars'}</div>
                  <div style={{ fontSize: '2vw', color: customGold, margin: '1vw 0' }}>
                    {activeSlide.data.darsDay} • {activeSlide.data.darsTime}
                  </div>
                  <div style={{ fontSize: '1.5vw' }}>📍 {activeSlide.data.darsPlace}</div>
                  <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.4)', marginTop: '1.5vw' }}>{activeSlide.data.darsNote}</div>
                </>
              )}

              {activeSlide.type === 'clean' && (
                <>
                  <div style={{ fontSize: '5vw', marginBottom: '1vw' }}>🧹</div>
                  <div style={{ fontSize: fsSlide, fontWeight: 700 }}>{L(lang, 'cleanTitle')}</div>
                  <div style={{ fontSize: '1.7vw', color: customAcc, marginTop: '1vw' }}>{L(lang, 'cleanSub')}</div>
                </>
              )}

              {activeSlide.type === 'fallback' && (
                <>
                  <div style={{ fontSize: '1.3vw', color: customAcc, marginBottom: '2vw', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{L(lang, 'quranLbl')}</div>
                  <div style={{ fontSize: fsAr, lineHeight: 1.7, fontFamily: "'Amiri', serif" }}>
                    وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ
                  </div>
                  <div style={{ fontSize: fsSlide, color: 'rgba(255,255,255,0.65)', marginTop: '2vw' }}>
                    "I created jinn and humans only to worship Me."
                  </div>
                </>
              )}

              {/* Slide progress dots */}
              {slides.length > 1 && (
                <div style={{ position: 'absolute', bottom: '1.5vw', display: 'flex', gap: '0.5vw' }}>
                  {slides.map((_, i) => (
                    <div key={i} style={{
                      width: i === slideIndex ? '2vw' : '0.6vw',
                      height: '0.6vw', borderRadius: '0.3vw',
                      background: i === slideIndex ? customAcc : 'rgba(255,255,255,0.25)',
                      transition: 'all 0.4s ease',
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
