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

  // Crear una imagen temporal para mostrar mientras arrastras
  const img = document.createElement("div");
  img.style.fontSize = "2rem";
  img.style.position = "absolute";
  img.style.top = "-9999px";
  img.innerText = item;
  document.body.appendChild(img);

  e.dataTransfer.setDragImage(img, 0, 0);

  // Eliminar la imagen después
  setTimeout(() => document.body.removeChild(img), 0);
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