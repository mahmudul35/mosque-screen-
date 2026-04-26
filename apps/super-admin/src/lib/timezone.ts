/**
 * Get IANA timezone ID from coordinates using Google Time Zone API.
 * Falls back to browser timezone if API fails.
 */
export async function getTimezoneFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`

    const res = await fetch(url)
    const data = await res.json()

    if (data.status === "OK") {
      return data.timeZoneId // e.g., "Asia/Dhaka", "Europe/Rome"
    }

    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  }
}
