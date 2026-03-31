import styles from "../styles/Inventario.module.css";
export default function Inventario({ inventario, agregarIngrediente }) {
  return (
    <div className={styles.inventario}>
      {inventario.map((item, i) => (
        <button
          key={i}
          onClick={() => agregarIngrediente(item)}
          style={{
            flex: '1 1 auto',
            padding: '10px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}