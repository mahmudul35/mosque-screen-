import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Mosque {
  id: string
  mosqueId: string
  name: string
  address: string
  country: string
  timezone: string
  plan: "Free" | "Basic" | "Pro" | "Enterprise"
  status: "Active" | "Suspended" | "Trial"
  screensCount: number
  lastActive: string
  adminEmail: string
  createdAt: string
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Mosque"],
  endpoints: (builder) => ({
    getMosques: builder.query<Mosque[], void>({
      queryFn: async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "mosques"))
          const mosques: Mosque[] = []
          querySnapshot.forEach((doc) => {
            mosques.push({ id: doc.id, ...doc.data() } as Mosque)
          })
          return { data: mosques }
        } catch (error: any) {
          return { error: { message: error.message } }
        }
      },
      providesTags: ["Mosque"],
    }),
    
    getMosqueById: builder.query<Mosque, string>({
      queryFn: async (id) => {
        try {
          const docRef = doc(db, "mosques", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { data: { id: docSnap.id, ...docSnap.data() } as Mosque }
          }
          return { error: { message: "Mosque not found" } }
        } catch (error: any) {
          return { error: { message: error.message } }
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Mosque", id }],
    }),

    addMosque: builder.mutation<Mosque, Partial<Mosque>>({
      queryFn: async (newMosque) => {
        try {
          // Generate a custom document ID or use push ID. Let's use a unique string we generate from Firebase id maker implicitly or explicitly.
          // Using doc() with a custom mosqueId if desired, but let's let Firestore auto-generate ID using doc(collection) then setDoc
          const newDocRef = doc(collection(db, "mosques"));
          
          const mosqueId = `MSQ-${newMosque.country?.substring(0,2).toUpperCase() || 'XX'}-${Math.floor(Math.random() * 9000) + 1000}`;
          
          const mosqueData = {
            ...newMosque,
            mosqueId,
            status: "Trial",
            screensCount: 0,
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          await setDoc(newDocRef, mosqueData);
          
          return { data: { id: newDocRef.id, ...mosqueData } as Mosque }
        } catch (error: any) {
          return { error: { message: error.message } }
        }
      },
      invalidatesTags: ["Mosque"],
    }),

    updateMosque: builder.mutation<Mosque, { id: string; data: Partial<Mosque> }>({
      queryFn: async ({ id, data }) => {
        try {
          const docRef = doc(db, "mosques", id);
          await updateDoc(docRef, data);
          return { data: { id, ...data } as Mosque } // Simplified return
        } catch (error: any) {
          return { error: { message: error.message } }
        }
      },
      invalidatesTags: ["Mosque", (_result, _error, arg) => ({ type: "Mosque", id: arg.id })],
    }),

    deleteMosque: builder.mutation<{ success: boolean; id: string }, string>({
      queryFn: async (id) => {
        try {
          await deleteDoc(doc(db, "mosques", id));
          return { data: { success: true, id } }
        } catch (error: any) {
          return { error: { message: error.message } }
        }
      },
      invalidatesTags: ["Mosque"],
    })
  }),
})

export const { 
  useGetMosquesQuery, 
  useGetMosqueByIdQuery, 
  useAddMosqueMutation, 
  useUpdateMosqueMutation, 
  useDeleteMosqueMutation 
} = apiSlice
