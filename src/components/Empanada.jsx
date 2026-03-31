import styles from "../styles/Empanada.module.css";

export default function Empanada({ empanada, agregarIngrediente, bebidaPlato, agregarBebida }) {
  return (
    /* ZONA DROP 1: EL PLATO ENTERO (Solo acepta Bebidas) */
    <div
      className={styles.plato}
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const tipo = e.dataTransfer.getData("tipo");
        const item = e.dataTransfer.getData("item");
        if (tipo === "bebida") agregarBebida(item);
      }}
    >
      
      {/* Visualización de la bebida sobre el plato */}
      {bebidaPlato && (
        <div className={styles.bebidaVisual}>{bebidaPlato.split(' ')[0]}</div>
      )}

      {/* ZONA DROP 2 y 3: LA EMPANADA (Solo acepta Ingredientes) */}
      <div className={styles.empanada}>
        <div
          className={styles.lado}
          onDragEnter={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Evita que la caída se filtre al plato
            const tipo = e.dataTransfer.getData("tipo");
            const item = e.dataTransfer.getData("item");
            if (tipo === "ingrediente") agregarIngrediente(item, "izquierda");
          }}
        >
          <h3>Izq</h3>
          {empanada.izquierda.map((i, idx) => <div key={idx} className={styles.item}>{i.split(' ')[0]}</div>)}
        </div>

        <div
          className={styles.lado}
          onDragEnter={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const tipo = e.dataTransfer.getData("tipo");
            const item = e.dataTransfer.getData("item");
            if (tipo === "ingrediente") agregarIngrediente(item, "derecha");
          }}
        >
          <h3>Der</h3>
          {empanada.derecha.map((i, idx) => <div key={idx} className={styles.item}>{i.split(' ')[0]}</div>)}
        </div>
      </div>
    </div>
  );
}