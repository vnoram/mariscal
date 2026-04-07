export default function Ticket({ pedidoActual }) {
  if (!pedidoActual) {
    return (
      <div style={{ border: "3px solid #ff9800", padding: "15px", borderRadius: "15px", backgroundColor: "#fffdf8", minWidth: "220px", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 10px 0", color: "#d35400" }}>🎟️ Ticket</h2>
        <p style={{ margin: 0, color: "#888", fontWeight: "bold" }}>Esperando cliente...</p>
      </div>
    );
  }

  // Ahora agrupar devuelve elementos visuales compactos en vez de texto plano
  const agrupar = (ingredientes) => {
    const conteo = {};
    ingredientes.forEach(ing => {
      conteo[ing] = (conteo[ing] || 0) + 1;
    });
    
    return Object.entries(conteo).map(([ing, cant], index) => (
      <div key={index} style={{ fontSize: '1rem', fontWeight: 'bold', color: '#444', lineHeight: '1.3' }}>
        <span style={{ color: '#d35400' }}>{cant}x</span> {ing.split(' ')[0]} {/* Muestra "1x 🌿" */}
      </div>
    ));
  };

  return (
    <div style={{ 
      border: "4px solid #f39c12", 
      padding: "12px", 
      borderRadius: "15px", 
      backgroundColor: "#fffdf8", 
      minWidth: "220px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      
      {/* CABECERA DEL TICKET */}
      <h2 style={{ margin: "0", textAlign: "center", color: "#d35400", fontSize: "1.4rem", borderBottom: "2px dashed #f39c12", paddingBottom: "8px" }}>
        🎟️ Pedido
      </h2>

      {/* MITAD Y MITAD (COLUMNAS LADO A LADO) */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
        
        {/* Lado Izquierdo */}
        <div style={{ flex: 1, backgroundColor: "#fbeee6", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "#e67e22", fontWeight: "bold", marginBottom: "5px", textTransform: "uppercase" }}>⬅️ Izq</div>
          {agrupar(pedidoActual.izquierda)}
        </div>

        {/* Lado Derecho */}
        <div style={{ flex: 1, backgroundColor: "#fbeee6", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "#e67e22", fontWeight: "bold", marginBottom: "5px", textTransform: "uppercase" }}>Der ➡️</div>
          {agrupar(pedidoActual.derecha)}
        </div>

      </div>

      {/* BEBIDA (UNA SOLA FILA COMPACTA) */}
      <div style={{ backgroundColor: "#e9f7ef", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.9rem", color: "#27ae60", fontWeight: "bold" }}>🥤 Bebida:</span>
        <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#333" }}>
          {pedidoActual.bebida ? pedidoActual.bebida : "Ninguna"}
        </span>
      </div>

    </div>
  );
}