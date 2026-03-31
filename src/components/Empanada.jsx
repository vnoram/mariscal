import styles from "../styles/Empanada.module.css";

export default function Empanada({ empanada, agregarIngrediente }) {
  return (
    <div className={styles.empanada}>
      
      {/* LADO IZQUIERDO */}
      <div
        className={styles.lado}
        onDragEnter={(e) => e.preventDefault()} // NUEVO
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault(); // NUEVO (Evita que el navegador bloquee la acción)
          const ingrediente = e.dataTransfer.getData("ingrediente");
          if (ingrediente) {
            agregarIngrediente(ingrediente, "izquierda");
          }
        }}
      >
        <h3>Izquierda</h3>
        {empanada.izquierda.map((i, idx) => (
          <div key={idx} className={styles.item}>{i}</div>
        ))}
      </div>

      {/* LADO DERECHO */}
      <div
        className={styles.lado}
        onDragEnter={(e) => e.preventDefault()} // NUEVO
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault(); // NUEVO
          const ingrediente = e.dataTransfer.getData("ingrediente");
          if (ingrediente) {
            agregarIngrediente(ingrediente, "derecha");
          }
        }}
      >
        <h3>Derecha</h3>
        {empanada.derecha.map((i, idx) => (
          <div key={idx} className={styles.item}>{i}</div>
        ))}
      </div>

    </div>
  );
}