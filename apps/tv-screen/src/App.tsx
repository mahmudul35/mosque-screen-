import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './lib/firebase'

function App() {
  const [mosqueData, setMosqueData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Real-time Firebase Listener
  useEffect(() => {
    // Read the mosque Document ID from the URL: http://localhost:5174/?id=YOUR_FIREBASE_DOC_ID
    const params = new URLSearchParams(window.location.search)
    const docId = params.get('id')
    
    if (!docId) {
      setError("Mosque ID is missing. Please add ?id=YOUR_DOC_ID in the URL.")
      return
    }

    const unsub = onSnapshot(doc(db, "mosques", docId), (docSnap) => {
      if (docSnap.exists()) {
        setMosqueData(docSnap.data())
      } else {
        setError("Mosque not found in Firebase.")
      }
    }, (error) => {
      setError("Failed to connect to Firebase: " + error.message)
    })

    return () => unsub() // Auto clean up the listener
  }, [])


  if (error) {
    return <div className="tv-container bg-black flex items-center justify-center p-tv-8 text-tv-xl text-tv-background bg-tv-surface">
      <div className="bg-red-500 p-tv-4 rounded-3xl">{error}</div>
    </div>
  }

  if (!mosqueData) {
    return <div className="tv-container bg-black flex flex-col items-center justify-center p-tv-8">
      <div className="text-tv-lg font-bold">Connecting to Central Server... <span className="animate-pulse">⏳</span></div>
    </div>
  }

  // Fallback to landscape if not provided
  const orientation = mosqueData.orientation || 'landscape'
  const containerClass = `tv-container ${orientation === 'portrait' ? 'tv-engine-portrait-rotated' : ''}`
  
  const tickerText = mosqueData.tickerText || "Welcome to our Mosque. Please silence your mobile phones."

  return (
    <div className={containerClass}>
      {/* --- TV UI LAYOUT --- */}
      <div className="w-full h-full flex flex-col p-tv-4 gap-tv-4 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-tv-background/80 backdrop-blur-sm z-0"></div>

        {/* HEADER */}
        <header className="relative z-10 flex justify-between items-center bg-tv-surface/40 rounded-3xl border border-white/10 p-tv-4 backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="text-tv-lg font-bold text-tv-primary">{mosqueData.name}</h1>
            <p className="text-tv-sm text-tv-muted">{mosqueData.address || "Location unavailable"}</p>
          </div>
          <div className="flex flex-col items-end">
            <h2 className="text-tv-2xl font-black tabular-nums tracking-tighter">14:05</h2>
            <p className="text-tv-sm text-tv-primary font-medium">Ashar - 15 mins</p>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="relative z-10 flex-1 flex gap-tv-4 min-h-0">
          
          {/* LEFT: Prayer Times Table */}
          <div className="w-[40%] bg-tv-surface/60 rounded-3xl border border-white/10 p-tv-4 flex flex-col min-h-0 backdrop-blur-md">
            <h3 className="text-tv-base font-semibold mb-tv-2 border-b border-white/10 pb-tv-1 text-tv-accent uppercase tracking-widest">Prayer Times</h3>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              {[
                { name: 'Fajr', time: '04:45 AM', iqamah: '05:00 AM', active: false },
                { name: 'Dhuhr', time: '12:30 PM', iqamah: '01:00 PM', active: false },
                { name: 'Asr', time: '04:15 PM', iqamah: '04:30 PM', active: true },
                { name: 'Maghrib', time: '06:40 PM', iqamah: '06:45 PM', active: false },
                { name: 'Isha', time: '08:00 PM', iqamah: '08:15 PM', active: false },
              ].map((prayer) => (
                <div key={prayer.name} className={`flex justify-between items-center py-tv-1 px-tv-4 rounded-xl transition-all ${prayer.active ? 'bg-tv-primary text-tv-background scale-[1.02] shadow-2xl shadow-tv-primary/20' : 'hover:bg-white/5'}`}>
                  <span className={`text-tv-lg font-bold ${prayer.active ? '' : 'text-tv-text/90'}`}>{prayer.name}</span>
                  <div className="text-right">
                    <span className={`block text-tv-base ${prayer.active ? 'font-bold' : ''}`}>{prayer.time}</span>
                    <span className={`block text-tv-sm ${prayer.active ? 'opacity-80' : 'text-tv-muted'}`}>Iqamah: {prayer.iqamah}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Dynamic Slider / Announcements */}
          <div className="flex-1 bg-tv-surface/40 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md flex flex-col relative">
             <div className="absolute top-tv-4 left-tv-4 bg-red-500/20 text-red-400 px-tv-2 py-tv-1 rounded text-tv-xs font-bold uppercase tracking-wider border border-red-500/50">
               Announcement
             </div>
             <div className="flex-1 flex flex-col justify-center items-center text-center p-tv-8">
                <p className="text-tv-xl font-bold leading-tight mb-tv-4">
                  "The best among you are those who learn the Quran and teach it."
                </p>
                <p className="text-tv-base text-tv-primary">- Sahih Al-Bukhari</p>
             </div>
             
             {/* Progress Bar for Slider */}
             <div className="h-1 bg-white/20 w-full mt-auto">
                <div className="h-full bg-tv-primary w-[45%] transition-all duration-1000"></div>
             </div>
          </div>

        </main>

        {/* FOOTER TICKER */}
        <footer className="relative z-10 bg-tv-primary text-tv-background rounded-full px-tv-4 py-tv-2 overflow-hidden flex items-center whitespace-nowrap">
           <span className="font-bold text-tv-sm uppercase mr-tv-4 shrink-0">News:</span>
           <div className="text-tv-sm font-medium animate-marquee inline-block w-full">
              {tickerText}
           </div>
        </footer>
      </div>

    </div>
  )
}

export default App
