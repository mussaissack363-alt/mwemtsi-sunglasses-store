import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCwY9GMCaPDTNJeGzfM2Je7GqNdc7Hb7M0",
  authDomain: "mwemtsi-glasses.firebaseapp.com",
  projectId: "mwemtsi-glasses",
  storageBucket: "mwemtsi-glasses.firebasestorage.app",
  messagingSenderId: "141452655441",
  appId: "1:141452655441:web:1c7933e7f967559bcb7170"
}

let app, db, storage
try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  storage = getStorage(app)
} catch (e) {
  console.warn('Firebase init failed:', e.message)
}

export { db, storage }
