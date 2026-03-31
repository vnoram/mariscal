import { useState, useEffect } from "react";
import Ticket from "./components/Ticket";
import Inventario from "./components/Inventario";
import Paila from "./components/Paila";
import Controles from "./components/Controles";

const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];

export default function App() {
  const [paila, setPaila] = useState([]);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!");
  const [contador, setContador] = useState(10);

  const generarPedido = () => {
    const nuevoPedido = Array.from({ length: 3 }, () =>
      inventario[Math.floor(Math.random() * inventario.length)]
    ).sort();

    setPedidoActual(nuevoPedido);
    setPaila([]);
    setMensaje("¡Cliente nuevo en la mesa!");
  };

  // 🔥 Contador que baja cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setContador((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔥 Cuando el contador llega a 0 → nuevo cliente
  useEffect(() => {
    if (contador <= 0) {
      generarPedido();
      setContador(10); // reiniciar
    }
  }, [contador]);

  const agregarIngrediente = (item) =>
    paila.length < 6 && setPaila([...paila, item]);

  const entregarPedido = () => {
    if (!pedidoActual) return setMensaje("No hay clientes.");

    const esCorrecto =
      JSON.stringify([...paila].sort()) === JSON.stringify(pedidoActual);

    setMensaje(esCorrecto ? "⭐⭐⭐⭐⭐ ¡Perfect!" : "❌ Pedido incorrecto...");

    if (esCorrecto) setPedidoActual(null);
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
          🌊 Mariscal🦀
        </h1>
        <p style={{ fontWeight: 'bold', color: '#2980b9' }}>{mensaje}</p>
        <p style={{ fontSize: "1.2rem", color: "#c0392b" }}>
          ⏳ Nuevo cliente en: {contador}s
        </p>
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
          <h2>🍲 Mesón</h2>

          <Inventario inventario={inventario} agregarIngrediente={agregarIngrediente} />

          <Paila paila={paila} />

          <Controles limpiar={() => setPaila([])} entregar={entregarPedido} />
        </div>
      </main>
    </div>
  );
}