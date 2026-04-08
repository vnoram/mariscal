# Integración de Audio — Mariscales

## ¿Qué se hizo?

### 1. Librería instalada
`use-sound@5.0.0` está en `package.json`. No necesitas instalar nada más.

### 2. Directorio creado
`public/sounds/` — aquí es donde debes dejar tus archivos `.mp3`.

### 3. `src/hooks/useGame.js` — Lógica de sonido
Se inicializaron 4 sonidos con `useSound`:

| Variable    | Archivo              | Cuándo suena                                    |
|-------------|----------------------|-------------------------------------------------|
| `playPop`   | `/sounds/pop.mp3`    | Al agregar un ingrediente o una bebida          |
| `playDing`  | `/sounds/ding.mp3`   | Al entregar un pedido correcto                  |
| `playError` | `/sounds/error.mp3`  | Al equivocarse o perder una vida por tiempo     |
| `playBgm`   | `/sounds/bgm.mp3`    | Música de fondo en loop (volumen 0.2)           |

La BGM arranca automáticamente al recibir el primer pedido y se detiene sola al llegar al Game Over. El hook exporta `detenerBgm` para cortarla al salir al menú.

### 4. `src/App.jsx` — Orquestación de navegación
Se crearon dos funciones seguras que cortan la BGM antes de cambiar de pantalla:
- `irAlMenu()` → detiene BGM + navega a `'menu'`
- `salirDeLaCuenta()` → detiene BGM + cierra sesión + navega a `'menu'`

Todos los botones "← Menú", "← Volver al Menú", "🏠 Volver al Menú Principal" y "Cerrar Sesión" ya usan estas funciones.

---

## Tu única tarea: soltar los 4 archivos MP3

Descarga o crea 4 archivos de audio y cópialos en `public/sounds/` con exactamente estos nombres:

```
public/
└── sounds/
    ├── bgm.mp3      ← Música de fondo (loop, ambiental)
    ├── pop.mp3      ← Efecto corto al añadir ingrediente
    ├── ding.mp3     ← Efecto de éxito / pedido correcto
    └── error.mp3    ← Efecto de error / tiempo agotado
```

Una vez que los archivos estén ahí, ejecuta `npm run dev` y el audio funcionará sin tocar ningún otro archivo.
