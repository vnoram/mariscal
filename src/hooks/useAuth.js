import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export function useAuth() {
  const [usuario, setUsuario]           = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [modoRegistro, setModoRegistro] = useState(false);

  const [authNombre,   setAuthNombre]   = useState("");
  const [authEmail,    setAuthEmail]    = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError,    setAuthError]    = useState("");

  // Escucha cambios de sesión de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargandoAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch {
      setAuthError("Correo o contraseña incorrectos.");
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!authNombre.trim())       return setAuthError("El nombre es obligatorio.");
    if (authPassword.length < 6)  return setAuthError("La contraseña debe tener al menos 6 letras.");
    try {
      const credenciales = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(credenciales.user, { displayName: authNombre });
      setUsuario({ ...credenciales.user, displayName: authNombre });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setAuthError("Este correo ya está registrado.");
      } else {
        setAuthError("Error al crear la cuenta.");
      }
    }
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    setUsuario(null);
    setAuthEmail("");
    setAuthPassword("");
  };

  return {
    // Estado
    usuario,
    cargandoAuth,
    modoRegistro,   setModoRegistro,
    authNombre,     setAuthNombre,
    authEmail,      setAuthEmail,
    authPassword,   setAuthPassword,
    authError,
    // Acciones
    manejarLogin,
    manejarRegistro,
    cerrarSesion,
  };
}
