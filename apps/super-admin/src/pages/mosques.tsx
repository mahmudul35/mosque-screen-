import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useGetMosquesQuery, useAddMosqueMutation, useDeleteMosqueMutation } from "@/store/api/apiSlice"
import { Building2, Search, MoreHorizontal, Plus, Filter, Loader2, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MosquesPage() {
  const navigate = useNavigate()
  const { data: mosques = [], isLoading, isFetching } = useGetMosquesQuery()
  const [deleteMosque] = useDeleteMosqueMutation()
  
  const [search, setSearch] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Filtered Mosques based on search
  const filteredMosques = mosques.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.mosqueId.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this mosque?")) {
      await deleteMosque(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mosques</h1>
          <p className="text-muted-foreground mt-1">Manage all registered mosques and their displays.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="font-semibold shadow-md active:scale-95 transition-transform"><Plus className="mr-2 h-4 w-4" /> Add Mosque</Button>
          </DialogTrigger>
          <AddMosqueDialog onClose={() => setIsAddOpen(false)} />
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card/40 p-4 rounded-lg border backdrop-blur-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or ID..."
            className="pl-9 bg-background/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-background/50"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
      </div>

      <div className="rounded-md border bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Mosque Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Screens</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    Fetching Mosques...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMosques.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  <Building2 className="mx-auto h-8 w-8 mb-4 opacity-30" />
                  No mosques found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMosques.map((mosque) => (
                <TableRow key={mosque.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="font-medium text-xs text-muted-foreground">{mosque.mosqueId}</TableCell>
                  <TableCell className="font-semibold cursor-pointer text-primary hover:underline hover:text-primary/80" onClick={() => navigate(`/mosques/${mosque.id}`)}>
                    {mosque.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {mosque.address}<br/>
                    <span className="text-xs text-muted-foreground">{mosque.country}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={mosque.plan === 'Enterprise' ? 'default' : mosque.plan === 'Pro' ? 'secondary' : 'outline'}>
                      {mosque.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={mosque.status === 'Active' ? 'default' : mosque.status === 'Suspended' ? 'destructive' : 'secondary'} className={mosque.status === 'Active' ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none" : ""}>
                      {mosque.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {mosque.screensCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(mosque.mosqueId)}>
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/mosques/${mosque.id}`)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Manage Screens</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(mosque.id)}>
                          Suspend Mosque
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function AddMosqueDialog({ onClose }: { onClose: () => void }) {
  const [addMosque, { isLoading }] = useAddMosqueMutation()
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addMosque({ name, country, address: "TBD", plan: "Free" })
    onClose()
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Mosque</DialogTitle>
        <DialogDescription>
          Register a new mosque. An email with credentials will be sent automatically.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Mosque Name</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Central City Mosque" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select onValueChange={setCountry} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Bangladesh">Bangladesh</SelectItem>
              <SelectItem value="France">France</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Register Mosque
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
