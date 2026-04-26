import { useRef, useState, useCallback } from "react"
import { Autocomplete, useLoadScript } from "@react-google-maps/api"
import { getTimezoneFromCoords } from "@/lib/timezone"
import { Loader2, MapPin } from "lucide-react"

const libraries: ("places")[] = ["places"]

export interface PlaceResult {
  city: string
  country: string
  formattedAddress: string
  lat: number
  lng: number
  timezone: string
}

interface LocationPickerProps {
  defaultValue?: string
  onPlaceSelected: (place: PlaceResult) => void
  placeholder?: string
}

export function LocationPicker({ defaultValue, onPlaceSelected, placeholder }: LocationPickerProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(defaultValue || "")
  const [isResolving, setIsResolving] = useState(false)

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete
  }, [])

  const onPlaceChanged = useCallback(async () => {
    const autocomplete = autocompleteRef.current
    if (!autocomplete) return

    const place = autocomplete.getPlace()
    if (!place.geometry?.location) return

    setIsResolving(true)

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const formattedAddress = place.formatted_address || ""

    // Parse address components for city and country
    let city = ""
    let country = ""
    if (place.address_components) {
      for (const component of place.address_components) {
        if (component.types.includes("locality")) {
          city = component.long_name
        }
        if (component.types.includes("administrative_area_level_1") && !city) {
          city = component.long_name
        }
        if (component.types.includes("country")) {
          country = component.long_name
        }
      }
    }

    // If city not found in components, use first part of formatted address
    if (!city && formattedAddress) {
      city = formattedAddress.split(",")[0].trim()
    }

    // Get timezone from coordinates
    const timezone = await getTimezoneFromCoords(lat, lng)

    setInputValue(formattedAddress)
    setIsResolving(false)

    onPlaceSelected({
      city,
      country,
      formattedAddress,
      lat,
      lng,
      timezone,
    })
  }, [onPlaceSelected])

  if (loadError) {
    return (
      <div className="relative">
        <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder || "Enter city name manually"}
          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <p className="text-xs text-amber-500 mt-1">Google Maps unavailable. Enter city name manually.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background/50 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading location search...
      </div>
    )
  }

  return (
    <div className="relative">
      <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 z-10" />
      {isResolving && (
        <Loader2 className="w-4 h-4 animate-spin text-primary absolute right-3 top-1/2 -translate-y-1/2 z-10" />
      )}
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{ types: ["(cities)"] }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder || "Search city or mosque location..."}
          className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </Autocomplete>
    </div>
  )
}
