import { useState, useEffect } from "react"
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase"

export function PairingScreen({ onPaired }: { onPaired: (mosqueId: string) => void }) {
  const [pin, setPin] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined;

    // 1. Generate a random 6-digit PIN
    const newPin = Math.floor(100000 + Math.random() * 900000).toString()
    setPin(newPin)

    // 2. Save it to pairing_codes collection
    addDoc(collection(db, "pairing_codes"), {
      pin: newPin,
      status: "pending",
      createdAt: serverTimestamp(),
      mosqueId: null
    }).then(docRef => {
      // 3. Listen for changes to this document
      unsub = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          if (data.status === "paired" && data.mosqueId) {
            // Success! We are paired.
            onPaired(data.mosqueId)
          }
        }
      })
    }).catch(err => {
      console.error(err)
      setError("Failed to connect to pairing server. Please check internet connection.")
    })

    // Clean up on unmount
    return () => {
      if (unsub) unsub()
    }
  }, []) // Empty dependency array ensures this only runs exactly once on mount

  return (
    <div style={{
      height: '100vh', 
      width: '100vw', 
      backgroundColor: '#05070f', 
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', padding: '40px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: 'rgba(16, 185, 129, 0.1)', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 30px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
        </div>

        <h1 style={{ fontSize: '3vw', fontWeight: 700, marginBottom: '20px' }}>Connect this Display</h1>
        
        <p style={{ fontSize: '1.5vw', color: 'rgba(255,255,255,0.6)', marginBottom: '50px' }}>
          Log into your Mosque Admin panel, go to <strong>Screens</strong>, and enter the code below to connect this TV.
        </p>

        {error ? (
          <div style={{ color: '#ef4444', fontSize: '1.5vw' }}>{error}</div>
        ) : pin ? (
          <div style={{ 
            fontSize: '8vw', 
            fontWeight: 800, 
            letterSpacing: '0.2em', 
            color: '#10b981',
            textShadow: '0 0 40px rgba(16,185,129,0.3)',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {pin.slice(0,3)} {pin.slice(3)}
          </div>
        ) : (
          <div style={{ fontSize: '2vw', color: 'rgba(255,255,255,0.4)' }}>Generating secure code...</div>
        )}
      </div>
    </div>
  )
}
