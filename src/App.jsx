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
    const timer = setInterval(() => {
      setContador((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cuando llega a 0 → nuevo cliente
  useEffect(() => {
    if (contador <= 0) {
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
    if (!pedidoActual) return setMensaje("No hay clientes.");

    const esCorrecto =
      JSON.stringify(empanada.izquierda.sort()) === JSON.stringify(pedidoActual.izquierda.sort()) &&
      JSON.stringify(empanada.derecha.sort()) === JSON.stringify(pedidoActual.derecha.sort());

    setMensaje(esCorrecto ? "⭐⭐⭐⭐⭐ ¡Perfect!" : "❌ Pedido incorrecto...");

    if (esCorrecto) {
      setPedidoActual(null);
      setEmpanada({ izquierda: [], derecha: [] });
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
          🥟 Empanadas Mitad y Mitad
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
          <h2>🥟 Empanada</h2>

          <Inventario inventario={inventario} />

          <Empanada empanada={empanada} agregarIngrediente={agregarIngrediente} />

          <Controles limpiar={() => setEmpanada({ izquierda: [], derecha: [] })} entregar={entregarPedido} />
        </div>
      </main>
    </div>
  );
}