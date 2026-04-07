import { useState, useEffect } from "react";
import Ticket from "./components/Ticket";
import Inventario from "./components/Inventario";
import Empanada from "./components/Empanada";
import Controles from "./components/Controles";

// FIREBASE
import { db, auth } from "./lib/firebase"; 
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];
const inventarioEspecial = ['🧀 Queso', '🌶️ Ají', '🧅 Cebolla']; 
const inventarioBebidas = ['🥤 Coca-Cola', '🥤 Pepsi', '🍷 Vino']; 

export default function App() {

  const [usuario, setUsuario] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [modoRegistro, setModoRegistro] = useState(false);
  
  const [authNombre, setAuthNombre] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [empanada, setEmpanada] = useState({ izquierda: [], derecha: [] });
  const [bebidaPlato, setBebidaPlato] = useState(null); 
  const [pedidoActual, setPedidoActual] = useState(null);
  const [mensaje, setMensaje] = useState("¡Abre el local!");
  
  const [contador, setContador] = useState(15); 
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const [puntajeGuardado, setPuntajeGuardado] = useState(false);
  const [rankingTop, setRankingTop] = useState([]); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargandoAuth(false);
      if (user && !juegoTerminado && puntos === 0 && vidas === 3 && !pedidoActual) {
        generarPedido(0);
      }
    });
    return () => unsubscribe();
  }, [juegoTerminado, puntos, vidas, pedidoActual]);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (error) {
      setAuthError("Correo o contraseña incorrectos.");
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!authNombre.trim()) return setAuthError("El nombre es obligatorio.");
    if (authPassword.length < 6) return setAuthError("La contraseña debe tener al menos 6 letras.");
    
    try {
      const credenciales = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(credenciales.user, { displayName: authNombre });
      setUsuario({ ...credenciales.user, displayName: authNombre });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
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

  const generarPedido = (puntosActuales = puntos) => {
    let minIng = 1, maxIng = 1;
    let probBebida = 0.5; 
    let usaEspeciales = false;

    if (puntosActuales <= 5) {
      minIng = 1; maxIng = 1; probBebida = 0.5; 
    } else if (puntosActuales <= 12) {
      minIng = 1; maxIng = 2; probBebida = 0.5; 
    } else if (puntosActuales <= 20) {
      minIng = 2; maxIng = 2; probBebida = 1.0; 
    } else if (puntosActuales <= 30) {
      minIng = 2; maxIng = 3; probBebida = 1.0; usaEspeciales = true; 
    } else {
      minIng = 3; maxIng = 3; probBebida = 1.0; usaEspeciales = true; 
    }

    const ingredientesDisponibles = usaEspeciales ? [...inventario, ...inventarioEspecial] : inventario;

    const generarLado = () => {
      const cantidad = Math.floor(Math.random() * (maxIng - minIng + 1)) + minIng;
      const lado = [];
      for (let i = 0; i < cantidad; i++) {
        lado.push(ingredientesDisponibles[Math.floor(Math.random() * ingredientesDisponibles.length)]);
      }
      return lado;
    };

    const pideBebida = Math.random() < probBebida;

    const nuevoPedido = {
      izquierda: generarLado(),
      derecha: generarLado(),
      bebida: pideBebida ? inventarioBebidas[Math.floor(Math.random() * inventarioBebidas.length)] : null
    };

    setPedidoActual(nuevoPedido);
    setEmpanada({ izquierda: [], derecha: [] });
    setBebidaPlato(null); 
    
    const nivelActual = puntosActuales <= 5 ? 1 : puntosActuales <= 12 ? 2 : puntosActuales <= 20 ? 3 : puntosActuales <= 30 ? 4 : 5;
    setMensaje(`¡Nivel ${nivelActual}!`);
  };

  useEffect(() => {
    if (juegoTerminado || !usuario) return; 
    const timer = setInterval(() => setContador((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [juegoTerminado, usuario]);

  useEffect(() => {
    if (contador === 0 && !juegoTerminado) {
      setVidas((v) => v - 1);
      setMensaje("⏳ ¡Tiempo agotado!");
      generarPedido(puntos); 
      setContador(15); 
    }
  }, [contador, juegoTerminado]);

  const cargarRanking = async () => {
    try {
      const q = query(collection(db, "ranking"), orderBy("puntos", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());
      setRankingTop(data);
    } catch (error) {
      console.error("Error al cargar ranking:", error);
    }
  };

  useEffect(() => {
    if (vidas <= 0 && !juegoTerminado) {
      setJuegoTerminado(true);
      setMensaje(`💀 Game Over`); 
      cargarRanking(); 
    }
  }, [vidas, puntos, juegoTerminado]); 

  const agregarIngrediente = (item, lado) => {
    if (juegoTerminado) return;
    setEmpanada(prev => ({ ...prev, [lado]: [...prev[lado], item] }));
  };

  const agregarBebida = (item) => {
    if (juegoTerminado) return;
    setBebidaPlato(item);
  };

  const entregarPedido = () => {
    if (juegoTerminado || !pedidoActual) return setMensaje("No hay clientes.");

    const esCorrecto =
      JSON.stringify(empanada.izquierda.sort()) === JSON.stringify(pedidoActual.izquierda.sort()) &&
      JSON.stringify(empanada.derecha.sort()) === JSON.stringify(pedidoActual.derecha.sort()) &&
      bebidaPlato === pedidoActual.bebida; 

    if (esCorrecto) {
        const nuevosPuntos = puntos + 1;
        setPuntos(nuevosPuntos); 
        setMensaje("⭐⭐⭐⭐⭐ ¡Perfecto!");
        setPedidoActual(null);
        setEmpanada({ izquierda: [], derecha: [] });
        setBebidaPlato(null); 
        setContador(15); 
        setTimeout(() => generarPedido(nuevosPuntos), 1500); 
    } else {
        setVidas((v) => v - 1);
        setMensaje("❌ Pedido incorrecto");
    }
  };

  const guardarPuntaje = async () => {
    if (!usuario) return; 
    try {
      await addDoc(collection(db, "ranking"), {
        nombre: usuario.displayName || "Cocinero Anónimo", 
        puntos: puntos,
        fecha: new Date().toISOString()
      });
      setPuntajeGuardado(true);
      setMensaje("✅ ¡Guardado!");
      cargarRanking(); 
    } catch (error) {
      console.error("Error al guardar: ", error);
      setMensaje("❌ Error");
    }
  };

  const reiniciarJuego = () => {
    setVidas(3);
    setContador(15);
    setPuntos(0);
    setJuegoTerminado(false);
    setBebidaPlato(null); 
    setPuntajeGuardado(false); 
    generarPedido(0);
  };

  if (cargandoAuth) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}><h2>Cargando...</h2></div>;
  }

  if (!usuario) {
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111', padding: '20px' }}>
        <h1 style={{ color: '#f39c12', fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>🌊 Mariscales 🦑</h1>
        <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '15px', width: '100%', maxWidth: '350px' }}>
          <form onSubmit={modoRegistro ? manejarRegistro : manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {modoRegistro && <input type="text" placeholder="Tu Nombre" value={authNombre} onChange={(e) => setAuthNombre(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }} required />}
            <input type="email" placeholder="Correo electrónico" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }} required />
            <input type="password" placeholder="Contraseña" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }} required />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              {modoRegistro ? "Registrarse y Jugar" : "Entrar a la Cocina"}
            </button>
          </form>
          <button onClick={() => { setModoRegistro(!modoRegistro); setAuthError(""); }} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', marginTop: '15px', width: '100%' }}>
            {modoRegistro ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#1a120b', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* ENCABEZADO ULTRA COMPACTO PARA MÓVIL */}
      <header style={{ backgroundColor: '#0f0f0f', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', zIndex: 10, height: '12vh', minHeight: '40px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ color: '#f39c12', margin: 0, fontSize: '1rem' }}>🌊🦑</h1>
          <span style={{ color: '#fff', fontSize: '0.8rem', backgroundColor: '#333', padding: '2px 6px', borderRadius: '5px' }}>{mensaje}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', fontSize: "0.9rem", backgroundColor: '#222', padding: '4px 8px', borderRadius: '5px', border: '1px solid #444' }}>
          <span style={{ color: "#f1c40f", fontWeight: 'bold' }}>⭐ {puntos}</span>
          <span style={{ color: "#e74c3c", fontWeight: 'bold' }}>⏳ {contador}s</span>
          <span style={{ color: "#ff7675", fontWeight: 'bold' }}>{"❤️".repeat(vidas > 0 ? vidas : 0)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', color: '#ccc', fontSize: '0.8rem' }}>{usuario.displayName || usuario.email.split('@')[0]}</span>
          <button onClick={cerrarSesion} style={{ padding: '4px 8px', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem' }}>Salir</button>
        </div>
      </header>

      {/* ESTACIÓN ARCADE - ESTRICTAMENTE HORIZONTAL Y BLOQUEADA */}
      <main style={{ 
        flex: 1, 
        height: '88vh', /* Ocupa exactamente el resto de la pantalla */
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'nowrap', /* EVITA QUE SE APILEN VERTICALMENTE */
        backgroundColor: '#3e2723', 
        position: 'relative'
      }}>
        
        {juegoTerminado ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100 }}>
            <div style={{ backgroundColor: '#ecf0f1', padding: '20px', borderRadius: '15px', border: '4px solid #e74c3c', width: '80%', maxWidth: '400px', textAlign: 'center' }}>
              <h2 style={{ color: '#c0392b', marginTop: 0 }}>Game Over</h2>
              <p>Puntaje: {puntos} Pts</p>
              {!puntajeGuardado ? (
                <button onClick={guardarPuntaje} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: '10px' }}>💾 Guardar Récord</button>
              ) : (
                <p style={{ color: '#27ae60', fontWeight: 'bold' }}>✅ Guardado</p>
              )}
              <button onClick={reiniciarJuego} style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>🔄 Volver a Jugar</button>
            </div>
          </div>
        ) : (
          <>
            {/* COLUMNA 1: TICKET (25% de ancho) */}
            <div style={{ width: '25%', height: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRight: '2px solid #1f1209', padding: '5px', overflowY: 'auto' }}>
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                <Ticket pedidoActual={pedidoActual} />
              </div>
            </div>

            {/* COLUMNA 2: EMPANADA Y CONTROLS (50% de ancho) */}
            <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '5px', position: 'relative' }}>
              
              {/* Empanada escalada para que no se desborde */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.55)', transformOrigin: 'center center', width: '100%' }}>
                <Empanada 
                  empanada={empanada} 
                  agregarIngrediente={agregarIngrediente} 
                  bebidaPlato={bebidaPlato} 
                  agregarBebida={agregarBebida} 
                />
              </div>

              {/* Botones de acción */}
              <div style={{ width: '90%', paddingBottom: '10px', transform: 'scale(0.9)' }}>
                <Controles 
                  limpiar={() => { setEmpanada({ izquierda: [], derecha: [] }); setBebidaPlato(null); }} 
                  entregar={entregarPedido} 
                />
              </div>
            </div>

            {/* COLUMNA 3: INVENTARIO (25% de ancho) */}
            <div style={{ width: '25%', height: '100%', backgroundColor: '#2d1b11', borderLeft: '2px solid #1f1209', padding: '5px', overflowY: 'auto' }}>
               <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                 <Inventario inventario={inventario} inventarioEspecial={inventarioEspecial} inventarioBebidas={inventarioBebidas} />
               </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}