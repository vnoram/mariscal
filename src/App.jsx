import { useState, useEffect } from "react";
import Ticket from "./components/Ticket";
import Inventario from "./components/Inventario";
import Empanada from "./components/Empanada";
import Controles from "./components/Controles";

// FIREBASE (Solo Base de Datos, sin Auth)
import { db } from "./lib/firebase"; 
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];
const inventarioEspecial = ['🧀 Queso', '🌶️ Ají', '🧅 Cebolla']; 
const inventarioBebidas = ['🥤 Coca-Cola', '🥤 Pepsi', '🍷 Vino']; 

export default function App() {

  const [empanada, setEmpanada] = useState({ izquierda: [], derecha: [] });
  const [bebidaPlato, setBebidaPlato] = useState(null); 
  const [pedidoActual, setPedidoActual] = useState(null);
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!");
  
  const [contador, setContador] = useState(15); 
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // ESTADOS PARA EL RANKING
  const [nombreJugador, setNombreJugador] = useState("");
  const [puntajeGuardado, setPuntajeGuardado] = useState(false);
  const [rankingTop, setRankingTop] = useState([]); 

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
    if (juegoTerminado) return; 
    const timer = setInterval(() => setContador((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [juegoTerminado]);

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
    if (!nombreJugador.trim()) return; 
    try {
      await addDoc(collection(db, "ranking"), {
        nombre: nombreJugador,
        puntos: puntos,
        fecha: new Date().toISOString()
      });
      setPuntajeGuardado(true);
      setMensaje("✅ ¡Puntaje guardado en la nube!");
      cargarRanking(); // Recarga la tabla para que el jugador vea su récord
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
    setNombreJugador(""); 
    setPuntajeGuardado(false); 
    generarPedido(0);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '10px', backgroundColor: '#fdf2e9', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#d35400', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', margin: '0' }}>🌊 Mariscales 🦑</h1>
        <p style={{ fontWeight: 'bold', color: '#2980b9', fontSize: '1.2rem' }}>{mensaje}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: "1.2rem", marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: "#f39c12", fontWeight: 'bold' }}>⭐ Puntos: {puntos}</span>
          <span style={{ color: "#c0392b", fontWeight: 'bold' }}>⏳ Tiempo: {contador}s</span>
          <span style={{ color: "#e74c3c", fontWeight: 'bold' }}>❤️ Vidas: {"❤️".repeat(vidas > 0 ? vidas : 0)}</span>
        </div>

        {/* PANTALLA DE GAME OVER CON RANKING MANUAL */}
        {juegoTerminado && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '15px', border: '3px solid #e74c3c', display: 'inline-block', minWidth: '300px' }}>
            
            {!puntajeGuardado ? (
              <div style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                <p style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>Ingresa tu nombre para el Ranking:</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Tu nombre..." 
                    value={nombreJugador}
                    onChange={(e) => setNombreJugador(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem', flex: 1 }}
                  />
                  <button onClick={guardarPuntaje} style={{ padding: '10px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    💾 Guardar
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#27ae60', fontWeight: 'bold', marginBottom: '15px', fontSize: '1.2rem' }}>¡Récord registrado con éxito!</p>
            )}

            {/* TABLA DE TOP 5 JUGADORES */}
            {rankingTop.length > 0 && (
              <div style={{ textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#f39c12', textAlign: 'center' }}>🏆 Top 5 Mejores Jugadores</h3>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {rankingTop.map((jugador, index) => (
                    <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                      <span><strong>#{index + 1}</strong> {jugador.nombre}</span>
                      <span style={{ fontWeight: 'bold', color: '#27ae60' }}>{jugador.puntos} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button onClick={reiniciarJuego} style={{ padding: '12px 25px', fontSize: '1.2rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'block', margin: '0 auto', width: '100%' }}>
              🔄 Volver a jugar
            </button>
          </div>
        )}
      </header>

      {/* Solo mostramos el juego si tienes vidas (Si no, mostramos solo la caja de Game Over) */}
      {!juegoTerminado && (
        <main style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <Ticket pedidoActual={pedidoActual} />

          <div style={{ flex: '2 1 400px', border: '3px solid #ff9800', padding: '15px', borderRadius: '15px', backgroundColor: '#fff3e0' }}>
            <h2>🍲 Mesón de Preparación</h2>
            
            <Inventario inventario={inventario} inventarioEspecial={inventarioEspecial} inventarioBebidas={inventarioBebidas} />

            <Empanada 
              empanada={empanada} 
              agregarIngrediente={agregarIngrediente} 
              bebidaPlato={bebidaPlato} 
              agregarBebida={agregarBebida} 
            />

            <Controles 
              limpiar={() => { setEmpanada({ izquierda: [], derecha: [] }); setBebidaPlato(null); }} 
              entregar={entregarPedido} 
            />
          </div>
        </main>
      )}
    </div>
  );
}