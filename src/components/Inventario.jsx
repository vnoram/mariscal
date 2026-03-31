import styles from "../styles/Inventario.module.css";

export default function Inventario({ inventario }) {
  return (
    <div className={styles.inventario}>
      <h3>Ingredientes</h3>

      <div className={styles.lista}>
        {inventario.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("ingrediente", item)}
            className={styles.ingrediente}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}