import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './lib/firebase'

interface Prayer {
  name: string;
  timeStr24: string; // From API e.g. "14:30"
  timeFormatted: string; // e.g. "02:30 PM"
  timeObj: Date; // For comparison
  iqamahStr: string;   
}

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return d;
}

function formatTimeAMPM(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function App() {
  const [mosqueData, setMosqueData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Clock state
  const [time, setTime] = useState<Date>(new Date())
  // Prayer state
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [nextPrayerInfo, setNextPrayerInfo] = useState<{name: string, diffStr: string}>({ name: 'Loading', diffStr: '--:--' })
  const [activePrayerIndex, setActivePrayerIndex] = useState<number>(-1)

  // 1. Firebase Listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const docId = params.get('id')
    if (!docId) {
      setError("Mosque ID is missing. Add ?id=YOUR_DOC_ID")
      return
    }

    const unsub = onSnapshot(doc(db, "mosques", docId), (docSnap) => {
      if (docSnap.exists()) {
        setMosqueData(docSnap.data())
      } else {
        setError("Mosque not found.")
      }
    }, (error) => setError(error.message))

    return () => unsub()
  }, [])

  // 2. Fetch Prayer Times when Mosque data is available
  useEffect(() => {
    if (!mosqueData) return;
    
    // Aladhan API fetch based on address/country
    // E.g., we joined address and country for better resolution
    const addressQuery = `${mosqueData.address || ''}, ${mosqueData.country || ''}`.trim()
    if (!addressQuery) return;

    fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(addressQuery)}`)
      .then(res => res.json())
      .then(data => {
        if(data.code === 200) {
          const t = data.data.timings;
          // Extract specific prayers
          const pNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          const parsedPrayers: Prayer[] = pNames.map(name => {
            const timeStr24 = t[name];
            // Mock Iqamah (+15 mins) for now - can be set from DB later
            const tObj = parseTime(timeStr24);
            const iqObj = new Date(tObj.getTime() + 15 * 60000); 
            
            return {
              name,
              timeStr24,
              timeFormatted: formatTimeAMPM(timeStr24),
              timeObj: tObj,
              iqamahStr: formatTimeAMPM(`${iqObj.getHours().toString().padStart(2, '0')}:${iqObj.getMinutes().toString().padStart(2, '0')}`)
            };
          });
          setPrayers(parsedPrayers);
        }
      })
      .catch(err => console.error("API Fetch error:", err))
  }, [mosqueData]) // Refetched if location changes

  // 3. Ticking Clock Engine (Updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      // Engine to calculate next prayer & diff
      if (prayers.length > 0) {
        let nextIndex = prayers.findIndex(p => p.timeObj > now);
        
        // If all prayers today have passed, next is Fajr tomorrow
        let isTomorrow = false;
        if (nextIndex === -1) {
          nextIndex = 0; // Fajr
          isTomorrow = true;
        }
        
        // Find current/active prayer (the one immediately preceding nextIndex)
        let activeIdx = nextIndex - 1;
        if (activeIdx < 0 && !isTomorrow) activeIdx = -1; // Before Fajr today
        if (isTomorrow) activeIdx = prayers.length - 1; // After Isha today
        setActivePrayerIndex(activeIdx);

        // Calc time difference
        let diffMs = prayers[nextIndex].timeObj.getTime() - now.getTime();
        if (isTomorrow) {
          diffMs += 24 * 60 * 60 * 1000; // Add 24 hours
        }

        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);

        setNextPrayerInfo({
          name: prayers[nextIndex].name,
          diffStr: `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [prayers])


  if (error) {
    return <div className="tv-container bg-black flex items-center justify-center p-tv-8 text-tv-xl text-red-500">{error}</div>
  }

  if (!mosqueData || prayers.length === 0) {
    return <div className="tv-container bg-black flex items-center justify-center p-tv-8 text-tv-lg text-white">
      Booting Mosque Digital Signage...
    </div>
  }

  const orientation = mosqueData.orientation || 'landscape'
  const containerClass = `tv-container ${orientation === 'portrait' ? 'tv-engine-portrait-rotated' : ''}`
  const tickerText = mosqueData.tickerText || "Welcome to the Mosque."

  const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={containerClass}>
      <div className="w-full h-full flex flex-col p-tv-4 gap-tv-4 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-tv-background/80 backdrop-blur-sm z-0"></div>

        {/* HEADER */}
        <header className="relative z-10 flex justify-between items-center bg-tv-surface/40 rounded-3xl border border-white/10 p-tv-4 backdrop-blur-md shadow-lg">
          <div className="flex flex-col drop-shadow-md">
            <h1 className="text-tv-lg font-black text-tv-primary tracking-tight">{mosqueData.name}</h1>
            <p className="text-tv-sm text-tv-text/80 font-medium">{dateString}</p>
          </div>
          <div className="flex flex-col items-end drop-shadow-md">
            <h2 className="text-tv-3xl font-black tabular-nums tracking-tighter leading-none">{timeString}</h2>
            <p className="text-tv-base text-tv-accent font-bold mt-1">Next: {nextPrayerInfo.name} in {nextPrayerInfo.diffStr}</p>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="relative z-10 flex-1 flex gap-tv-4 min-h-0">
          
          {/* LEFT: Prayer Times Table */}
          <div className="w-[40%] bg-tv-surface/60 rounded-3xl border border-white/10 p-tv-4 flex flex-col min-h-0 backdrop-blur-md shadow-lg">
            <h3 className="text-tv-base font-bold mb-tv-2 border-b border-white/20 pb-tv-1 text-tv-accent uppercase tracking-widest">Timetable</h3>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              {prayers.map((prayer, i) => {
                const isActive = i === activePrayerIndex;
                return (
                  <div key={prayer.name} className={`flex justify-between items-center py-tv-1 px-tv-4 rounded-xl transition-all duration-500 overflow-hidden relative ${isActive ? 'bg-tv-primary text-tv-background shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[1.02]' : 'hover:bg-white/5'}`}>
                    {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-white animate-pulse"></div>}
                    <span className={`text-tv-lg font-bold tracking-tight ${isActive ? '' : 'text-tv-text/90'}`}>{prayer.name}</span>
                    <div className="text-right">
                      <span className={`block text-tv-base ${isActive ? 'font-black' : 'font-bold'}`}>{prayer.timeFormatted}</span>
                      <span className={`block text-tv-sm font-medium ${isActive ? 'opacity-90' : 'text-tv-muted'}`}>Iqamah: {prayer.iqamahStr}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Dynamic Slider / Announcements */}
          <div className="flex-1 bg-tv-surface/40 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md shadow-lg flex flex-col relative">
             <div className="absolute top-tv-4 left-tv-4 bg-tv-primary/20 text-tv-primary px-tv-2 py-tv-1 rounded text-tv-sm font-bold uppercase tracking-wider border border-tv-primary/30 backdrop-blur-xl">
               Quote of the Day
             </div>
             <div className="flex-1 flex flex-col justify-center items-center text-center p-tv-8">
                <p className="text-tv-xl font-bold leading-tight mb-tv-4 text-white drop-shadow-lg">
                  "The best among you are those who learn the Quran and teach it."
                </p>
                <p className="text-tv-base text-tv-primary font-bold drop-shadow-md">- Sahih Al-Bukhari</p>
             </div>
          </div>

        </main>

        {/* FOOTER TICKER */}
        <footer className="relative z-10 bg-tv-primary text-tv-background rounded-full px-tv-4 py-tv-1.5 overflow-hidden flex items-center whitespace-nowrap shadow-[0_0_20px_rgba(16,185,129,0.2)]">
           <span className="font-black text-tv-sm uppercase mr-tv-4 shrink-0 bg-tv-background text-tv-primary px-2 py-0.5 rounded-full">Notice</span>
           <div className="text-tv-base font-bold animate-marquee inline-block w-full">
              {tickerText} - {tickerText} - {tickerText}
           </div>
        </footer>
      </div>

    </div>
  )
}

export default App
