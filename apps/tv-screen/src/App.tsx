import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './lib/firebase'
import { toHijri, addMins, pad } from './lib/time'
import { L, Lpn, LANG_DATA } from './lib/lang'
import { usePrayers, PMETA } from './hooks/usePrayers'

function App() {
  const [mosqueData, setMosqueData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  // Config data
  const theme = mosqueData?.themeSettings?.tvDesign || 'A'
  const lang = mosqueData?.displayLang || 'en'
  const isLight = theme === 'E' || theme === 'E2'
  const isH = theme === 'H'

  const { apiData } = usePrayers(mosqueData)

  // 1. Firebase Listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const docId = params.get('id')
    if (!docId) {
      setError("Mosque ID is missing. Add ?id=YOUR_DOC_ID")
      return
    }
    const unsub = onSnapshot(doc(db, "mosques", docId), (docSnap) => {
      if (docSnap.exists()) setMosqueData(docSnap.data())
      else setError("Mosque not found.")
    }, (e) => setError(e.message))

    return () => unsub()
  }, [])

  // 2. Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (error) return <div className="text-red-500 text-center mt-20 text-2xl">{error}</div>
  if (!mosqueData) return <div className="text-white text-center mt-20 text-2xl">Loading Mosque Data...</div>

  // --- Dynamic Styles ---
  const customAcc = mosqueData?.themeSettings?.customAcc || '#00d4ff'
  const customGold = mosqueData?.themeSettings?.customGold || '#ffd700'
  const customIq = mosqueData?.themeSettings?.customIq || '#00ff88'
  const bgBlur = mosqueData?.themeSettings?.bgBlur || '0'
  const bgOpacity = mosqueData?.themeSettings?.bgOpacity || '0.85'
  const dsBg = mosqueData?.themeSettings?.bgImage

  const orientationClass = mosqueData?.orientation === 'portrait' 
    ? 'tv-orientation-software-portrait' 
    : 'tv-orientation-software-landscape'

  // Determine Next Prayer & Active Prayer
  const getActive = () => {
    const t = now.getHours() * 60 + now.getMinutes()
    const ts = PMETA.map(p => {
      const [h, m] = (apiData[p.key]?.adhan || '00:00').split(':').map(Number)
      return h * 60 + m
    })
    let a = 0; for (let i = 0; i < ts.length; i++) if (t >= ts[i]) a = i;
    return a
  }
  const activeIdx = getActive()

  const getNextPrayerDiff = () => {
    const sec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    for (const p of PMETA) {
      const [h, m] = (apiData[p.key]?.adhan || '00:00').split(':').map(Number)
      const diff = h * 3600 + m * 60 - sec
      if (diff > 0) return { key: p.key, diff }
    }
    return { key: 'Fajr', diff: 0 } // Tomorrow logic simplified
  }
  const nextP = getNextPrayerDiff()

  const computeIq = (key: string) => {
    const pt = mosqueData?.prayerConfig?.prayerTimes?.[key]
    if (key === 'Shuruq') return null
    if (!pt) return addMins(apiData[key]?.adhan || '00:00', 20) // Default +20m
    if (pt.m === 'fixed') return pt.iq
    if (pt.m === 'delay') return addMins(apiData[key]?.adhan || '00:00', pt.d || 0)
    return null
  }

  // Next Prayer formatting
  const hh = Math.floor(nextP.diff / 3600)
  const mm = Math.floor((nextP.diff % 3600) / 60)
  const ss = nextP.diff % 60
  const cnt = `${pad(hh)}:${pad(mm)}:${pad(ss)}`

  return (
    <div className={orientationClass}>
      {/* Background System */}
      <div 
        id="tv-bgl" 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          backgroundImage: dsBg ? `url('${dsBg}')` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: bgBlur ? `blur(${bgBlur}px)` : 'none',
          transform: bgBlur ? 'scale(1.06)' : 'none'
        }} 
      />
      <div 
        id="tv-bgo" 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
          background: 'rgba(5,7,15,.95)',
          opacity: dsBg ? bgOpacity : 1,
          transition: 'opacity 1s ease'
        }} 
      />

      <div 
        id="tv" 
        data-t={theme}
        style={{
          position: 'relative', zIndex: 2, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          ['--ta' as string]: customAcc,
          ['--tg' as string]: customGold,
          ['--ti' as string]: customIq,
        }}
      >
        {/* Render Theme specific structures based on the massive design guidelines... */}
        <div style={{ display: 'flex', width: '100%', height: '100%', gap: '2vw', padding: '2vw' }}>
           
           {/* LEFT PANEL: Prayertimes */}
           <div style={{ width: '35vw', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '2vw', padding: '2vw' }}>
              <div style={{ textAlign: 'center', marginBottom: '2vw' }}>
                <div style={{ fontSize: '2.5vw', fontWeight: 800 }}>{mosqueData.name}</div>
                <div style={{ fontSize: '1.2vw', color: 'rgba(255,255,255,0.7)' }}>{mosqueData.address}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw' }}>
                {PMETA.map((p, i) => {
                  const isActive = i === activeIdx
                  const iq = computeIq(p.key)
                  return (
                    <div key={p.key} style={{
                      display: 'flex', padding: '1vw', borderRadius: '1vw',
                      background: isActive ? customAcc : 'rgba(255,255,255,0.02)',
                      color: isActive ? '#000' : '#fff'
                    }}>
                      <div style={{ flex: 1, fontSize: '1.5vw', fontWeight: 'bold' }}>{Lpn(lang, p.key)}</div>
                      <div style={{ fontSize: '1.5vw' }}>{apiData[p.key]?.adhan || '--:--'}</div>
                      {iq && (
                        <div style={{ marginLeft: '1vw', fontSize: '1.2vw', opacity: 0.8 }}>
                          | {iq}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Jumuah display */}
              <div style={{ marginTop: '2vw', padding: '1vw', background: 'rgba(0,0,0,0.3)', borderRadius: '1vw', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2vw', color: customGold }}>{L(lang, 'friday')}</div>
                <div style={{ fontSize: '2vw', fontWeight: 'bold' }}>{mosqueData?.prayerConfig?.jumuahIq || '13:30'}</div>
              </div>
           </div>

           {/* RIGHT PANEL: Clock & Slides */}
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2vw' }}>
             
             {/* Clock Area */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '2vw', padding: '2vw' }}>
               <div>
                 <div style={{ fontSize: '1.5vw', color: customAcc }}>{toHijri(now)}</div>
                 <div style={{ fontSize: '1.5vw' }}>{now.toLocaleDateString(lang === 'en' ? 'en-US' : lang, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
               </div>
               <div style={{ display: 'flex', gap: '0.5vw', alignItems: 'baseline', fontSize: '5vw', fontWeight: 900 }}>
                 <span>{pad(now.getHours())}</span>
                 <span className="animate-pulse">:</span>
                 <span>{pad(now.getMinutes())}</span>
               </div>
             </div>

             {/* Next Prayer Countdown Widget */}
             <div style={{ textAlign: 'center', padding: '1.5vw', background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.08))', borderRadius: '1.5vw' }}>
               <div style={{ fontSize: '1.2vw', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{L(lang, 'nextPrayer')}</div>
               <div style={{ fontSize: '3.5vw', fontWeight: 'bold', color: customGold }}>
                 {Lpn(lang, nextP.key)} - {cnt}
               </div>
             </div>

             {/* Slide Area - dynamic */}
             <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '2vw', position: 'relative', overflow: 'hidden' }}>
               {/* Simplified static quote for now to simulate the carousel */}
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3vw', textAlign: 'center' }}>
                 <div style={{ fontSize: '2vw', color: customAcc, marginBottom: '2vw' }}>{L(lang, 'quranLbl')}</div>
                 <div style={{ fontSize: '3.5vw', lineHeight: '1.4' }}>وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ</div>
                 <div style={{ fontSize: '2vw', color: 'rgba(255,255,255,0.7)', marginTop: '2vw' }}>"I created jinn and humans only to worship Me."</div>
               </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  )
}

export default App
