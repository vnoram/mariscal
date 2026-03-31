export default function Ticket({ pedidoActual }) {
  if (!pedidoActual) {
    return (
      <div style={{ border: "3px solid #ff9800", padding: "15px", borderRadius: "15px", backgroundColor: "#fff3e0", minWidth: "200px" }}>
        <h2>🎟️ Ticket</h2>
        <p>Esperando...</p>
      </div>
    );
  }

  return (
    <div style={{ border: "3px solid #ff9800", padding: "15px", borderRadius: "15px", backgroundColor: "#fff3e0", minWidth: "200px" }}>
      <h2>🎟️ Ticket</h2>
      
      <h3>🥟 Empanada:</h3>
      <p><b>Izquierda:</b> {pedidoActual.izquierda.join(', ')}</p>
      <p><b>Derecha:</b> {pedidoActual.derecha.join(', ')}</p>

      <h3>🥤 Para beber:</h3>
      <p>{pedidoActual.bebida}</p>
    </div>
  );
}