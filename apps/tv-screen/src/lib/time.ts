export const HMO = ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada I", "Jumada II", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];

export function toHijri(d: Date): string {
  const jd = Math.floor(d.getTime() / 86400000 + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n2 = Math.floor((l - 1) / 10631);
  l = l - 10631 * n2 + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor(50 * l / 17719) + Math.floor(l / 5670) * Math.floor(43 * l / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const mo = Math.floor(24 * l / 709);
  const dy = l - Math.floor(709 * mo / 24);
  const yr = 30 * n2 + j - 30;
  return dy + ' ' + HMO[mo - 1] + ' ' + yr + ' H';
}

export function pad(n: number | string): string {
  return String(n).padStart(2, '0');
}

export function addMins(t: string, m: number | string): string {
  try {
    const [h, mm] = t.split(':').map(Number);
    const tot = h * 60 + mm + parseInt(m as string || "0");
    return pad(Math.floor(tot / 60) % 24) + ':' + pad(tot % 60);
  } catch (e) {
    return '--:--';
  }
}
