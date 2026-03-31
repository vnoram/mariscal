import styles from "../styles/Ticket.module.css";
export default function Ticket({ pedidoActual, generarPedido }) {
  return (
    <div className={styles.ticket}>
      <h2>📝 Ticket</h2>

      {pedidoActual ? (
        <div style={{ borderLeft: '5px solid #27ae60', paddingLeft: '10px', margin: '10px 0' }}>
          {pedidoActual.map((item, i) => (
            <div key={i} style={{ fontSize: '1.2rem' }}>{item}</div>
          ))}
        </div>
      ) : (
        <p>Esperando...</p>
      )}

    </div>
  );
}