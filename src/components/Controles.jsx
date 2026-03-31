import styles from "../styles/Controles.module.css";
export default function Controles({ limpiar, entregar }) {
  return (
    <div className={styles.controles}>
      <button
        onClick={limpiar}
        style={{
          flex: 1,
          padding: '12px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px'
        }}
      >
        🗑️ Limpiar
      </button>

      <button
        onClick={entregar}
        style={{
          flex: 2,
          padding: '12px',
          backgroundColor: '#f39c12',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}
      >
        🛎️ ¡Servir!
      </button>
    </div>
  );
}