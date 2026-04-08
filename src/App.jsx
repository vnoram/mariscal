import { useState } from "react";
import Ticket     from "./components/Ticket";
import Inventario  from "./components/Inventario";
import Empanada    from "./components/Empanada";
import Controles   from "./components/Controles";

import { useAuth } from "./hooks/useAuth";
import { useGame, inventario, inventarioEspecial, inventarioBebidas } from "./hooks/useGame";

// ── Estilos de botón arcade reutilizables ────────────────────────────────────
const btnBase = {
  padding: '13px 20px', border: 'none', borderRadius: '10px',
  cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%',
};

export default function App() {

  // ── Navegación ───────────────────────────────────────────────────────────
  const [vista, setVista] = useState('menu');

  // ── Autenticación ─────────────────────────────────────────────────────────
  const {
    usuario, cargandoAuth,
    modoRegistro, setModoRegistro,
    authNombre,   setAuthNombre,
    authEmail,    setAuthEmail,
    authPassword, setAuthPassword,
    authError,
    manejarLogin, manejarRegistro, cerrarSesion,
  } = useAuth();

  // ── Lógica del juego ──────────────────────────────────────────────────────
  const {
    empanada, bebidaPlato, pedidoActual, mensaje,
    contador, vidas, puntos, juegoTerminado,
    puntajeGuardado, rankingTop,
    agregarIngrediente, agregarBebida, limpiarEmpanada,
    entregarPedido, guardarPuntaje, reiniciarJuego, cargarRanking,
  } = useGame(usuario);

  // ── Pantalla de carga ─────────────────────────────────────────────────────
  if (cargandoAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111', color: 'white' }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  // ── Vista: Auth ───────────────────────────────────────────────────────────
  if (!usuario) {
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111', padding: '20px' }}>
        <h1 style={{ color: '#f39c12', fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>🌊 Mariscales 🦑</h1>
        <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '15px', width: '100%', maxWidth: '350px' }}>
          <form onSubmit={modoRegistro ? manejarRegistro : manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {modoRegistro && (
              <input type="text" placeholder="Tu Nombre" value={authNombre} onChange={(e) => setAuthNombre(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }} required />
            )}
            <input type="email"    placeholder="Correo electrónico" value={authEmail}    onChange={(e) => setAuthEmail(e.target.value)}    style={{ padding: '10px', borderRadius: '5px' }} required />
            <input type="password" placeholder="Contraseña"         value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }} required />
            {authError && <p style={{ color: '#e74c3c', margin: 0, fontSize: '0.85rem' }}>{authError}</p>}
            <button type="submit" style={{ padding: '12px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              {modoRegistro ? "Registrarse y Jugar" : "Entrar a la Cocina"}
            </button>
          </form>
          <button onClick={() => setModoRegistro(!modoRegistro)} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', marginTop: '15px', width: '100%' }}>
            {modoRegistro ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
        </div>
      </div>
    );
  }

  const nombreCocinero = usuario.displayName || usuario.email.split('@')[0];

  // ── Vista: Menú Principal ─────────────────────────────────────────────────
  if (vista === 'menu') {
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111', padding: '20px', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#f39c12', fontSize: '2.8rem', margin: '0 0 8px', textShadow: '0 0 24px #e67e22' }}>🌊 Mariscales 🦑</h1>
          <p style={{ color: '#aaa', fontSize: '0.95rem', margin: 0 }}>
            Bienvenido, <strong style={{ color: '#f1c40f' }}>{nombreCocinero}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
          <button
            onClick={() => { reiniciarJuego(); setVista('juego'); }}
            style={{ ...btnBase, backgroundColor: '#27ae60', color: 'white', fontSize: '1.1rem', letterSpacing: '1px' }}
          >
            🍳 Iniciar Turno
          </button>
          <button
            onClick={() => { cargarRanking(); setVista('ranking'); }}
            style={{ ...btnBase, backgroundColor: '#2980b9', color: 'white' }}
          >
            🏆 Ver Ranking
          </button>
          <button
            onClick={cerrarSesion}
            style={{ ...btnBase, backgroundColor: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // ── Vista: Ranking ────────────────────────────────────────────────────────
  if (vista === 'ranking') {
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111', padding: '20px', gap: '20px' }}>
        <h2 style={{ color: '#f1c40f', fontSize: '2rem', margin: 0 }}>🏆 TOP 5 Cocineros</h2>

        <div style={{ backgroundColor: '#222', borderRadius: '12px', padding: '16px', width: '100%', maxWidth: '340px' }}>
          {rankingTop.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', margin: 0 }}>Sin récords aún. ¡Sé el primero!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #444' }}>
                  <th style={{ color: '#f39c12', textAlign: 'left',  padding: '6px 8px', fontSize: '0.8rem' }}>#</th>
                  <th style={{ color: '#f39c12', textAlign: 'left',  padding: '6px 8px', fontSize: '0.8rem' }}>Cocinero</th>
                  <th style={{ color: '#f39c12', textAlign: 'right', padding: '6px 8px', fontSize: '0.8rem' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {rankingTop.map((r, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                    <td style={{ color: '#f1c40f', padding: '7px 8px', fontWeight: 'bold' }}>{i + 1}</td>
                    <td style={{ color: '#fff',    padding: '7px 8px' }}>{r.nombre}</td>
                    <td style={{ color: '#e74c3c', padding: '7px 8px', fontWeight: 'bold', textAlign: 'right' }}>{r.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button
          onClick={() => setVista('menu')}
          style={{ ...btnBase, backgroundColor: '#555', color: 'white', maxWidth: '340px' }}
        >
          ← Volver al Menú
        </button>
      </div>
    );
  }

  // ── Vista: Área de Juego ──────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#1a120b', height: '100svh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* HEADER COMPACTO */}
      <header style={{ backgroundColor: '#0f0f0f', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', flexShrink: 0, gap: '6px' }}>
        <button
          onClick={() => setVista('menu')}
          title="Volver al Menú"
          style={{ padding: '3px 7px', backgroundColor: '#333', color: '#aaa', border: '1px solid #555', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', flexShrink: 0 }}
        >
          ← Menú
        </button>

        <span style={{ color: '#fff', fontSize: '0.75rem', backgroundColor: '#333', padding: '3px 7px', borderRadius: '5px', flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {mensaje}
        </span>

        <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', flexShrink: 0 }}>
          <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>⭐{puntos}</span>
          <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>⏳{contador}s</span>
          <span>{"❤️".repeat(vidas > 0 ? vidas : 0)}</span>
        </div>

        <span style={{ color: '#aaa', fontSize: '0.7rem', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {nombreCocinero}
        </span>
      </header>

      {/* ÁREA DE JUEGO VERTICAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#3e2723', position: 'relative' }}>

        {juegoTerminado ? (
          /* ── GAME OVER ── */
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#ecf0f1', padding: '20px', borderRadius: '16px', border: '4px solid #e74c3c', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
              <h2 style={{ color: '#c0392b', marginTop: 0, fontSize: '1.6rem' }}>💀 Game Over</h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '12px' }}>
                Puntaje: <span style={{ color: '#c0392b', fontSize: '1.5rem' }}>{puntos}</span> Pts
              </p>
              {!puntajeGuardado ? (
                <button onClick={guardarPuntaje} style={{ padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: '8px', fontSize: '1rem' }}>💾 Guardar Récord</button>
              ) : (
                <p style={{ color: '#27ae60', fontWeight: 'bold', marginBottom: '8px' }}>✅ Récord Guardado</p>
              )}
              {rankingTop.length > 0 && (
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px', marginBottom: '10px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#555', fontSize: '0.8rem', marginBottom: '6px', textAlign: 'center' }}>🏆 TOP 5</div>
                  {rankingTop.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', backgroundColor: i % 2 === 0 ? '#f8f8f8' : 'transparent', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <span>{i + 1}. {r.nombre}</span>
                      <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>{r.puntos} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={reiniciarJuego} style={{ padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1rem', marginBottom: '8px' }}>🔄 Volver a Jugar</button>
              <button onClick={() => setVista('menu')} style={{ padding: '11px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '0.9rem' }}>🏠 Volver al Menú Principal</button>
            </div>
          </div>
        ) : (
          <>
            {/* TICKET */}
            <div style={{ flexShrink: 0, padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.25)', borderBottom: '1px solid #1f1209' }}>
              <Ticket pedidoActual={pedidoActual} />
            </div>

            {/* EMPANADA */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', overflow: 'hidden' }}>
              <Empanada
                empanada={empanada}
                agregarIngrediente={agregarIngrediente}
                bebidaPlato={bebidaPlato}
                agregarBebida={agregarBebida}
              />
            </div>

            {/* CONTROLES */}
            <div style={{ flexShrink: 0, padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid #1f1209' }}>
              <Controles
                limpiar={limpiarEmpanada}
                entregar={entregarPedido}
              />
            </div>

            {/* INVENTARIO */}
            <div style={{ flexShrink: 0, backgroundColor: '#2d1b11', borderTop: '2px solid #1f1209', padding: '6px 8px', maxHeight: '32vh', overflowY: 'auto' }}>
              <Inventario
                inventario={inventario}
                inventarioEspecial={inventarioEspecial}
                inventarioBebidas={inventarioBebidas}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
