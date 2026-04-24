import { useState, useEffect } from 'react'

function App() {
  // Normally this state would be synced with Firebase Firestore real-time listener!
  // Example scenario: the Super Admin pushes a button to force a vertical orientation.
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')

  useEffect(() => {
    // For demo purposes, we automatically detect physical screen orientation
    // But this can be overridden by Firebase commands.
    const handleResize = () => {
      // Basic auto-detection if Firebase hasn't overridden
      if (window.innerHeight > window.innerWidth) {
         // setOrientation('portrait') but for now we keep it manual for demonstration
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // The CSS hack: If the physical screen is landscape, but we want portrait,
  // we apply a -90deg rotation to the container.
  const containerClass = `tv-container ${orientation === 'portrait' ? 'tv-engine-portrait-rotated' : ''}`

  return (
    <div className={containerClass}>
      {/* 
        DEVELOPER CONTROLS 
        (Invisible in production. Click hidden corner to toggle) 
      */}
      <div 
        className="absolute bottom-0 right-0 p-tv-2 opacity-5 hover:opacity-100 z-50 cursor-pointer"
        onClick={() => setOrientation(prev => prev === 'landscape' ? 'portrait' : 'landscape')}
      >
         🔄 Toggle Orientation
      </div>

      {/* --- TV UI LAYOUT --- */}
      <div className="w-full h-full flex flex-col p-tv-4 gap-tv-4 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80')] bg-cover bg-center">
        {/* Overlay to dim background image */}
        <div className="absolute inset-0 bg-tv-background/80 backdrop-blur-sm z-0"></div>

        {/* HEADER (Clock & Mosque Name) */}
        <header className="relative z-10 flex justify-between items-center bg-tv-surface/40 rounded-3xl border border-white/10 p-tv-4 backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="text-tv-lg font-bold text-tv-primary">Baitul Mukarram Mosque</h1>
            <p className="text-tv-sm text-tv-muted">Dhaka, Bangladesh</p>
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
              Registration for weekend Islamic school is now open. Please visit the office. • Don't forget to pay your Zakat before Ramadan ends. • 
           </div>
        </footer>
      </div>

    </div>
  )
}

export default App
