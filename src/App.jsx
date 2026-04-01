import { useState, useEffect } from "react";
import Ticket from "./components/Ticket";
import Inventario from "./components/Inventario";
import Empanada from "./components/Empanada";
import Controles from "./components/Controles";

const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];
const inventarioEspecial = ['🧀 Queso', '🌶️ Ají', '🧅 Cebolla']; // NUEVO: Ingredientes Nivel 4 y 5
const inventarioBebidas = ['🥤 Coca-Cola', '🥤 Pepsi', '🍷 Vino']; 

export default function App() {

  const [empanada, setEmpanada] = useState({ izquierda: [], derecha: [] });
  const [bebidaPlato, setBebidaPlato] = useState(null); 
  const [pedidoActual, setPedidoActual] = useState(null);
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!");
  
  const [contador, setContador] = useState(15); // Respetando tus 15 segundos iniciales
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // LOGICA DE DIFICULTAD PROGRESIVA
  const generarPedido = (puntosActuales = puntos) => {
    let minIng = 1, maxIng = 1;
    let probBebida = 0.5; // 50% de probabilidad
    let usaEspeciales = false;

    // Evaluador de Niveles basado en tus puntos
    if (puntosActuales <= 5) {
      minIng = 1; maxIng = 1; probBebida = 0.5; // Nivel 1
    } else if (puntosActuales <= 12) {
      minIng = 1; maxIng = 2; probBebida = 0.5; // Nivel 2
    } else if (puntosActuales <= 20) {
      minIng = 2; maxIng = 2; probBebida = 1.0; // Nivel 3 (Bebida obligatoria)
    } else if (puntosActuales <= 30) {
      minIng = 2; maxIng = 3; probBebida = 1.0; usaEspeciales = true; // Nivel 4 (Especiales)
    } else {
      minIng = 3; maxIng = 3; probBebida = 1.0; usaEspeciales = true; // Nivel 5
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
    
    // Mensaje que te avisa en qué nivel estás
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
      generarPedido(puntos); // Mantiene la dificultad actual
      setContador(15); // Vuelve a 15s como tenías programado
    }
  }, [contador, juegoTerminado]);

  useEffect(() => {
    if (vidas <= 0 && !juegoTerminado) {
      setJuegoTerminado(true);
      setMensaje(`💀 Game Over. Te despidieron de la Picá. Lograste: ${puntos} Pts.`); 
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
        setTimeout(() => generarPedido(nuevosPuntos), 1500); // Avanza la dificultad
    } else {
        setVidas((v) => v - 1);
        setMensaje("❌ Pedido incorrecto... Perdiste una vida.");
    }
  };

  const reiniciarJuego = () => {
    setVidas(3);
    setContador(15);
    setPuntos(0);
    setJuegoTerminado(false);
    setBebidaPlato(null); 
    generarPedido(0);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '10px', backgroundColor: '#fdf2e9', minHeight: '100vh', boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#d35400', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>🌊 Mariscales 🦑</h1>
        <p style={{ fontWeight: 'bold', color: '#2980b9', fontSize: '1.2rem' }}>{mensaje}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: "1.2rem", marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: "#f39c12", fontWeight: 'bold' }}>⭐ Puntos: {puntos}</span>
          <span style={{ color: "#c0392b", fontWeight: 'bold' }}>⏳ Tiempo: {contador}s</span>
          <span style={{ color: "#e74c3c", fontWeight: 'bold' }}>❤️ Vidas: {"❤️".repeat(vidas > 0 ? vidas : 0)}</span>
        </div>

        {juegoTerminado && (
          <button onClick={reiniciarJuego} style={{ marginTop: '15px', padding: '10px 20px', fontSize: '1.1rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 Volver a jugar
          </button>
        )}
      </header>

      <main style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <Ticket pedidoActual={pedidoActual} />

        <div style={{ flex: '2 1 400px', border: '3px solid #ff9800', padding: '15px', borderRadius: '15px', backgroundColor: '#fff3e0', opacity: juegoTerminado ? 0.6 : 1, pointerEvents: juegoTerminado ? 'none' : 'auto' }}>
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
    </div>
  );
}