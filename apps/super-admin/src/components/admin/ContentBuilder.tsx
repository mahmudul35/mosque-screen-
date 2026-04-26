import { useState } from "react";
import type { Mosque, ContentItem } from "@/store/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ContentBuilder({
  formData,
  handleChange
}: {
  formData: Partial<Mosque>;
  handleChange: (field: keyof Mosque, value: any) => void;
}) {
  const items = formData.contentItems || [];
  
  const [type, setType] = useState<"hadith" | "quran">("hadith");
  const [ar, setAr] = useState("");
  const [en, setEn] = useState("");
  const [it, setIt] = useState("");
  const [bn, setBn] = useState("");
  const [src, setSrc] = useState("");

  const handleAdd = () => {
    if (!ar && !en) {
      toast.warning("Please add at least Arabic or English content");
      return;
    }
    const newItem: ContentItem = {
      id: Date.now(),
      type,
      ar, en, it, bn, src
    };
    handleChange("contentItems", [...items, newItem]);
    setAr(""); setEn(""); setIt(""); setBn(""); setSrc("");
  };

  const handleDelete = (id: number) => {
    handleChange("contentItems", items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-xl bg-card">
        <h4 className="font-bold mb-4">Add Custom Content</h4>
        <div className="flex gap-2 mb-4">
          <Button variant={type === "hadith" ? "default" : "outline"} onClick={() => setType("hadith")}>Hadith</Button>
          <Button variant={type === "quran" ? "default" : "outline"} onClick={() => setType("quran")}>Quran</Button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Arabic Text</Label>
            <Textarea dir="rtl" className="font-arabic text-lg" value={ar} onChange={e => setAr(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>English Translation</Label><Textarea value={en} onChange={e => setEn(e.target.value)} /></div>
            <div className="space-y-2"><Label>Italian Translation</Label><Textarea value={it} onChange={e => setIt(e.target.value)} /></div>
            <div className="space-y-2"><Label>Bengali Translation</Label><Textarea value={bn} onChange={e => setBn(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label>Source / Reference (e.g. Bukhari 123)</Label>
            <Input value={src} onChange={e => setSrc(e.target.value)} />
          </div>
          <Button onClick={handleAdd} className="w-full">Add Content to Library</Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-lg">Your Content Library ({items.length})</h4>
        {items.length === 0 && <div className="text-muted-foreground text-sm italic">No custom Quran/Hadith added.</div>}
        {items.map(item => (
          <div key={item.id} className="p-3 border rounded-lg bg-background flex justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                 <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground">{item.type}</span>
                 <span className="text-xs text-muted-foreground">{item.src}</span>
              </div>
              <div className="text-right text-lg mb-1" dir="rtl">{item.ar}</div>
              <div className="text-sm text-muted-foreground">{item.en}</div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
