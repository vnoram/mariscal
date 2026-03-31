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
            onDragStart={(e) => {
              e.dataTransfer.setData("ingrediente", item);

              // Crear un canvas invisible para usar como imagen de arrastre
              const canvas = document.createElement("canvas");
              canvas.width = 60;
              canvas.height = 60;
              const ctx = canvas.getContext("2d");

              ctx.font = "40px serif";
              ctx.fillText(item, 10, 45);

              // Usar el canvas como imagen de arrastre
              e.dataTransfer.setDragImage(canvas, 30, 30);
            }}
            className={styles.ingrediente}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}