import type { Mosque } from "@/store/api/apiSlice";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const PRAYERS = [
  { key: 'Fajr', name: 'Fajr', hasIq: true },
  { key: 'Shuruq', name: 'Shuruq', hasIq: false },
  { key: 'Dhuhr', name: 'Dhuhr', hasIq: true },
  { key: 'Asr', name: 'Asr', hasIq: true },
  { key: 'Maghrib', name: 'Maghrib', hasIq: true },
  { key: 'Isha', name: 'Isha', hasIq: true },
];

export function PrayerLogicGrid({
  formData,
  handleDeepChange
}: {
  formData: Partial<Mosque>;
  handleDeepChange: (parent: keyof Mosque, field: string, value: any) => void;
}) {
  const times = formData.prayerConfig?.prayerTimes || {};

  const handleUpdate = (prayer: string, field: string, value: any) => {
    const updatedTimes = { ...times };
    if (!updatedTimes[prayer]) {
      updatedTimes[prayer] = { adhan: '', iq: null, m: 'delay', d: 15 };
    }
    (updatedTimes[prayer] as any)[field] = value;
    handleDeepChange("prayerConfig", "prayerTimes", updatedTimes);
  };

  return (
    <div className="space-y-4">
      {PRAYERS.map((p) => {
        const pt = times[p.key] || { adhan: '', iq: '', m: 'delay', d: 15 };
        return (
          <div key={p.key} className="flex items-center gap-4 p-3 border rounded-lg bg-background/50">
            <div className="w-24 font-bold">{p.name}</div>
            
            {p.hasIq ? (
              <>
                <div className="flex-1 space-y-1">
                  <Label className="uppercase text-[10px] text-muted-foreground">Mode</Label>
                  <Select value={pt.m || 'delay'} onValueChange={(val) => handleUpdate(p.key, 'm', val)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Time</SelectItem>
                      <SelectItem value="delay">Delay (Mins)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-1">
                  <Label className="uppercase text-[10px] text-muted-foreground">
                    {pt.m === 'fixed' ? 'Iqamah Time' : 'Minutes After Adhan'}
                  </Label>
                  {pt.m === 'fixed' ? (
                     <Input 
                        type="time" 
                        className="h-8" 
                        value={pt.iq || ''} 
                        onChange={(e) => handleUpdate(p.key, 'iq', e.target.value)} 
                     />
                  ) : (
                     <Input 
                        type="number" 
                        className="h-8" 
                        value={pt.d || 15} 
                        onChange={(e) => handleUpdate(p.key, 'd', parseInt(e.target.value))} 
                     />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 text-sm text-muted-foreground italic">No Iqamah for Shuruq</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
