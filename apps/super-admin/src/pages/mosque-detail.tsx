import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useGetMosqueByIdQuery, useUpdateMosqueMutation, type Mosque, type ThemeSettings } from "@/store/api/apiSlice"
import { ArrowLeft, Loader2, Save, MonitorPlay, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { uploadToCloudinary } from "@/lib/cloudinary"

export function MosqueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: mosque, isLoading, isError } = useGetMosqueByIdQuery(id!)
  const [updateMosque, { isLoading: isUpdating }] = useUpdateMosqueMutation()

  const [formData, setFormData] = useState<Partial<Mosque>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (mosque) {
      setFormData(mosque)
    }
  }, [mosque])

  const handleChange = (field: keyof Mosque, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDeepChange = (parent: keyof Mosque, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any || {}),
        [field]: value
      }
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const url = await uploadToCloudinary(file)
      handleDeepChange("themeSettings", "bgImage", url)
    } catch (error) {
      alert("Image upload failed!")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (id) {
      await updateMosque({ id, data: formData })
      alert("Changes saved successfully!")
    }
  }

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (isError || !mosque) {
    return <div className="text-center text-destructive mt-10">Mosque not found or error loading data.</div>
  }

  const TABS = [
    { id: "general", label: "General" },
    { id: "tv_display", label: "TV Display Theme" },
    { id: "typography", label: "Typography" },
    { id: "slides", label: "Slides & Content" },
    { id: "prayer", label: "Prayer Logic" },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 border-b border-border/40 pb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mosques')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{mosque.name}</h1>
            <Badge variant={mosque.status === 'Active' ? 'default' : mosque.status === 'Suspended' ? 'destructive' : 'secondary'}>
              {mosque.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">ID: {mosque.mosqueId} • Central Control Hub</p>
        </div>
        <div className="ml-auto flex gap-2">
           <Button variant="outline" onClick={() => window.open(`http://localhost:5174?id=${id}`, '_blank')}>
            <MonitorPlay className="mr-2 h-4 w-4" /> Live Preview
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save & Sync to TV
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map(tab => (
          <Button 
            key={tab.id} 
            variant={activeTab === tab.id ? "default" : "outline"} 
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          
          {activeTab === "general" && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/60">
              <CardHeader>
                <CardTitle>Mosque Information</CardTitle>
                <CardDescription>Core identity and location settings for Aladhan API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mosque Name</Label>
                  <Input value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Address / Sub-title</Label>
                  <Input value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={formData.country || ""} onChange={(e) => handleChange("country", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>City (For Prayer API)</Label>
                    <Input value={formData.city || ""} onChange={(e) => handleChange("city", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "tv_display" && (
            <>
              <Card className="bg-card/50 backdrop-blur-sm border-border/60">
                <CardHeader>
                  <CardTitle>TV Language & Theme</CardTitle>
                  <CardDescription>Choose the core design layout and display language.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Display Language</Label>
                      <Select value={formData.displayLang || "en"} onValueChange={(val) => handleChange("displayLang", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="it">Italiano</SelectItem>
                          <SelectItem value="ar">العربية (Arabic)</SelectItem>
                          <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>TV Design Preset</Label>
                      <Select value={formData.themeSettings?.tvDesign || "A"} onValueChange={(val) => handleDeepChange("themeSettings", "tvDesign", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Theme A (Dark Blue)</SelectItem>
                          <SelectItem value="E">Theme E (Light Minimal)</SelectItem>
                          <SelectItem value="H">Theme H (Masjid Al-Rahman)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/60">
                <CardHeader>
                  <CardTitle>Background Styling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <Label>Background Image (Cloudinary)</Label>
                    <div className="flex items-center gap-4">
                      {formData.themeSettings?.bgImage ? (
                        <div className="relative w-32 h-20 rounded-md overflow-hidden bg-black flex-shrink-0">
                          <img src={formData.themeSettings.bgImage} className="object-cover w-full h-full opacity-80" alt="bg" />
                        </div>
                      ) : (
                        <div className="w-32 h-20 rounded-md bg-muted flex items-center justify-center border border-dashed flex-shrink-0">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="mb-2" />
                        <p className="text-xs text-muted-foreground">Upload a vibrant scenery image. It will be automatically blurred based on the setting below.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label>Overlay Opacity (Dark Tint): {formData.themeSettings?.bgOpacity || '0.85'}</Label>
                      <input 
                        type="range" className="w-full" min="0" max="1" step="0.05" 
                        value={formData.themeSettings?.bgOpacity || '0.85'} 
                        onChange={(e) => handleDeepChange("themeSettings", "bgOpacity", e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Background Blur: {formData.themeSettings?.bgBlur || '0'}px</Label>
                      <input 
                        type="range" className="w-full" min="0" max="40" step="1" 
                        value={formData.themeSettings?.bgBlur || '0'} 
                        onChange={(e) => handleDeepChange("themeSettings", "bgBlur", e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <input type="color" className="h-9 w-12 cursor-pointer bg-transparent" value={formData.themeSettings?.customAcc || '#00d4ff'} onChange={(e) => handleDeepChange("themeSettings", "customAcc", e.target.value)} />
                        <Input value={formData.themeSettings?.customAcc || '#00d4ff'} onChange={(e) => handleDeepChange("themeSettings", "customAcc", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gold Output</Label>
                      <div className="flex gap-2">
                        <input type="color" className="h-9 w-12 cursor-pointer bg-transparent" value={formData.themeSettings?.customGold || '#ffd700'} onChange={(e) => handleDeepChange("themeSettings", "customGold", e.target.value)} />
                        <Input value={formData.themeSettings?.customGold || '#ffd700'} onChange={(e) => handleDeepChange("themeSettings", "customGold", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Iqamah Color</Label>
                      <div className="flex gap-2">
                        <input type="color" className="h-9 w-12 cursor-pointer bg-transparent" value={formData.themeSettings?.customIq || '#00ff88'} onChange={(e) => handleDeepChange("themeSettings", "customIq", e.target.value)} />
                        <Input value={formData.themeSettings?.customIq || '#00ff88'} onChange={(e) => handleDeepChange("themeSettings", "customIq", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "typography" && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/60">
              <CardHeader>
                <CardTitle>Typography Engine</CardTitle>
                <CardDescription>Adjust font sizes globally. Note: TV engine uses viewport width (vw), so 20 means 20% of screen width.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between"><Label>Main Clock Size</Label><span className="text-sm font-bold text-primary">{formData.typography?.fsClock || '88'}vw</span></div>
                    <input type="range" className="w-full" min="30" max="150" step="1" value={formData.typography?.fsClock || '88'} onChange={(e) => handleDeepChange("typography", "fsClock", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><Label>Adhan Number Size</Label><span className="text-sm font-bold text-primary">{formData.typography?.fsAdhan || '25'}vw</span></div>
                    <input type="range" className="w-full" min="15" max="50" step="1" value={formData.typography?.fsAdhan || '25'} onChange={(e) => handleDeepChange("typography", "fsAdhan", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><Label>Iqamah Countdown Size</Label><span className="text-sm font-bold text-primary">{formData.typography?.fsIq || '34'}vw</span></div>
                    <input type="range" className="w-full" min="20" max="80" step="1" value={formData.typography?.fsIq || '34'} onChange={(e) => handleDeepChange("typography", "fsIq", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><Label>Prayer Name Size</Label><span className="text-sm font-bold text-primary">{formData.typography?.fsNm || '10'}vw</span></div>
                    <input type="range" className="w-full" min="8" max="25" step="1" value={formData.typography?.fsNm || '10'} onChange={(e) => handleDeepChange("typography", "fsNm", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><Label>Slide Text Size</Label><span className="text-sm font-bold text-primary">{formData.typography?.fsSlide || '14'}vw</span></div>
                    <input type="range" className="w-full" min="8" max="30" step="1" value={formData.typography?.fsSlide || '14'} onChange={(e) => handleDeepChange("typography", "fsSlide", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><Label>Arabic Quote Size</Label><span className="text-sm font-bold text-primary">{formData.typography?.fsAr || '28'}vw</span></div>
                    <input type="range" className="w-full" min="15" max="50" step="1" value={formData.typography?.fsAr || '28'} onChange={(e) => handleDeepChange("typography", "fsAr", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "slides" && (
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/60">
                <CardHeader>
                  <CardTitle>Active Slides & Duration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={formData.slideConfig?.showQuran !== '0'} onChange={(e) => handleDeepChange("slideConfig", "showQuran", e.target.checked ? '1' : '0')} />
                      📖 Quranic Reminder
                    </Label>
                    <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={formData.slideConfig?.showAnn !== '0'} onChange={(e) => handleDeepChange("slideConfig", "showAnn", e.target.checked ? '1' : '0')} />
                      📢 Announcements
                    </Label>
                    <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={formData.slideConfig?.showHadith !== '0'} onChange={(e) => handleDeepChange("slideConfig", "showHadith", e.target.checked ? '1' : '0')} />
                      📜 Hadith of the Day
                    </Label>
                    <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={formData.slideConfig?.showClean !== '0'} onChange={(e) => handleDeepChange("slideConfig", "showClean", e.target.checked ? '1' : '0')} />
                      🧹 Cleanliness Slide
                    </Label>
                    <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={formData.slideConfig?.showDars !== '0'} onChange={(e) => handleDeepChange("slideConfig", "showDars", e.target.checked ? '1' : '0')} />
                      📚 Weekly Dars
                    </Label>
                    <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={formData.slideConfig?.showCommunity !== '0'} onChange={(e) => handleDeepChange("slideConfig", "showCommunity", e.target.checked ? '1' : '0')} />
                      ❤️ Community
                    </Label>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <Label>Slide Duration (seconds):</Label>
                    <Input type="number" className="w-24 text-center font-bold" min="5" max="60" value={formData.slideConfig?.slideDur || "10"} onChange={(e) => handleDeepChange("slideConfig", "slideDur", e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/60">
                <CardHeader>
                  <CardTitle>📚 Weekly Dars Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Title</Label>
                       <Input value={formData.slideConfig?.darsTitle || "Weekly Dars"} onChange={(e) => handleDeepChange("slideConfig", "darsTitle", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <Label>Badge Tag</Label>
                       <Input value={formData.slideConfig?.darsTag || "Weekly Invitation"} onChange={(e) => handleDeepChange("slideConfig", "darsTag", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Day</Label>
                      <Select value={formData.slideConfig?.darsDay || "Sunday"} onValueChange={(val) => handleDeepChange("slideConfig", "darsDay", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                       <Label>Time</Label>
                       <Input value={formData.slideConfig?.darsTime || "After Dhuhr"} onChange={(e) => handleDeepChange("slideConfig", "darsTime", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <Label>Location</Label>
                       <Input value={formData.slideConfig?.darsPlace || "In the mosque"} onChange={(e) => handleDeepChange("slideConfig", "darsPlace", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <Label>Footer Note</Label>
                     <Input value={formData.slideConfig?.darsNote || "Everyone is welcome — brothers and sisters in faith"} onChange={(e) => handleDeepChange("slideConfig", "darsNote", e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "prayer" && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/60">
               <CardHeader>
                <CardTitle>Prayer Method & Jumu'ah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label>Calculation Method</Label>
                  <Select value={formData.prayerConfig?.method || "3"} onValueChange={(val) => handleDeepChange("prayerConfig", "method", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 — Muslim World League</SelectItem>
                      <SelectItem value="2">2 — ISNA</SelectItem>
                      <SelectItem value="5">5 — Egyptian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jumu'ah Iqamah Time</Label>
                    <Input type="time" value={formData.prayerConfig?.jumuahIq || "13:30"} onChange={(e) => handleDeepChange("prayerConfig", "jumuahIq", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jumu'ah Label Override</Label>
                    <Input value={formData.prayerConfig?.jumuahNote || "Friday Prayer — Iqamah"} onChange={(e) => handleDeepChange("prayerConfig", "jumuahNote", e.target.value)} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ Note: Daily Iqamah fixed/delay overrides will be added here in phase 2. Right now it pulls realtime Adhan automatically.
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2 font-bold"><MonitorPlay className="h-5 w-5 text-primary" /> TV Hardware Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mosque.screensCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Currently active displays</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
