import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// LÍNEAS NUEVAS: Importamos la Autenticación y el proveedor de Google
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 

// Tu configuración (Mantenla tal cual la tenías)
const firebaseConfig = {
  apiKey: "AIzaSyD3OLsRliN2k-FreJ2BDsCLoIPygc2GBMM",
  authDomain: "mariscal-d7ebc.firebaseapp.com",
  projectId: "mariscal-d7ebc",
  storageBucket: "mariscal-d7ebc.firebasestorage.app",
  messagingSenderId: "66383478521",
  appId: "1:66383478521:web:e55282b3e8c100e5122c28",
  measurementId: "G-B0E5ZL3P7F"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportamos la Base de datos
export const db = getFirestore(app);

// LÍNEAS NUEVAS: Exportamos la herramienta de Auth para usarla en App.jsx
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();