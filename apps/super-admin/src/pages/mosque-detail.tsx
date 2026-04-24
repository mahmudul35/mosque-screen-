import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useGetMosqueByIdQuery, useUpdateMosqueMutation, type Mosque } from "@/store/api/apiSlice"
import { ArrowLeft, Loader2, Save, MonitorPlay } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MosqueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const { data: mosque, isLoading, isError } = useGetMosqueByIdQuery(id!)
  const [updateMosque, { isLoading: isUpdating }] = useUpdateMosqueMutation()

  const [formData, setFormData] = useState<Partial<Mosque>>({})

  useEffect(() => {
    if (mosque) {
      setFormData(mosque)
    }
  }, [mosque])

  const handleChange = (field: keyof Mosque, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (id) {
      await updateMosque({ id, data: formData })
      navigate('/mosques')
    }
  }

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (isError || !mosque) {
    return <div className="text-center text-destructive mt-10">Mosque not found or error loading data.</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mosques')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{mosque.name}</h1>
            <Badge variant={mosque.status === 'Active' ? 'default' : mosque.status === 'Suspended' ? 'destructive' : 'secondary'} className={mosque.status === 'Active' ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}>
              {mosque.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">ID: {mosque.mosqueId} • Last Active: {new Date(mosque.lastActive).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update mosque basic details and address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Mosque Name</Label>
                <Input id="name" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={formData.country || ""} onChange={(e) => handleChange("country", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone || "Europe/London"} onValueChange={(val) => handleChange("timezone", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardHeader>
              <CardTitle>Subscription & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val) => handleChange("status", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select value={formData.plan} onValueChange={(val) => handleChange("plan", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2 font-bold"><MonitorPlay className="h-5 w-5 text-primary" /> TV Screens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mosque.screensCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Currently active displays</p>
              <Button variant="outline" className="w-full mt-4 bg-background">Manage Screens</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
