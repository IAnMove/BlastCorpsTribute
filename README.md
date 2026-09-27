# Blast Corps — Recharged

Juego de demolición 3D para navegador inspirado en la mecánica de Blast Corps. Escenarios y modelos originales creados con geometría procedural; no requiere ROMs ni recursos de Nintendo o Rare.

## Jugar

En Windows, abre **Jugar.bat**. Requiere Node.js 22.12 o posterior (también funciona con 20.19+).

O ejecuta:

```sh
npm install
npm run dev
```

Abre la dirección local que muestra Vite. `npm run build` genera la versión estática en `dist`; `npm run preview` permite probarla. No abras `index.html` con `file://`: los módulos necesitan un servidor HTTP.

## Objetivo y controles

El convoy transporta una carga inestable y avanza automáticamente. Derriba las estructuras marcadas en naranja antes de que llegue: los bloqueos consumen su integridad. Ganas cuando alcanza la salida; pierdes si la integridad llega a cero.

| Acción | Control |
| --- | --- |
| Acelerar / marcha atrás | W / S o ↑ / ↓ |
| Girar a izquierda / derecha | A / D o ← / → |
| Habilidad de demolición | Espacio |
| Turbo | Shift |
| Dozer / Drifter / Titan | 1 / 2 / 3 |
| Pausar / continuar | Esc |
| Reiniciar misión | R |
| Ajustar cámara | Rueda del ratón |
| Activar sonido | Botón ♪ |

Dozer es equilibrado; Drifter tiene más velocidad y una habilidad de área; Titan es lento pero su onda sísmica alcanza varios edificios. Puedes cambiar de vehículo en cualquier momento de la partida. La habilidad y el turbo consumen energía, que se regenera. Los cubos verdes representan equipos de evacuación: recogerlos da puntos y recarga la energía.

Incluye tres misiones, daño gradual, escombros, combinaciones de puntuación, minimapa, pausa automática al perder foco, efectos de sonido sintetizados, controles táctiles y récords locales por misión. El sonido empieza silenciado y se activa con el botón ♪. Las fuentes web son opcionales; hay fuentes locales de reserva.

## Desarrollo y comprobaciones

`src/game.js` contiene la simulación independiente del renderizador. `src/main.js` construye el escenario Three.js y conecta interfaz, entrada, audio y efectos. `src/style.css` define la interfaz adaptable.

```sh
npm test
npm run build
```

Es una versión independiente jugable de alcance arcade, no una reproducción completa del catálogo de niveles y vehículos del original.
