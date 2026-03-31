import { useState } from 'react';

export default function App() {
  const [paila, setPaila] = useState([]);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!");

  const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];

  // --- Lógica del juego (se mantiene igual) ---
  const generarPedido = () => {
    const nuevoPedido = [];
    for (let i = 0; i < 3; i++) {
      nuevoPedido.push(inventario[Math.floor(Math.random() * inventario.length)]);
    }
    setPedidoActual(nuevoPedido.sort());
    setPaila([]);
    setMensaje("¡Cliente nuevo en la mesa!");
  };

  const agregarIngrediente = (item) => paila.length < 6 && setPaila([...paila, item]);
  
  const entregarPedido = () => {
    if (!pedidoActual) return setMensaje("No hay clientes.");
    const esCorrecto = JSON.stringify([...paila].sort()) === JSON.stringify(pedidoActual);
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
        <h1 style={{ color: '#d35400', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>🌊 Mariscal🦀</h1>
        <p style={{ fontWeight: 'bold', color: '#2980b9' }}>{mensaje}</p>
      </header>

      {/* CONTENEDOR RESPONSIVO: flex-wrap es la clave aquí */}
      <main style={{ 
        display: 'flex', 
        flexWrap: 'wrap', // Si no cabe, se va para abajo
        gap: '15px', 
        justifyContent: 'center', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        
        {/* ESTACIÓN DE PEDIDOS: En celular ocupará el 100%, en PC el 30% */}
        <div style={{ 
          flex: '1 1 300px', // Crece, se achica y su base son 300px
          border: '3px dashed #ccc', 
          padding: '15px', 
          borderRadius: '15px', 
          backgroundColor: '#fff' 
        }}>
          <h2 style={{ fontSize: '1.2rem' }}>📝 Ticket</h2>
          {pedidoActual ? (
            <div style={{ borderLeft: '5px solid #27ae60', paddingLeft: '10px', margin: '10px 0' }}>
              {pedidoActual.map((item, i) => <div key={i} style={{fontSize: '1.2rem'}}>{item}</div>)}
            </div>
          ) : <p>Esperando...</p>}
          <button onClick={generarPedido} style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔔 Nuevo Cliente
          </button>
        </div>

        {/* ESTACIÓN DE COCINA: En celular ocupará el 100%, en PC el 60% */}
        <div style={{ 
          flex: '2 1 400px', 
          border: '3px solid #ff9800', 
          padding: '15px', 
          borderRadius: '15px', 
          backgroundColor: '#fff3e0' 
        }}>
          <h2 style={{ fontSize: '1.2rem' }}>🍲 Mesón</h2>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {inventario.map((item, i) => (
              <button key={i} onClick={() => agregarIngrediente(item)} style={{ flex: '1 1 auto', padding: '10px', fontSize: '1.1rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ddd' }}>
                {item}
              </button>
            ))}
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#8d6e63', 
            borderRadius: '15px', 
            color: 'white', 
            textAlign: 'center', 
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem'
          }}>
            {paila.length > 0 ? paila.join(' + ') : "Paila vacía"}
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button onClick={() => setPaila([])} style={{ flex: 1, padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px' }}>🗑️ Limpiar</button>
            <button onClick={entregarPedido} style={{ flex: 2, padding: '12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>🛎️ ¡Servir!</button>
          </div>
        </div>

      </main>
    </div>
  );
}