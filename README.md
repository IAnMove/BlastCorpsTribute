# Blast Corps — Recharged

Juego de demolición 3D para navegador inspirado en la mecánica de Blast Corps. Escenarios y modelos originales creados con geometría procedural; no requiere ROMs ni recursos de Nintendo o Rare.

El aspecto **N64** está activado por defecto: texturas pequeñas de tierra, hierba y ladrillo; almacenes con tejados a dos aguas; transporte rojo con dos misiles; vehículos amarillos; cámara cercana; resolución interna de 360 líneas; radar circular, flecha verde y marcador clásico. Incluye fuego, humo y marcas de orugas. Es una recreación visual con recursos propios, no los modelos o texturas extraídos del original.

El botón **N64 / HD** cambia entre la estética clásica y la presentación moderna anterior sin reiniciar la misión. La selección se recuerda en el navegador.

Referencias visuales consultadas: [Rare Gamer, Carrier Mission Guide](https://www.raregamer.co.uk/games/blast-corps-carrier-mission-guide/) y [Nintendo Life, Blast Corps](https://www.nintendolife.com/reviews/n64/blast-corps). Las capturas en `references/` son solo referencias de desarrollo y no se distribuyen con el juego compilado.

## Jugar

En Windows, abre **Jugar.bat**. Requiere Node.js 22.12 o posterior (también funciona con 20.19+).

O ejecuta:

```sh
npm install
npm run dev
```

Abre la dirección local que muestra Vite. `npm run build` genera la versión estática en `dist`; `npm run preview` permite probarla. No abras `index.html` con `file://`: los módulos necesitan un servidor HTTP.

## Publicar en GitHub Pages

El juego funciona como una web estática: la simulación, los gráficos y el audio se ejecutan en el navegador. Node.js se utiliza para compilar, no como servidor en producción.

1. Crea el repositorio en GitHub y sube el proyecto, incluyendo `package-lock.json` y `.github/workflows/pages.yml`. No subas `node_modules` ni `dist` (ya están ignorados).
2. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**.
3. Haz un push a la rama predeterminada (`main` o `master`). También puedes ejecutar **Actions → Publish game to GitHub Pages → Run workflow** desde esa rama si ya habías subido el código antes de activar Pages.
4. Al terminar, la dirección del juego aparece en el despliegue y en **Settings → Pages**. Normalmente será `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

El workflow instala las dependencias, ejecuta las pruebas, compila y publica únicamente `dist`. Los siguientes pushes actualizan el juego automáticamente. Las rutas relativas de Vite permiten elegir cualquier nombre de repositorio sin modificar el código. Si tu rama predeterminada tiene otro nombre, añádelo a `on.push.branches` en el workflow.

Los jugadores solo necesitan abrir el enlace en un navegador compatible con WebGL. Los récords y preferencias siguen guardándose en ese navegador; no se sincronizan entre dispositivos. GitHub Pages está disponible para repositorios públicos con GitHub Free; los privados requieren un plan compatible.

Documentación oficial: [publicación con GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) y [despliegue estático de Vite](https://vite.dev/guide/static-deploy).

## Objetivo y controles

El convoy transporta una carga inestable y avanza automáticamente. Derriba las estructuras que bloquean la carretera antes de que llegue: los bloqueos consumen su integridad. Ganas cuando alcanza la salida; pierdes si la integridad llega a cero.

| Acción | Control |
| --- | --- |
| Acelerar / marcha atrás | W / S o ↑ / ↓ |
| Girar a izquierda / derecha | A / D o ← / → |
| Habilidad de demolición | Espacio |
| Turbo | Shift |
| Dozer / Drifter / Titan | 1 / 2 / 3 |
| Activar terminal cercano / abrir compuerta | E (botón E en móvil) |
| Pausar / continuar | Esc |
| Reiniciar misión | R |
| Ajustar cámara | Rueda del ratón |
| Activar sonido | Botón ♪ |

Dozer es equilibrado; Drifter tiene más velocidad y una habilidad de área; Titan es lento pero su onda sísmica alcanza varios edificios. Puedes cambiar de vehículo en cualquier momento de la partida. La habilidad y el turbo consumen energía, que se regenera. Los cubos con una cruz representan equipos de evacuación: recogerlos da puntos y recarga la energía.

Incluye siete misiones, daño gradual, escombros, combinaciones de puntuación, minimapa, pausa manual, efectos de sonido sintetizados, controles táctiles y récords locales por misión. El sonido empieza silenciado y se activa con el botón ♪. Las fuentes web son opcionales; hay fuentes locales de reserva.

## Campaña ampliada

Las operaciones 01–03 conservan los recorridos de iniciación. Las cuatro siguientes son mapas diseñados a mano, disponibles desde el selector:

| Operación | Escenario y objetivos |
| --- | --- |
| 04 · Muelles de contrabando | Ruta en zigzag entre almacenes, canal navegable solo por el puente y compuerta que se abre desde un terminal. |
| 05 · Reacción en cadena | Refinería con depósitos rojos explosivos, bloques blindados, tuberías y cierre de seguridad. |
| 06 · Garganta del trueno | Carretera de montaña, derrumbes destructibles, dos puentes sobre un cañón y dos terminales de barrera. |
| 07 · Apagón en la central | Operación nocturna con ruta en espiral, dos subestaciones, doce bloqueos y cinco equipos de rescate. |

El convoy recorre las curvas de la carretera y gira en los cruces. Los terminales aparecen como cuadrados azules en el mapa: acércate y pulsa **E**. Activarlos abre su barrera, da 750 puntos y recarga la energía. Las compuertas cerradas no se derriban a golpes. Los depósitos rojos dañan estructuras cercanas al explotar; Titan es especialmente eficaz contra los bloques blindados. El agua y el cañón impiden el paso fuera de los puentes. Los rescates son opcionales y aumentan la puntuación.

Ambos estilos, N64 y HD, comparten objetivos y geometría de colisiones; cambiar el estilo conserva terminales, destrucción y posición del convoy. `src/levels.js` define los mapas y `src/campaign-scene.js` sus elementos visuales. Las pruebas de campaña completan los cuatro mapas usando conducción, habilidades y terminales.

## Desarrollo y comprobaciones

`src/game.js` contiene la simulación independiente del renderizador. `src/main.js` construye el escenario Three.js y conecta interfaz, entrada, audio y efectos. `src/style.css` define la interfaz adaptable.

```sh
npm test
npm run build
```

Es una versión independiente jugable de alcance arcade, no una reproducción completa del catálogo de niveles y vehículos del original.
