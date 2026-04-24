import { useState } from "react";
import type { Mosque, AnnItem } from "@/store/api/apiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Image as ImageIcon, Loader2 } from "lucide-react";

const ICONS = ['📢', '📵', '🤫', '🧹', '🕌', '🚫', '✅', '⚠️', '👟', '💧', '📿', '📖', '🤲', '🌙', '⏰', '🔕', '🚪', '🧴', '💚', '🌿', '🔔', '📝', '🎓', '❤️'];

export function AnnouncementBuilder({
  formData,
  handleChange
}: {
  formData: Partial<Mosque>;
  handleChange: (field: keyof Mosque, value: any) => void;
}) {
  const items = formData.annItems || [];
  
  const [type, setType] = useState<"text" | "photo">("text");
  const [icon, setIcon] = useState('📢');
  const [en, setEn] = useState("");
  const [it, setIt] = useState("");
  const [bn, setBn] = useState("");
  const [ar, setAr] = useState("");
  
  const [subEn, setSubEn] = useState("");
  const [subIt, setSubIt] = useState("");
  const [subBn, setSubBn] = useState("");
  const [subAr, setSubAr] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const handleAddText = () => {
    if (!en && !it && !bn && !ar) {
      alert("Add at least one title");
      return;
    }
    const newItem: AnnItem = {
      id: Date.now(),
      type: "text",
      icon, visible: true,
      en, it, bn, ar,
      subEn, subIt, subBn, subAr,
      key: "custom"
    };
    handleChange("annItems", [...items, newItem]);
    setEn(""); setIt(""); setBn(""); setAr("");
    setSubEn(""); setSubIt(""); setSubBn(""); setSubAr("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      setPhotoUrl(url);
    } catch {
      alert("Failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPhoto = () => {
    if (!photoUrl) {
      alert("Upload photo first");
      return;
    }
    const newItem: AnnItem = {
      id: Date.now(),
      type: "photo",
      photo: photoUrl,
      visible: true,
      en, it
    };
    handleChange("annItems", [...items, newItem]);
    setPhotoUrl(""); setEn(""); setIt("");
  };

  const handleDelete = (id: number) => {
    handleChange("annItems", items.filter(i => i.id !== id));
  };

  const toggleVisibility = (id: number) => {
    handleChange("annItems", items.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-xl bg-card">
        <h4 className="font-bold mb-4">Add Announcement</h4>
        <div className="flex gap-2 mb-4">
          <Button variant={type === "text" ? "default" : "outline"} onClick={() => setType("text")}>Text Slide</Button>
          <Button variant={type === "photo" ? "default" : "outline"} onClick={() => setType("photo")}>Photo Slide</Button>
        </div>
        
        {type === "text" && (
          <div className="space-y-4">
            <div>
               <Label>Select Icon</Label>
               <div className="flex flex-wrap gap-2 mt-2">
                 {ICONS.map(ic => (
                   <div key={ic} onClick={() => setIcon(ic)} className={`text-2xl cursor-pointer p-2 rounded-lg border ${icon === ic ? 'bg-primary/20 border-primary' : 'bg-background hover:bg-muted'}`}>
                     {ic}
                   </div>
                 ))}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>English Title</Label><Input value={en} onChange={e => setEn(e.target.value)} /></div>
              <div className="space-y-2"><Label>English Subtitle</Label><Input value={subEn} onChange={e => setSubEn(e.target.value)} /></div>
              
              <div className="space-y-2"><Label>Bengali Title</Label><Input value={bn} onChange={e => setBn(e.target.value)} /></div>
              <div className="space-y-2"><Label>Bengali Subtitle</Label><Input value={subBn} onChange={e => setSubBn(e.target.value)} /></div>
              
              <div className="space-y-2"><Label>Arabic Title</Label><Input dir="rtl" value={ar} onChange={e => setAr(e.target.value)} /></div>
              <div className="space-y-2"><Label>Arabic Subtitle</Label><Input dir="rtl" value={subAr} onChange={e => setSubAr(e.target.value)} /></div>

               <div className="space-y-2"><Label>Italian Title</Label><Input value={it} onChange={e => setIt(e.target.value)} /></div>
              <div className="space-y-2"><Label>Italian Subtitle</Label><Input value={subIt} onChange={e => setSubIt(e.target.value)} /></div>
            </div>
            
            <Button onClick={handleAddText} className="w-full">Add Announcement</Button>
          </div>
        )}

        {type === "photo" && (
          <div className="space-y-4">
             <div className="flex items-center gap-4">
               {photoUrl ? (
                 <img src={photoUrl} className="w-32 h-20 object-cover rounded-md" />
               ) : (
                 <div className="w-32 h-20 bg-muted border-dashed border flex items-center justify-center rounded-md"><ImageIcon className="opacity-50" /></div>
               )}
               <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
               {isUploading && <Loader2 className="animate-spin" />}
             </div>
             <div className="space-y-2"><Label>Caption (English) - Optional</Label><Input value={en} onChange={e => setEn(e.target.value)} /></div>
             <div className="space-y-2"><Label>Caption (Italian) - Optional</Label><Input value={it} onChange={e => setIt(e.target.value)} /></div>
             <Button onClick={handleAddPhoto} className="w-full">Add Photo Slide</Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-lg">Active Announcements ({items.length})</h4>
        {items.length === 0 && <div className="text-muted-foreground text-sm italic">No custom announcements. Note: Prebuilt silent phone/clean mosque slides are managed in the Slides toggle tab.</div>}
        {items.map(item => (
          <div key={item.id} className={`p-3 border rounded-lg flex justify-between gap-4 items-center ${item.visible ? 'bg-background' : 'bg-muted opacity-60'}`}>
            <div className="text-3xl">{item.type === 'photo' ? '🖼️' : item.icon}</div>
            <div className="flex-1">
              <div className="font-bold">{item.type === 'photo' ? 'Photo Slide' : item.en || item.bn || item.ar}</div>
              <div className="text-sm text-muted-foreground">{item.subEn || item.subBn || item.subAr}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleVisibility(item.id)}>
                {item.visible ? 'Hide' : 'Show'}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
