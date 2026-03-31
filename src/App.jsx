import { useState } from 'react';

export default function App() {
  // ==========================================
  // 1. LOS ESTADOS (La memoria del juego)
  // ==========================================
  const [paila, setPaila] = useState([]);
  const [pedidoActual, setPedidoActual] = useState(null); // Guardará lo que pide el cliente
  const [mensaje, setMensaje] = useState("¡Abre el local para recibir clientes!"); // Mensajes del sistema

  const inventario = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];

  // ==========================================
  // 2. LÓGICA DE NEGOCIO
  // ==========================================
  
  // Función para que llegue un cliente nuevo
  const generarPedido = () => {
    // Elegimos 3 ingredientes al azar de nuestro inventario
    const nuevoPedido = [];
    for (let i = 0; i < 3; i++) {
      const ingredienteAlAzar = inventario[Math.floor(Math.random() * inventario.length)];
      nuevoPedido.push(ingredienteAlAzar);
    }
    
    // Ordenamos alfabéticamente para que sea más fácil comparar después
    nuevoPedido.sort();
    
    setPedidoActual(nuevoPedido);
    setPaila([]); // Vaciamos la paila de la cocina para el nuevo pedido
    setMensaje("¡Cliente nuevo! Prepara su pedido rápido.");
  };

  const agregarIngrediente = (item) => {
    if (paila.length < 6) {
      setPaila([...paila, item]);
    }
  };

  const tirarALaBasura = () => {
    setPaila([]);
    setMensaje("Paila a la basura. ¡Empieza de nuevo!");
  };

  // ¡LA FUNCIÓN ESTRELLA! Compara la cocina con el ticket
  const entregarPedido = () => {
    if (!pedidoActual) {
      setMensaje("¡No hay ningún cliente esperando!");
      return;
    }

    // Ordenamos la paila actual para compararla exactamente con el pedido
    const pailaOrdenada = [...paila].sort();
    
    // Convertimos ambos arrays a texto para ver si son idénticos
    if (JSON.stringify(pailaOrdenada) === JSON.stringify(pedidoActual)) {
      setMensaje("⭐⭐⭐⭐⭐ ¡Perfecto! Al cliente le encantó. ¡Triunfé, mamá!");
      setPedidoActual(null); // El cliente se va feliz
    } else {
      setMensaje("❌ Te equivocaste en los ingredientes. ¡El cliente se fue enojado!");
    }
  };

  // ==========================================
  // 3. LA INTERFAZ VISUAL
  // ==========================================
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#d35400' }}>🌊 Mariscales texia :3 🦀</h1>
        <h3 style={{ color: '#2980b9' }}>{mensaje}</h3>
      </header>

      <main style={{ display: 'flex', gap: '20px', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* LADO IZQUIERDO: Estación de Pedidos */}
        <div style={{ border: '3px dashed #ccc', padding: '20px', width: '30%', borderRadius: '15px', backgroundColor: '#f9f9f9' }}>
          <h2>📝 Ticket del Cliente</h2>
          
          {pedidoActual ? (
            <div style={{ backgroundColor: 'white', padding: '15px', border: '1px solid #ddd', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
              <h3>Mesa 1 pide:</h3>
              <ul style={{ fontSize: '20px', lineHeight: '1.5' }}>
                {pedidoActual.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Esperando clientes...</p>
          )}

          <button onClick={generarPedido} style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
            🔔 Llamar a un Cliente
          </button>
        </div>

        {/* LADO DERECHO: Zona de Armado */}
        <div style={{ border: '3px solid #ff9800', padding: '20px', width: '70%', borderRadius: '15px', backgroundColor: '#fff3e0' }}>
          <h2>🍲 Mesón de Preparación</h2>
          
          {/* Botones de Ingredientes */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {inventario.map((item, index) => (
              <button 
                key={index} onClick={() => agregarIngrediente(item)}
                style={{ padding: '10px 15px', fontSize: '18px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white' }}
              >
                + {item}
              </button>
            ))}
          </div>

          {/* La Paila */}
          <div style={{ marginTop: '20px', padding: '40px', backgroundColor: '#8d6e63', borderRadius: '20px', border: '5px solid #5d4037', color: 'white', textAlign: 'center', minHeight: '100px' }}>
            {paila.length === 0 ? (
              <h3>Paila vacía</h3>
            ) : (
              <h2 style={{ fontSize: '30px', margin: 0 }}>{paila.join(' + ')}</h2>
            )}
          </div>

          {/* Botones de Acción Final */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={tirarALaBasura} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
              🗑️ Botar Paila
            </button>
            <button onClick={entregarPedido} style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
              🛎️ ¡Entregar Pedido!
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}