import type { Mosque } from "@/store/api/apiSlice";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const PRAYERS = [
  { key: 'Fajr',    name: 'Fajr',    hasIq: true  },
  { key: 'Shuruq',  name: 'Shuruq',  hasIq: false },
  { key: 'Dhuhr',   name: 'Dhuhr',   hasIq: true  },
  { key: 'Asr',     name: 'Asr',     hasIq: true  },
  { key: 'Maghrib', name: 'Maghrib', hasIq: true  },
  { key: 'Isha',    name: 'Isha',    hasIq: true  },
];

interface PrayerEntry { adhan: string; iq?: string; m: 'fixed' | 'delay'; d: number }

export function PrayerLogicGrid({
  formData,
  onChange,
}: {
  formData: Partial<Mosque>;
  /** Receives the ENTIRE updated prayerConfig object */
  onChange: (updatedPrayerConfig: any) => void;
}) {
  const prayerConfig = formData.prayerConfig || {};
  const times: Record<string, PrayerEntry> = (prayerConfig as any).prayerTimes || {};

  const handleUpdate = (prayer: string, field: keyof PrayerEntry, value: any) => {
    // Deep-clone the prayerTimes to avoid mutation
    const newTimes: Record<string, PrayerEntry> = JSON.parse(JSON.stringify(times));

    if (!newTimes[prayer]) {
      newTimes[prayer] = { adhan: '', iq: '', m: 'delay', d: 15 };
    }

    (newTimes[prayer] as any)[field] = value;

    // Pass back the FULL prayerConfig with all existing fields preserved
    onChange({
      ...prayerConfig,
      prayerTimes: newTimes,
    });
  };

  return (
    <div className="space-y-3">
      {PRAYERS.map((p) => {
        const pt: PrayerEntry = times[p.key] ?? { adhan: '', iq: '', m: 'delay', d: 15 };

        return (
          <div key={p.key} className="grid grid-cols-[100px_1fr_1fr] items-center gap-4 p-3 border rounded-lg bg-background/50">
            {/* Prayer name */}
            <div className="font-bold text-sm">{p.name}</div>

            {p.hasIq ? (
              <>
                {/* Mode selector */}
                <div className="space-y-1">
                  <Label className="uppercase text-[10px] text-muted-foreground tracking-widest">Mode</Label>
                  <Select
                    value={pt.m || 'delay'}
                    onValueChange={(val) => handleUpdate(p.key, 'm', val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">⏰ Fixed Time</SelectItem>
                      <SelectItem value="delay">⏳ Delay (mins after Adhan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Value input */}
                <div className="space-y-1">
                  <Label className="uppercase text-[10px] text-muted-foreground tracking-widest">
                    {pt.m === 'fixed' ? 'Iqamah Time (HH:MM)' : 'Minutes After Adhan'}
                  </Label>

                  {pt.m === 'fixed' ? (
                    <Input
                      type="time"
                      className="h-8 text-sm font-mono"
                      value={pt.iq || ''}
                      onChange={(e) => handleUpdate(p.key, 'iq', e.target.value)}
                    />
                  ) : (
                    <Input
                      type="number"
                      className="h-8 text-sm"
                      min={1}
                      max={60}
                      value={pt.d ?? 15}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        handleUpdate(p.key, 'd', isNaN(val) ? 15 : val);
                      }}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="col-span-2 text-sm text-muted-foreground italic">No Iqamah (sunrise time only)</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
