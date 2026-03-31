import styles from "../styles/Paila.module.css";
export default function Paila({ paila }) {
  return (
    <div className={styles.paila}>
      {paila.length > 0 ? paila.join(' + ') : "Paila vacía"}
    </div>
  );
}