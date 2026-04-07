export default function Ticket({ pedidoActual }) {
  if (!pedidoActual) {
    return (
      <div style={{ border: "2px solid #f39c12", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#fffdf8", textAlign: "center", color: "#888", fontSize: "0.85rem" }}>
        🎟️ Esperando cliente...
      </div>
    );
  }

  return (
    <div style={{ border: "2px solid #f39c12", borderRadius: "8px", backgroundColor: "#fffdf8", display: "flex", alignItems: "stretch", overflow: "hidden" }}>

      {/* Icono ticket */}
      <div style={{ backgroundColor: "#f39c12", padding: "0 7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: "1rem" }}>🎟️</span>
      </div>

      {/* Lado izquierdo */}
      <div style={{ flex: 1, padding: "5px 6px", borderRight: "1px dashed #f39c12", textAlign: "center" }}>
        <div style={{ fontSize: "0.6rem", color: "#e67e22", fontWeight: "bold", marginBottom: "2px", textTransform: "uppercase" }}>⬅️ Izq</div>
        <div style={{ fontSize: "1.35rem", lineHeight: "1.1", letterSpacing: "-0.05em" }}>
          {pedidoActual.izquierda.map((ing, i) => <span key={i}>{ing.split(' ')[0]}</span>)}
        </div>
      </div>

      {/* Lado derecho */}
      <div style={{ flex: 1, padding: "5px 6px", borderRight: pedidoActual.bebida ? "1px dashed #f39c12" : "none", textAlign: "center" }}>
        <div style={{ fontSize: "0.6rem", color: "#e67e22", fontWeight: "bold", marginBottom: "2px", textTransform: "uppercase" }}>Der ➡️</div>
        <div style={{ fontSize: "1.35rem", lineHeight: "1.1", letterSpacing: "-0.05em" }}>
          {pedidoActual.derecha.map((ing, i) => <span key={i}>{ing.split(' ')[0]}</span>)}
        </div>
      </div>

      {/* Bebida */}
      <div style={{ flex: "0 0 auto", minWidth: "52px", padding: "5px 6px", backgroundColor: pedidoActual.bebida ? "#e9f7ef" : "#f5f5f5", textAlign: "center" }}>
        <div style={{ fontSize: "0.6rem", color: pedidoActual.bebida ? "#27ae60" : "#aaa", fontWeight: "bold", marginBottom: "2px", textTransform: "uppercase" }}>🥤 Beb</div>
        {pedidoActual.bebida
          ? <div style={{ fontSize: "1.35rem", lineHeight: "1.1" }}>{pedidoActual.bebida.split(' ')[0]}</div>
          : <div style={{ fontSize: "0.65rem", color: "#aaa", lineHeight: "1.5" }}>Ninguna</div>
        }
      </div>

    </div>
  );
}
