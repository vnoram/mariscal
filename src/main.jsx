import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 1. Importar el parche para móviles
import { polyfill } from "mobile-drag-drop";
// 2. Importar los estilos del parche (ayuda a ver el fantasma al arrastrar)
import "mobile-drag-drop/default.css";

// 3. Activar la traducción de toques a clics
polyfill({
  // Esto asegura que el emoji aparezca justo debajo del dedo al arrastrar
  dragImageCenterOnTouch: true
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)