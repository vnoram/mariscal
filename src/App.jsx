import { useState, useEffect } from "react";
import Ticket from "./components/Ticket";
import Inventario from "./components/Inventario";
import Empanada from "./components/Empanada";
import Controles from "./components/Controles";

const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];
const inventarioBebidas = ['🥤 Coca-Cola', '🥤 Pepsi', '🍷 Vino'];

export default function App() {
  const [empanada, setEmpanada] = useState({ izquierda: [], derecha: [] });
  const [bebidaPlato, setBebidaPlato] = useState(null); // Nuevo estado para el plato
  const [pedidoActual, setPedidoActual] = useState(null);
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!");
  const [contador, setContador] = useState(15);

  const generarPedido = () => {
    const nuevoPedido = {
      izquierda: [inventario[Math.floor(Math.random() * inventario.length)]],
      derecha: [inventario[Math.floor(Math.random() * inventario.length)]],
      bebida: inventarioBebidas[Math.floor(Math.random() * inventarioBebidas.length)] // El cliente pide bebida
    };
    setPedidoActual(nuevoPedido);
    setEmpanada({ izquierda: [], derecha: [] });
    setBebidaPlato(null); // Limpiamos el plato
    setMensaje("¡Cliente nuevo en la mesa!");
  };

  useEffect(() => {
    const timer = setInterval(() => setContador((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (contador <= 0) {
      generarPedido();
      setContador(15);
    }
  }, [contador]);

  const agregarIngrediente = (item, lado) => {
    setEmpanada(prev => ({ ...prev, [lado]: [...prev[lado], item] }));
  };

  // Función exclusiva para agregar al plato
  const agregarBebida = (item) => {
    setBebidaPlato(item);
  };

  const entregarPedido = () => {
    if (!pedidoActual) return setMensaje("No hay clientes.");

    const esCorrecto =
      JSON.stringify(empanada.izquierda.sort()) === JSON.stringify(pedidoActual.izquierda.sort()) &&
      JSON.stringify(empanada.derecha.sort()) === JSON.stringify(pedidoActual.derecha.sort()) &&
      bebidaPlato === pedidoActual.bebida; // Validamos que lleve la bebida correcta

    setMensaje(esCorrecto ? "⭐⭐⭐⭐⭐ ¡Perfecto! Al cliente le encantó." : "❌ Pedido incorrecto...");

    if (esCorrecto) {
      setPedidoActual(null);
      setEmpanada({ izquierda: [], derecha: [] });
      setBebidaPlato(null);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '10px', backgroundColor: '#fdf2e9', minHeight: '100vh', boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#d35400', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>🥟 Empanadas Mitad y Mitad</h1>
        <p style={{ fontWeight: 'bold', color: '#2980b9' }}>{mensaje}</p>
        <p style={{ fontSize: "1.2rem", color: "#c0392b" }}>⏳ Nuevo cliente en: {contador}s</p>
      </header>

      <main style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <Ticket pedidoActual={pedidoActual} />

        <div style={{ flex: '2 1 400px', border: '3px solid #ff9800', padding: '15px', borderRadius: '15px', backgroundColor: '#fff3e0' }}>
          <h2>🍲 Mesón de Preparación</h2>
          
          <Inventario inventario={inventario} inventarioBebidas={inventarioBebidas} />

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