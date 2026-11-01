# Handball — Arcade, gestos y tutorial

[**JUGAR / ARCADE / TUTORIAL**](https://mreyese.github.io/handball-threejs-demo/)

Versión **PLAYTEST F7** para probar movimiento, bote automático y cámara de seguimiento.
La aceptación humana sigue pendiente; no se declara aceptado el hito completo.

Este repositorio publica únicamente el juego compilado en HTML, CSS y JavaScript,
metadatos de versión y las instrucciones públicas. El navegador descarga JavaScript
minificado para ejecutar el juego. No se publican TypeScript original, mapas de
código, dependencias, pruebas, trazas ni datos de jugadores.

## Cómo jugar

- **ARCADE:** mueve al jugador con el joystick izquierdo y dibuja el tiro con la
  otra mano. Puedes tocar en cualquier orden o mover, levantar y tirar con un dedo.
  En escritorio puedes usar WASD o flechas y el ratón. El jugador bota al moverse
  y recoge el balón para tirar. La cámara mantiene la portería y al jugador visibles.
- **JUGAR:** conserva la modalidad clásica de cinco tiros.
- **TUTORIAL:** demuestra los gestos; puedes saltarlo o jugar al terminar.

Gestos disponibles en ambas modalidades:

- **DIRECT:** empieza abajo y desliza hacia arriba; inclina para apuntar.
- **LOB:** sube y termina con un pequeño gancho hacia abajo.
- **BOUNCE:** baja y vuelve a subir formando una V. También admite un inicio alto
  fuera de los paneles del HUD si completas la V.
- **ROSCA:** sube, dibuja una barriga a izquierda o derecha y vuelve subiendo.
  El final apunta y la barriga controla el giro.
- **FEINT:** amaga lateralmente, frena o invierte y levanta. No consume un tiro.
  Empieza un gesto nuevo para lanzar.

Ninguna técnica garantiza un gol. Los resultados proceden de contactos físicos;
el balón completo debe cruzar dentro de la portería. Un contacto previo con el
suelo, portero, poste o larguero no anula por sí solo un gol.

## Enlaces de prueba

- [Menú](https://mreyese.github.io/handball-threejs-demo/)
- [Arcade](https://mreyese.github.io/handball-threejs-demo/?arcade)
- [Tutorial](https://mreyese.github.io/handball-threejs-demo/?tutorial&seed=71)

Prueba especialmente los dos dedos simultáneos, cambios rápidos de dirección,
ambas roscas, LOB, V-BOUNCE, FEINT seguido de tiro, vertical/horizontal y cinco
lanzamientos seguidos de reinicio. Comprueba la comodidad de la cámara y el bote.

## Estado de validación

- Compilación, 359 pruebas unitarias y 90 casos funcionales de navegador aprobados.
- Diez rondas Arcade con recursos y listeners estables; revisión independiente
  aprobada para prueba humana local.
- Aproximadamente 60 FPS de movimiento en el Intel probado; no es una garantía
  para todos los dispositivos. La renderización por software es más lenta.
- La puerta completa sigue fallando por nueve comprobaciones de captura también
  reproducidas antes de F7. El perfil alto sin interfaz registró 19 muestras frente
  al mínimo de 20 y sigue sin resolverse. No se rebajaron las comprobaciones.
- **F7_HUMAN_ACCEPTED: NO. FULL_MILESTONE_ACCEPTED: NO.**

`site/release.json` registra la procedencia y los hashes SHA-256 del paquete.
Las versiones compiladas anteriores permanecen en el historial para recuperación.

[MIT License](LICENSE). Three.js conserva su licencia MIT en el paquete.
