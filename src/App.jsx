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
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!");
  
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
    if (authPassword.length < 6) return setAuthError("La contraseña debe tener al menos 6 letras/números.");
    
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
    setMensaje(`¡Nivel ${nivelActual}! Cliente esperando.`);
  };

  useEffect(() => {
    if (juegoTerminado || !usuario) return; 
    const timer = setInterval(() => setContador((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [juegoTerminado, usuario]);

  useEffect(() => {
    if (contador === 0 && !juegoTerminado) {
      setVidas((v) => v - 1);
      setMensaje("⏳ ¡Tiempo agotado! Perdiste una vida.");
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
      setMensaje(`💀 Game Over. Lograste: ${puntos} Pts.`); 
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
        setMensaje("⭐⭐⭐⭐⭐ ¡Perfecto! +1 Punto");
        setPedidoActual(null);
        setEmpanada({ izquierda: [], derecha: [] });
        setBebidaPlato(null); 
        setContador(15); 
        setTimeout(() => generarPedido(nuevosPuntos), 1500); 
    } else {
        setVidas((v) => v - 1);
        setMensaje("❌ Pedido incorrecto... Perdiste una vida.");
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
      setMensaje("✅ ¡Puntaje guardado en la nube!");
      cargarRanking(); 
    } catch (error) {
      console.error("Error al guardar: ", error);
      setMensaje("❌ Hubo un error al conectar con Firebase.");
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
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#2c3e50', color: 'white' }}><h2>Cargando estación...</h2></div>;
  }

  if (!usuario) {
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#2c3e50', padding: '20px' }}>
        <h1 style={{ color: '#f39c12', fontSize: '3.5rem', marginBottom: '10px', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>🌊 Mariscales 🦑</h1>
        
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#2c3e50', marginTop: '0' }}>
            {modoRegistro ? "Crear Nueva Cuenta" : "Iniciar Sesión"}
          </h2>
          
          {authError && <p style={{ color: '#e74c3c', backgroundColor: '#fadbd8', padding: '10px', borderRadius: '5px', textAlign: 'center', fontWeight: 'bold' }}>{authError}</p>}

          <form onSubmit={modoRegistro ? manejarRegistro : manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {modoRegistro && (
              <input 
                type="text" placeholder="Tu Nombre (Para el Ranking)" value={authNombre} onChange={(e) => setAuthNombre(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }} required 
              />
            )}
            <input 
              type="email" placeholder="Correo electrónico" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }} required 
            />
            <input 
              type="password" placeholder="Contraseña (mínimo 6 caracteres)" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }} required 
            />
            <button type="submit" style={{ padding: '15px', fontSize: '1.2rem', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 0 #d35400' }}>
              {modoRegistro ? "Registrarse y Jugar" : "Entrar a la Cocina"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => { setModoRegistro(!modoRegistro); setAuthError(""); }} style={{ background: 'none', border: 'none', color: '#3498db', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>
              {modoRegistro ? "¿Ya tienes cuenta? Inicia sesión aquí" : "¿No tienes cuenta? Regístrate aquí"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#1a252f', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* BARRA SUPERIOR OSCURA (Estilo UI de videojuego) */}
      <header style={{ backgroundColor: '#2c3e50', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ color: '#f39c12', margin: 0, fontSize: '1.8rem', textShadow: '1px 1px 2px black' }}>🌊 Mariscales 🦑</h1>
          <span style={{ color: '#ecf0f1', fontSize: '1.2rem', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.3)', padding: '5px 15px', borderRadius: '20px' }}>{mensaje}</span>
        </div>
        
        {/* Marcadores integrados a la barra */}
        <div style={{ display: 'flex', gap: '20px', fontSize: "1.2rem", backgroundColor: '#34495e', padding: '8px 20px', borderRadius: '10px', border: '2px solid #2c3e50' }}>
          <span style={{ color: "#f1c40f", fontWeight: 'bold' }}>⭐ {puntos}</span>
          <span style={{ color: "#e74c3c", fontWeight: 'bold' }}>⏳ {contador}s</span>
          <span style={{ color: "#ff7675", fontWeight: 'bold', letterSpacing: '2px' }}>{"❤️".repeat(vidas > 0 ? vidas : 0)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: 'bold', color: '#ecf0f1' }}>{usuario.displayName || usuario.email}</span>
          <button onClick={cerrarSesion} style={{ padding: '6px 15px', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
        </div>
      </header>

      {/* ESTACIÓN DE TRABAJO (Diseño Papa's Pizzeria / Arcade) */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        backgroundColor: '#d39e66', /* Color de madera clara */
        backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px', /* Simula tablones de madera */
        borderTop: '8px solid #8b5a2b',
        boxShadow: 'inset 0 20px 30px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {juegoTerminado ? (
          // PANTALLA DE GAME OVER 
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ backgroundColor: '#ecf0f1', padding: '30px', borderRadius: '15px', border: '5px solid #e74c3c', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
              <h2 style={{ color: '#c0392b', fontSize: '2.5rem', marginTop: 0 }}>¡Estás Despedido!</h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Tu puntaje final: {puntos} Pts.</p>
              
              {!puntajeGuardado ? (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#bdc3c7', borderRadius: '10px' }}>
                  <button onClick={guardarPuntaje} style={{ padding: '15px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 0 #2980b9', width: '100%' }}>
                    💾 Subir Récord a la Nube
                  </button>
                </div>
              ) : (
                <p style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem', backgroundColor: '#e8f8f5', padding: '10px', borderRadius: '5px' }}>✅ ¡Récord registrado con éxito!</p>
              )}

              {rankingTop.length > 0 && (
                <div style={{ textAlign: 'left', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '2px solid #bdc3c7' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#f39c12', textAlign: 'center' }}>🏆 Salón de la Fama</h3>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {rankingTop.map((jugador, index) => (
                      <li key={index} style={{ padding: '8px 10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', backgroundColor: index === 0 ? '#fff9e6' : 'transparent' }}>
                        <span><strong>#{index + 1}</strong> {jugador.nombre}</span>
                        <span style={{ fontWeight: 'bold', color: '#27ae60' }}>{jugador.puntos} pts</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button onClick={reiniciarJuego} style={{ padding: '15px', fontSize: '1.3rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 0 #27ae60' }}>
                🔄 Iniciar Nuevo Turno
              </button>
            </div>
          </div>
        ) : (
          // JUEGO ACTIVO (Diseño 3 Columnas Estilo Arcade)
          <>
            {/* ZONA 1: Cuerda de Pedidos (Izquierda) */}
            <div style={{ width: '25%', minWidth: '250px', backgroundColor: 'rgba(0,0,0,0.1)', borderRight: '4px solid #8b5a2b', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '5px 0 15px rgba(0,0,0,0.1)' }}>
              {/* Cuerda decorativa */}
              <div style={{ width: '100%', height: '4px', backgroundColor: '#7f8c8d', position: 'absolute', top: '30px', left: 0, zIndex: 0 }}></div>
              <div style={{ zIndex: 1, marginTop: '20px', width: '100%' }}>
                <Ticket pedidoActual={pedidoActual} />
              </div>
            </div>

            {/* ZONA 2: Mesón de Preparación (Centro) */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <Empanada 
                  empanada={empanada} 
                  agregarIngrediente={agregarIngrediente} 
                  bebidaPlato={bebidaPlato} 
                  agregarBebida={agregarBebida} 
                />
              </div>

              {/* Botones estilo consola de máquina */}
              <div style={{ width: '100%', backgroundColor: '#2c3e50', padding: '15px', borderRadius: '15px 15px 0 0', borderTop: '4px solid #34495e', display: 'flex', justifyContent: 'center' }}>
                <Controles 
                  limpiar={() => { setEmpanada({ izquierda: [], derecha: [] }); setBebidaPlato(null); }} 
                  entregar={entregarPedido} 
                />
              </div>
            </div>

            {/* ZONA 3: Bandejas de Ingredientes (Derecha) */}
            <div style={{ width: '30%', minWidth: '300px', backgroundColor: '#a67b5b', borderLeft: '4px solid #8b5a2b', padding: '20px', boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.2)', overflowY: 'auto' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '10px', border: '3px solid #8b5a2b' }}>
                <Inventario inventario={inventario} inventarioEspecial={inventarioEspecial} inventarioBebidas={inventarioBebidas} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}