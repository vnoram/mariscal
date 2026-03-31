export default function Ticket({ pedidoActual }) {
  if (!pedidoActual) {
    return (
      <div style={{
        border: "3px solid #ff9800",
        padding: "15px",
        borderRadius: "15px",
        backgroundColor: "#fff3e0",
        minWidth: "200px"
      }}>
        <h2>🎟️ Ticket</h2>
        <p>Esperando...</p>
      </div>
    );
  }

  return (
    <div style={{
      border: "3px solid #ff9800",
      padding: "15px",
      borderRadius: "15px",
      backgroundColor: "#fff3e0",
      minWidth: "200px"
    }}>
      <h2>🎟️ Ticket</h2>

      <h3>Izquierda:</h3>
      {pedidoActual.izquierda.map((i, idx) => (
        <p key={idx}>{i}</p>
      ))}

      <h3>Derecha:</h3>
      {pedidoActual.derecha.map((i, idx) => (
        <p key={idx}>{i}</p>
      ))}
    </div>
  );
}