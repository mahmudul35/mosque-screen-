import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"

export interface Mosque {
  id: string
  mosqueId: string // e.g., MSQ-BD-001
  name: string
  address: string
  country: string
  timezone: string
  plan: "Free" | "Basic" | "Pro" | "Enterprise"
  status: "Active" | "Suspended" | "Trial"
  screensCount: number
  lastActive: string // ISO date
  adminEmail: string
}

// Temporary Mock Data
const mockMosques: Mosque[] = [
  { id: "1", mosqueId: "MSQ-UK-001", name: "Central Mosque London", address: "146 Park Road, London", country: "United Kingdom", timezone: "Europe/London", plan: "Pro", status: "Active", screensCount: 3, lastActive: new Date().toISOString(), adminEmail: "imam@londonmosque.com" },
  { id: "2", mosqueId: "MSQ-BD-002", name: "Baitul Mukarram", address: "Purana Paltan, Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", plan: "Enterprise", status: "Active", screensCount: 12, lastActive: new Date().toISOString(), adminEmail: "admin@baitulmukarram.bd" },
  { id: "3", mosqueId: "MSQ-US-003", name: "Islamic Center of New York", address: "1 Riverside Dr, NY", country: "United States", timezone: "America/New_York", plan: "Basic", status: "Trial", screensCount: 1, lastActive: new Date(Date.now() - 86400000).toISOString(), adminEmail: "hello@icny.org" },
  { id: "4", mosqueId: "MSQ-FR-004", name: "Grand Mosque of Paris", address: "2bis Place du Puits", country: "France", timezone: "Europe/Paris", plan: "Free", status: "Suspended", screensCount: 0, lastActive: new Date(Date.now() - 2592000000).toISOString(), adminEmail: "contact@grandmosque.fr" },
  { id: "5", mosqueId: "MSQ-AE-005", name: "Sheikh Zayed Grand Mosque", address: "Abu Dhabi", country: "UAE", timezone: "Asia/Dubai", plan: "Enterprise", status: "Active", screensCount: 45, lastActive: new Date().toISOString(), adminEmail: "it@szgmc.ae" },
]

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Mosque", "Subscription", "User"],
  endpoints: (builder) => ({
    getMosques: builder.query<Mosque[], void>({
      queryFn: async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))
        return { data: mockMosques }
      },
      providesTags: ["Mosque"],
    }),
    
    addMosque: builder.mutation<Mosque, Partial<Mosque>>({
      queryFn: async (newMosque) => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        const mosque: Mosque = {
          ...newMosque,
          id: Math.random().toString(),
          mosqueId: `MSQ-${newMosque.country?.substring(0,2).toUpperCase() || 'XX'}-${Math.floor(Math.random() * 1000)}`,
          status: "Trial",
          screensCount: 0,
          lastActive: new Date().toISOString()
        } as Mosque;
        return { data: mosque }
      },
      invalidatesTags: ["Mosque"], // Instruct RTK to refetch mosques list
    }),

    deleteMosque: builder.mutation<{ success: boolean; id: string }, string>({
      queryFn: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        return { data: { success: true, id } }
      },
      invalidatesTags: ["Mosque"],
    })
  }),
})

export const { useGetMosquesQuery, useAddMosqueMutation, useDeleteMosqueMutation } = apiSlice
