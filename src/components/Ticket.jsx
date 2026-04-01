export default function Ticket({ pedidoActual }) {
  if (!pedidoActual) {
    return (
      <div style={{ border: "3px solid #ff9800", padding: "15px", borderRadius: "15px", backgroundColor: "#fff3e0", minWidth: "200px" }}>
        <h2>🎟️ Ticket</h2>
        <p>Esperando...</p>
      </div>
    );
  }

  // Función matemática para contar cuántos ingredientes repetidos hay y agruparlos
  const agrupar = (ingredientes) => {
    const conteo = {};
    ingredientes.forEach(ing => {
      conteo[ing] = (conteo[ing] || 0) + 1;
    });
    // Transforma { '🦐 Camarón': 2, '🍋 Limón': 1 } en "2x 🦐 Camarón, 1x 🍋 Limón"
    return Object.entries(conteo).map(([ing, cant]) => `x${cant} ${ing}`).join(', ');
  };

  return (
    <div style={{ border: "3px solid #ff9800", padding: "15px", borderRadius: "15px", backgroundColor: "#fff3e0", minWidth: "200px" }}>
      <h2>🎟️ Ticket</h2>
      
      <h3>🥟 Empanada:</h3>
      <p><b>Izquierda:</b><br/> {agrupar(pedidoActual.izquierda)}</p>
      <p><b>Derecha:</b><br/> {agrupar(pedidoActual.derecha)}</p>

      <h3>🥤 Bebida:</h3>
      <p>{pedidoActual.bebida}</p>
    </div>
  );
}