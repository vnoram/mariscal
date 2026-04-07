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
      <div className={styles.lista}>
        
        {/* BÁSICOS: Color Naranja */}
        {inventario.map((item, index) => (
          <div 
            key={`basico-${index}`} 
            draggable 
            onDragStart={(e) => crearFantasma(e, item, "ingrediente")} 
            className={`${styles.ingrediente} ${styles.naranja}`}
            title={item} 
          >
            {item.split(' ')[0]} {/* Extrae solo el emoji */}
          </div>
        ))}

        {/* ESPECIALES (Nivel 4+): Color Morado */}
        {inventarioEspecial.map((item, index) => (
          <div 
            key={`esp-${index}`} 
            draggable 
            onDragStart={(e) => crearFantasma(e, item, "ingrediente")} 
            className={`${styles.ingrediente} ${styles.morado}`}
            title={item}
          >
            {item.split(' ')[0]}
          </div>
        ))}

        {/* BEBIDAS: Color Verde */}
        {inventarioBebidas.map((item, index) => (
          <div 
            key={`bebida-${index}`} 
            draggable 
            onDragStart={(e) => crearFantasma(e, item, "bebida")} 
            className={`${styles.ingrediente} ${styles.verde}`}
            title={item}
          >
            {item.split(' ')[0]}
          </div>
        ))}

      </div>
    </div>
  );
}