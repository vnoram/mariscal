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
// CAMBIO APLICADO: Reemplazo de Pepsi por Cerveza
const inventarioBebidas = ['🥤 Coca-Cola', '🍺 Cerveza', '🍷 Vino']; 

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
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#1a120b', height: '100svh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* HEADER COMPACTO */}
      <header style={{ backgroundColor: '#0f0f0f', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', flexShrink: 0, gap: '6px' }}>
        <span style={{ color: '#f39c12', fontSize: '1.3rem', flexShrink: 0 }}>🌊🦑</span>

        <span style={{ color: '#fff', fontSize: '0.75rem', backgroundColor: '#333', padding: '3px 7px', borderRadius: '5px', flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {mensaje}
        </span>

        <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', flexShrink: 0 }}>
          <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>⭐{puntos}</span>
          <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>⏳{contador}s</span>
          <span>{"❤️".repeat(vidas > 0 ? vidas : 0)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <span style={{ color: '#aaa', fontSize: '0.7rem', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario.displayName || usuario.email.split('@')[0]}
          </span>
          <button onClick={cerrarSesion} style={{ padding: '4px 8px', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', flexShrink: 0 }}>✕</button>
        </div>
      </header>

      {/* ÁREA DE JUEGO VERTICAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#3e2723', position: 'relative' }}>

        {juegoTerminado ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#ecf0f1', padding: '20px', borderRadius: '16px', border: '4px solid #e74c3c', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
              <h2 style={{ color: '#c0392b', marginTop: 0, fontSize: '1.6rem' }}>💀 Game Over</h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '12px' }}>
                Puntaje: <span style={{ color: '#c0392b', fontSize: '1.5rem' }}>{puntos}</span> Pts
              </p>
              {!puntajeGuardado ? (
                <button onClick={guardarPuntaje} style={{ padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: '8px', fontSize: '1rem' }}>💾 Guardar Récord</button>
              ) : (
                <p style={{ color: '#27ae60', fontWeight: 'bold', marginBottom: '8px' }}>✅ Récord Guardado</p>
              )}
              {rankingTop.length > 0 && (
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', marginBottom: '10px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#555', fontSize: '0.8rem', marginBottom: '6px', textAlign: 'center' }}>🏆 TOP 5</div>
                  {rankingTop.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', backgroundColor: i % 2 === 0 ? '#f8f8f8' : 'transparent', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <span>{i + 1}. {r.nombre}</span>
                      <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>{r.puntos} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={reiniciarJuego} style={{ padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1rem' }}>🔄 Volver a Jugar</button>
            </div>
          </div>
        ) : (
          <>
            {/* TICKET - tira horizontal en la parte superior */}
            <div style={{ flexShrink: 0, padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.25)', borderBottom: '1px solid #1f1209' }}>
              <Ticket pedidoActual={pedidoActual} />
            </div>

            {/* EMPANADA - ocupa el espacio restante */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', overflow: 'hidden' }}>
              <Empanada
                empanada={empanada}
                agregarIngrediente={agregarIngrediente}
                bebidaPlato={bebidaPlato}
                agregarBebida={agregarBebida}
              />
            </div>

            {/* CONTROLES */}
            <div style={{ flexShrink: 0, padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid #1f1209' }}>
              <Controles
                limpiar={() => { setEmpanada({ izquierda: [], derecha: [] }); setBebidaPlato(null); }}
                entregar={entregarPedido}
              />
            </div>

            {/* INVENTARIO - panel inferior */}
            <div style={{ flexShrink: 0, backgroundColor: '#2d1b11', borderTop: '2px solid #1f1209', padding: '6px 8px', maxHeight: '32vh', overflowY: 'auto' }}>
              <Inventario inventario={inventario} inventarioEspecial={inventarioEspecial} inventarioBebidas={inventarioBebidas} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}