import { useState, useEffect, useRef } from "react";
import useSound from "use-sound";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// ─── Inventarios (datos estáticos del juego) ────────────────────────────────
export const inventario         = ['🦐 Camarón', '🦪 Chorito', '🦀 Jaiba', '🍋 Limón', '🌿 Cilantro'];
export const inventarioEspecial = ['🧀 Queso', '🌶️ Ají', '🧅 Cebolla'];
export const inventarioBebidas  = ['🥤 Coca-Cola', '🍺 Cerveza', '🍷 Vino'];

// ────────────────────────────────────────────────────────────────────────────

export function useGame(usuario) {
  const [empanada,       setEmpanada]       = useState({ izquierda: [], derecha: [] });
  const [bebidaPlato,    setBebidaPlato]    = useState(null);
  const [pedidoActual,   setPedidoActual]   = useState(null);
  const [mensaje,        setMensaje]        = useState("¡Abre el local!");
  const [contador,       setContador]       = useState(15);
  const [vidas,          setVidas]          = useState(3);
  const [puntos,         setPuntos]         = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [puntajeGuardado,setPuntajeGuardado]= useState(false);
  const [rankingTop,     setRankingTop]     = useState([]);

  // ── Sonidos ──────────────────────────────────────────────────────────────
  const [playPop]                   = useSound("/sounds/pop.mp3");
  const [playDing]                  = useSound("/sounds/ding.mp3");
  const [playError]                 = useSound("/sounds/error.mp3");
  const [playBgm, { stop: stopBgm }] = useSound("/sounds/bgm.mp3", { volume: 0.2, loop: true });
  const bgmActiveRef                = useRef(false);

  // Inicia BGM cuando hay pedido activo y el juego no terminó
  useEffect(() => {
    if (!juegoTerminado && pedidoActual && !bgmActiveRef.current) {
      playBgm();
      bgmActiveRef.current = true;
    }
  }, [pedidoActual, juegoTerminado, playBgm]);

  // Detiene BGM en Game Over
  useEffect(() => {
    if (juegoTerminado && bgmActiveRef.current) {
      stopBgm();
      bgmActiveRef.current = false;
    }
  }, [juegoTerminado, stopBgm]);

  const detenerBgm = () => {
    stopBgm();
    bgmActiveRef.current = false;
  };

  // ── Genera un pedido aleatorio según dificultad ──────────────────────────
  const generarPedido = (puntosActuales = 0) => {
    let minIng = 1, maxIng = 1;
    let probBebida = 0.5;
    let usaEspeciales = false;

    if      (puntosActuales <= 5)  { minIng = 1; maxIng = 1; probBebida = 0.5; }
    else if (puntosActuales <= 12) { minIng = 1; maxIng = 2; probBebida = 0.5; }
    else if (puntosActuales <= 20) { minIng = 2; maxIng = 2; probBebida = 1.0; }
    else if (puntosActuales <= 30) { minIng = 2; maxIng = 3; probBebida = 1.0; usaEspeciales = true; }
    else                           { minIng = 3; maxIng = 3; probBebida = 1.0; usaEspeciales = true; }

    const pool = usaEspeciales ? [...inventario, ...inventarioEspecial] : inventario;

    const generarLado = () => {
      const cantidad = Math.floor(Math.random() * (maxIng - minIng + 1)) + minIng;
      return Array.from({ length: cantidad }, () => pool[Math.floor(Math.random() * pool.length)]);
    };

    const pideBebida = Math.random() < probBebida;

    setPedidoActual({
      izquierda: generarLado(),
      derecha:   generarLado(),
      bebida:    pideBebida ? inventarioBebidas[Math.floor(Math.random() * inventarioBebidas.length)] : null,
    });
    setEmpanada({ izquierda: [], derecha: [] });
    setBebidaPlato(null);

    const nivel = puntosActuales <= 5 ? 1
                : puntosActuales <= 12 ? 2
                : puntosActuales <= 20 ? 3
                : puntosActuales <= 30 ? 4 : 5;
    setMensaje(`¡Nivel ${nivel}!`);
  };

  // ── Temporizador (solo corre cuando hay una partida activa) ──────────────
  useEffect(() => {
    if (juegoTerminado || !usuario || !pedidoActual) return;
    const timer = setInterval(() => setContador((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [juegoTerminado, usuario]);

  // ── Tiempo agotado ───────────────────────────────────────────────────────
  useEffect(() => {
    if (contador === 0 && !juegoTerminado) {
      playError();
      setVidas((v) => v - 1);
      setMensaje("⏳ ¡Tiempo agotado!");
      generarPedido(puntos);
      setContador(15);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contador, juegoTerminado]);

  // ── Game Over ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (vidas <= 0 && !juegoTerminado) {
      setJuegoTerminado(true);
      setMensaje("💀 Game Over");
      cargarRanking();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vidas, juegoTerminado]);

  // ── Acciones del jugador ─────────────────────────────────────────────────
  const agregarIngrediente = (item, lado) => {
    if (juegoTerminado) return;
    playPop();
    setEmpanada((prev) => ({ ...prev, [lado]: [...prev[lado], item] }));
  };

  const agregarBebida = (item) => {
    if (juegoTerminado) return;
    playPop();
    setBebidaPlato(item);
  };

  const limpiarEmpanada = () => {
    setEmpanada({ izquierda: [], derecha: [] });
    setBebidaPlato(null);
  };

  const entregarPedido = () => {
    if (juegoTerminado || !pedidoActual) return setMensaje("No hay clientes.");

    const esCorrecto =
      JSON.stringify([...empanada.izquierda].sort()) === JSON.stringify([...pedidoActual.izquierda].sort()) &&
      JSON.stringify([...empanada.derecha].sort())   === JSON.stringify([...pedidoActual.derecha].sort())   &&
      bebidaPlato === pedidoActual.bebida;

    if (esCorrecto) {
      playDing();
      const nuevosPuntos = puntos + 1;
      setPuntos(nuevosPuntos);
      setMensaje("⭐⭐⭐⭐⭐ ¡Perfecto!");
      setPedidoActual(null);
      limpiarEmpanada();
      setContador(15);
      setTimeout(() => generarPedido(nuevosPuntos), 1500);
    } else {
      playError();
      setVidas((v) => v - 1);
      setMensaje("❌ Pedido incorrecto");
    }
  };

  // ── Firebase: ranking ────────────────────────────────────────────────────
  const cargarRanking = async () => {
    try {
      const q = query(collection(db, "ranking"), orderBy("puntos", "desc"), limit(5));
      const snapshot = await getDocs(q);
      setRankingTop(snapshot.docs.map((doc) => doc.data()));
    } catch (error) {
      console.error("Error al cargar ranking:", error);
    }
  };

  const guardarPuntaje = async () => {
    if (!usuario) return;
    try {
      await addDoc(collection(db, "ranking"), {
        nombre: usuario.displayName || "Cocinero Anónimo",
        puntos,
        fecha: new Date().toISOString(),
      });
      setPuntajeGuardado(true);
      setMensaje("✅ ¡Guardado!");
      cargarRanking();
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("❌ Error al guardar");
    }
  };

  const reiniciarJuego = () => {
    setVidas(3);
    setContador(15);
    setPuntos(0);
    setJuegoTerminado(false);
    setBebidaPlato(null);
    setPuntajeGuardado(false);
    generarPedido(0);
  };

  return {
    // Estado
    empanada,
    bebidaPlato,
    pedidoActual,
    mensaje,
    contador,
    vidas,
    puntos,
    juegoTerminado,
    puntajeGuardado,
    rankingTop,
    // Acciones
    agregarIngrediente,
    agregarBebida,
    limpiarEmpanada,
    entregarPedido,
    guardarPuntaje,
    reiniciarJuego,
    cargarRanking,
    detenerBgm,
  };
}
