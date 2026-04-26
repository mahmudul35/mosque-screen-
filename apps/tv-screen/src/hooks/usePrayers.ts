import { useState, useEffect } from 'react'

export interface PrayerMeta {
  key: string
  ar: string
  arN: string
  ico: string
  hasIq: boolean
}

export const PMETA: PrayerMeta[] = [
  { key: 'Fajr', ar: 'الفجر', arN: 'صَلاَةُ الْفَجْر', ico: '🌅', hasIq: true },
  { key: 'Shuruq', ar: 'الشروق', arN: 'الشروق', ico: '🌄', hasIq: false },
  { key: 'Dhuhr', ar: 'الظهر', arN: 'صَلاَةُ الظُّهر', ico: '☀️', hasIq: true },
  { key: 'Asr', ar: 'العصر', arN: 'صَلاَةُ الْعَصر', ico: '🌤', hasIq: true },
  { key: 'Maghrib', ar: 'المغرب', arN: 'صَلاَةُ الْمَغرِب', ico: '🌇', hasIq: true },
  { key: 'Isha', ar: 'العشاء', arN: 'صَلاَةُ الْعِشَاء', ico: '🌙', hasIq: true },
]

export function usePrayers(mosqueData: any) {
  const [apiData, setApiData] = useState<Record<string, { adhan: string }>>({})

  useEffect(() => {
    if (!mosqueData) return

    const lat = mosqueData.lat
    const lng = mosqueData.lng
    const city = mosqueData.city || 'Dhaka'
    const country = mosqueData.country || 'Bangladesh'
    const method = mosqueData.prayerConfig?.method || '3'

    const fetchPrayers = async () => {
      const now = new Date()
      const ds = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`

      // Use coordinates-based API when available (more accurate: ±1-2 min)
      // Fall back to city-based API for legacy mosques (±5-10 min)
      let url: string
      if (lat && lng) {
        url = `https://api.aladhan.com/v1/timings/${ds}?latitude=${lat}&longitude=${lng}&method=${method}`
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity/${ds}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`
      }

      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data.code === 200) {
          const t = data.data.timings
          const cl = (s: string) => s ? s.substring(0, 5) : '--:--'
          setApiData({
            Fajr: { adhan: cl(t.Fajr) },
            Shuruq: { adhan: cl(t.Sunrise) },
            Dhuhr: { adhan: cl(t.Dhuhr) },
            Asr: { adhan: cl(t.Asr) },
            Maghrib: { adhan: cl(t.Maghrib) },
            Isha: { adhan: cl(t.Isha) }
          })
        }
      } catch (e) {
        console.error("AlAdhan Fetch Error:", e)
      }
    }

    fetchPrayers()

    // Refresh every 4 hours
    const intervalId = setInterval(fetchPrayers, 1000 * 60 * 60 * 4)
    return () => clearInterval(intervalId)
  }, [mosqueData?.lat, mosqueData?.lng, mosqueData?.city, mosqueData?.country, mosqueData?.prayerConfig?.method])

  return { apiData }
}
