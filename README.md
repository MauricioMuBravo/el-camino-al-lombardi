# El Camino al Lombardi

Interactivo sobre toda la historia de la NFL y el Super Bowl: orígenes de la liga, jugadas legendarias, leyendas del juego, una trivia de historia completa, un visor 3D del Trofeo Vince Lombardi y la galería de los sesenta campeones.

## Estructura de archivos

```
el-camino-al-lombardi/
├── index.html          Estructura de la página (HTML)
├── assets/
│   ├── styles.css       Todos los estilos (paleta, tipografía, layout, animaciones)
│   ├── script.js        Lógica principal: scroll, navegación, trivia, línea de tiempo, tabla de campeones
│   └── trophy.js        Visor 3D del trofeo (Three.js), como módulo ES
└── README.md            Este archivo
```

## Cómo abrirlo

El visor 3D del trofeo (`assets/trophy.js`) se carga como módulo ES (`<script type="module">`). Los navegadores bloquean módulos ES cuando el archivo se abre directamente con doble clic (protocolo `file://`), por seguridad (CORS). Todo lo demás en la página funcionaría igual abriendo `index.html` directamente, pero para ver el trofeo en 3D hace falta servir la carpeta por HTTP. Dos formas rápidas de hacerlo:

**Con Python** (ya viene instalado en Mac/Linux, y en Windows si tienes Python):
```bash
cd el-camino-al-lombardi
python3 -m http.server 8000
```
Luego abre `http://localhost:8000` en el navegador.

**Con la extensión "Live Server" de VS Code**: clic derecho sobre `index.html` → "Open with Live Server".

## Dependencias externas (por CDN, requieren internet)

- Google Fonts — Big Shoulders Display y Libre Franklin
- `canvas-confetti` (cdnjs) — efecto de confeti
- `three.js` r160 (jsDelivr) — motor 3D del trofeo, cargado vía *import map* en `index.html`

No hace falta instalar nada localmente: todas estas librerías se cargan desde internet cuando se abre la página. Si necesitas que funcione sin conexión, estas tres dependencias tendrían que descargarse y referenciarse localmente.

## Notas de contenido

Los "escudos" de equipo que aparecen en la trivia, la galería de campeones y la página de inicio son insignias de colores originales (no los logotipos oficiales de la NFL), para evitar problemas de derechos de marca. Los datos históricos (campeones, resultados, MVPs) están verificados hasta el Super Bowl LX (2026).
