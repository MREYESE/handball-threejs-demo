# Handball — calibración de gestos y tutorial

[**JUGAR / TUTORIAL**](https://mreyese.github.io/handball-threejs-demo/)

Este repositorio publica únicamente artefactos compilados HTML, CSS y JavaScript.
No incluye TypeScript original, mapas de código, dependencias, pruebas, trazas ni
muestras de jugadores. El JavaScript compilado se descarga para ejecutar el juego.

## Cómo jugar

El inicio muestra **JUGAR** y **TUTORIAL**. JUGAR comienza una ronda de cinco tiros.
TUTORIAL dibuja automáticamente DIRECT, LOB, BOUNCE, ROSCA_LEFT, ROSCA_RIGHT y
FEINT, seguido por un segundo DIRECT independiente. **Saltar tutorial** entra
en una partida limpia; al terminar puedes elegir **Jugar ahora**.

- DIRECT: empieza abajo y desliza hacia arriba; inclina para apuntar.
- LOB: sube con fuerza y termina con un pequeño gancho hacia abajo.
- BOUNCE: empieza cerca del centro, baja y vuelve a subir formando una V.
  Puedes empezar entre el 30% y el 55% de altura, dentro del 4–96% del ancho,
  fuera del HUD. Ese inicio solo permite disparar una V completa.
- ROSCA: sube primero, dibuja una barriga a izquierda o derecha y vuelve
  subiendo. El final apunta; la barriga controla el giro.
- FEINT: amaga lateralmente, frena o invierte y levanta el dedo. El balón queda
  en la mano y no cuenta un tiro. **Empieza otro gesto para lanzar.**

Los resultados proceden de la física real. Ninguna técnica garantiza un gol.
Prueba escritorio y móvil, en vertical y horizontal.

## Rutas de prueba

- [Menú normal](https://mreyese.github.io/handball-threejs-demo/)
- [Tutorial automático](https://mreyese.github.io/handball-threejs-demo/?tutorial&seed=71)
- [Juego directo de diagnóstico](https://mreyese.github.io/handball-threejs-demo/?playtest&seed=71&quality=balanced)

`?playtest&trace` permite descargar trazas locales; no se suben al repositorio.
Los gestos del tutorial son muestras sintéticas de enseñanza, no pruebas humanas.

## Estado de validación

PLAYTEST para validación humana. **FULL_MILESTONE_ACCEPTED: NO.**
Compilación, 288 pruebas unitarias, 18 pruebas de integración enfocadas, inicio
público, ROSCA nativa y dev:smoke (3/3) aprobados. Revisión independiente aprobada.
Persisten fallos de referencias de captura y mínimos de muestras de perfilado
balanced/high. El perfil capture aprueba. No se actualizaron referencias ni se
rebajaron puertas de calidad. La aceptación humana de los gestos sigue pendiente.

`site/release.json` registra la procedencia y los hashes SHA-256 del paquete.
La publicación actualiza solo el artefacto; el historial conserva las versiones
anteriores para recuperación. El código original de versiones históricas que ya
fuera público no se elimina reescribiendo el historial.

[MIT License](LICENSE). Three.js conserva su licencia MIT en el paquete.
