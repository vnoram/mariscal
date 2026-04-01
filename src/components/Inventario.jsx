import styles from "../styles/Inventario.module.css";

export default function Inventario({ inventario, inventarioEspecial, inventarioBebidas }) {
  
  const crearFantasma = (e, item, tipo) => {
    e.dataTransfer.setData("tipo", tipo);
    e.dataTransfer.setData("item", item);
    const canvas = document.createElement("canvas");
    canvas.width = 60; canvas.height = 60;
    const ctx = canvas.getContext("2d");
    ctx.font = "40px serif";
    ctx.fillText(item.split(' ')[0], 10, 45); 
    e.dataTransfer.setDragImage(canvas, 30, 30);
  };

  return (
    <div className={styles.inventario}>
      <h3>Ingredientes Básicos</h3>
      <div className={styles.lista}>
        {inventario.map((item, index) => (
          <div key={index} draggable onDragStart={(e) => crearFantasma(e, item, "ingrediente")} className={styles.ingrediente}>
            {item}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '15px' }}>Ingredientes Especiales (Nivel 4+)</h3>
      <div className={styles.lista}>
        {inventarioEspecial.map((item, index) => (
          <div key={index} draggable onDragStart={(e) => crearFantasma(e, item, "ingrediente")} className={styles.ingrediente} style={{borderColor: '#9b59b6', background: '#f5eef8'}}>
            {item}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '15px' }}>Bebidas (Para el plato)</h3>
      <div className={styles.lista}>
        {inventarioBebidas.map((item, index) => (
          <div key={index} draggable onDragStart={(e) => crearFantasma(e, item, "bebida")} className={styles.ingrediente} style={{borderColor: '#3498db', background: '#ebf5fb'}}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}