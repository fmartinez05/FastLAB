import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyByJG_FB5SpjXlG6Z4k4J-amg3f-bGrLOY",
  authDomain: "fastlab-ai.firebaseapp.com",
  projectId: "fastlab-ai",
  storageBucket: "fastlab-ai.appspot.com",
  messagingSenderId: "347696490778",
  appId: "1:347696490778:web:e0af232f62960e515764a3",
  measurementId: "G-5BPV7JFBDV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que usaremos en la aplicación
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;