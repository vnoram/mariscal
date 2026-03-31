import { useState, useEffect } from "react";
import Ticket from "./components/Ticket";
import Inventario from "./components/Inventario";
import Empanada from "./components/Empanada";
import Controles from "./components/Controles";

const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];

export default function App() {

  // Estado de la empanada (dos lados)
  const [empanada, setEmpanada] = useState({
    izquierda: [],
    derecha: []
  });

  const [pedidoActual, setPedidoActual] = useState(null);
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!");
  const [contador, setContador] = useState(10);

  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);

  // Generar pedido mitad y mitad
  const generarPedido = () => {
    const nuevoPedido = {
      izquierda: [
        inventario[Math.floor(Math.random() * inventario.length)]
      ],
      derecha: [
        inventario[Math.floor(Math.random() * inventario.length)]
      ]
    };

    setPedidoActual(nuevoPedido);
    setEmpanada({ izquierda: [], derecha: [] });
    setMensaje("¡Cliente nuevo en la mesa!");
  };

  // Contador regresivo
  useEffect(() => {
  if (vidas <= 0) return; // detener todo si el juego terminó

  const timer = setInterval(() => {
    setContador((c) => Math.max(c - 1, 0)); // <-- evita negativos
  }, 1000);

  return () => clearInterval(timer);
}, [vidas]);

  // Cuando llega a 0 → nuevo cliente
  useEffect(() => {
  if (vidas <= 0) return;

  if (contador === 0) {

    // Si había pedido y no se entregó → perder vida
    if (pedidoActual) {
      setVidas(v => v - 1);
      setMensaje("⏳❌ Se acabó el tiempo, perdiste una vida");

      if (vidas - 1 <= 0) {
        setMensaje("💀 Game Over");
        setPedidoActual(null);
        setEmpanada({ izquierda: [], derecha: [] });
        return;
      }
    }

    // Nuevo cliente
    generarPedido();
    setContador(10);
  }
}, [contador]);

  // Agregar ingrediente arrastrado
  const agregarIngrediente = (item, lado) => {
    setEmpanada(prev => ({
      ...prev,
      [lado]: [...prev[lado], item]
    }));
  };

  // Entregar pedido
  const entregarPedido = () => {
  if (!pedidoActual) {
    setMensaje("No hay clientes.");
    return;
  }

  const esCorrecto =
    JSON.stringify(empanada.izquierda.sort()) === JSON.stringify(pedidoActual.izquierda.sort()) &&
    JSON.stringify(empanada.derecha.sort()) === JSON.stringify(pedidoActual.derecha.sort());

  if (esCorrecto) {
    setMensaje("⭐⭐⭐⭐⭐ ¡Perfect!");
    setPuntos(prev => prev + 1); // SUMA PUNTOS
    setPedidoActual(null);
    setEmpanada({ izquierda: [], derecha: [] });
  } else {
    setMensaje("❌ Pedido incorrecto...");
    setVidas(prev => prev - 1); // RESTA VIDA

    if (vidas - 1 <= 0) {
      setMensaje("💀 Game Over");
      setPedidoActual(null);
      setEmpanada({ izquierda: [], derecha: [] });
      return;
    }
  }
};

  return (
    <div style={{
      fontFamily: 'sans-serif',
      padding: '10px',
      backgroundColor: '#fdf2e9',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#d35400', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
          🌊 Mariscal🦑
        </h1>
        <p style={{ fontWeight: 'bold', color: '#2980b9' }}>{mensaje}</p>
        <p style={{ fontSize: "1.2rem", color: "#c0392b" }}>
          ⏳ Nuevo cliente en: {contador}s
        </p>
        <p style={{ fontSize: "1.2rem", color: "#27ae60" }}>
          ❤️ Vidas: {vidas} | ⭐ Puntos: {puntos}
        </p>
        {vidas <= 0 && (
  <button
    onClick={() => {
      setVidas(3);
      setPuntos(0);
      setMensaje("¡Nuevo juego iniciado!");
      setContador(10);
      generarPedido();
    }}
    style={{
      padding: "10px 20px",
      backgroundColor: "#27ae60",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      marginTop: "10px"
    }}
  >
    🔄 Reiniciar Juego
  </button>
)}
      </header>

      <main style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        justifyContent: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Ticket pedidoActual={pedidoActual} />

        <div style={{
          flex: '2 1 400px',
          border: '3px solid #ff9800',
          padding: '15px',
          borderRadius: '15px',
          backgroundColor: '#fff3e0'
        }}>
          <h2>🥟 Empanada</h2>

          <Inventario inventario={inventario} />

          <Empanada empanada={empanada} agregarIngrediente={agregarIngrediente} />

          <Controles limpiar={() => setEmpanada({ izquierda: [], derecha: [] })} entregar={entregarPedido} />
        </div>
      </main>
    </div>
  );
}