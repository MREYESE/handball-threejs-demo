# Gesture V3 — PLAYTEST público

Aceptación humana pendiente; no es una versión de producción aceptada.

[Abrir el juego con semilla 71 y calidad balanced](https://mreyese.github.io/handball-threejs-demo/?playtest&seed=71&quality=balanced).

Empieza dentro del **45 % inferior del área de juego**, lejos de los controles.
Arrastra con un solo dedo (o botón izquierdo del ratón), sin levantarlo hasta
terminar la acción. Puedes salir de esa zona una vez iniciado el gesto. Haz
movimientos claros y rápidos; un gesto de más de 1,5 s, demasiado corto o
interrumpido se rechaza. En los ejemplos, la parte superior es y=0 y el suelo de
la pantalla es y=1. Son orientaciones, no puntos que haya que acertar.

| Movimiento | Cómo dibujarlo | Qué debería ocurrir |
| --- | --- | --- |
| DIRECT | Desde abajo, una línea clara hacia arriba. Inclínala para apuntar a un lado. | Lanzamiento rápido y directo. Distancia y velocidad influyen en la potencia. Un DIRECT bajo sigue siendo DIRECT. |
| LOB | Empieza muy abajo, sube bastante, vuelve un poco hacia abajo y suelta todavía por encima del inicio: una pequeña vuelta en la punta. | Lanzamiento elevado con arco. El pequeño retorno final no debe lanzar el balón hacia el suelo. Inclina el conjunto para apuntar a izquierda, centro o derecha. |
| BOUNCE | Empieza algo por debajo de la mitad (por ejemplo y≈0,62), baja (≈0,84), invierte hacia arriba y suelta por encima del inicio (≈0,48): una V vertical. | El lanzamiento sale con intención baja y puede tocar realmente el suelo antes de la portería. La potencia y la dirección pueden producir resultados diferentes; el rebote no está garantizado por una etiqueta. |
| ROSCA_LEFT | Empieza abajo, sube primero, dibuja una barriga hacia la izquierda y vuelve hacia la línea de tiro mientras sigues subiendo. | Efecto lateral izquierdo visible en vuelo. La etiqueta interna puede seguir siendo DIRECT: el giro es continuo. |
| ROSCA_RIGHT | Igual que ROSCA_LEFT, con la barriga a la derecha. | Efecto opuesto al anterior. El lado de la portería al que apuntas puede elegirse independientemente de la barriga. |
| FEINT | Desde abajo, engaña primero lateralmente, frena o retrocede de forma clara y continúa brevemente en la dirección opuesta. Después **levanta el dedo**. | Hombro y brazo amagan; el balón permanece en la mano. El portero puede leer, esperar, inclinarse o comprometerse. No sale ningún tiro ni cambia el contador. |

Para LOB, conserva una subida neta clara: una vuelta muy pequeña se interpreta
conservadoramente como DIRECT. Para V, la bajada inicial debe ser visible. No
hagas una V invertida esperando un BOUNCE. Para ROSCA empieza hacia arriba:
arrancar lateralmente y cambiar de sentido puede ser una finta auténtica.

## Finta y tiro son dos acciones

1. Amaga hacia la izquierda, frena/cambia de sentido y levanta el dedo.
2. Comprueba que el balón sigue en la mano y el contador no ha cambiado.
3. **Vuelve a tocar** la zona inferior. Dibuja ahora DIRECT, LOB, BOUNCE o ROSCA.
4. Suelta este segundo gesto para lanzar. Solo ahora se cuenta un tiro.

El portero conserva su estado real al empezar el segundo gesto. La finta puede
abrir una oportunidad breve, no regalar un gol. Tras unos 0,65 s empieza a
recuperarse, de forma gradual y con velocidad limitada. Si esperas, vuelve a su
posición normal. Repetir fintas no acumula desplazamientos ni alarga una ventana
ya activa. También puedes tirar directamente sin fintar.

Observa las señales F5-A: READ baja/abre los brazos para leer; HOLD mantiene una
guardia centrada; COMMIT muestra inclinación y alcance hacia una dirección;
después llega la reacción, el salto y la recuperación. Una finta no tiene por
qué provocar siempre COMMIT ni una reacción equivocada.

## Cómo detectar un reconocimiento fallido

- Querías FEINT pero sale un balón: anotar como fallo grave, con traza.
- Querías tirar pero aparece FEINT y sigue el balón en la mano: anotar falso
  positivo; revisar si el inicio fue lateral con un cambio de dirección claro.
- Querías LOB/V pero el indicador muestra DIRECT: anotar forma, amplitud y
  velocidad. No asumir que cualquier curva basta para activar una técnica.
- El indicador de ROSCA puede ser DIRECT: comprobar giro y curvatura, no solo
  la categoría. Comparar las dos barrigas con un objetivo similar.
- BOUNCE sin contacto con el suelo: anotar dirección/potencia y trayectoria.
  Un tiro bajo o una etiqueta no prueban un rebote físico.
- Un gesto cancelado, demasiado corto o fuera de zona no consume un tiro.

## Lista breve de aceptación humana

- [ ] DIRECT recto y diagonal no se convierten en finta por pequeños temblores.
- [ ] LOB pequeño/grande, lento/rápido, a ambos lados: se reconoce y muestra arco.
- [ ] V clara a izquierda/centro/derecha: comprobar contactos reales con el suelo.
- [ ] Las dos ROSCA curvan en lados opuestos sin perder control del objetivo.
- [ ] FEINT a ambos lados: balón en mano, brazo visible, cero sonido de tiro,
      cero resultado y cero incremento del contador.
- [ ] Nuevo gesto tras FEINT: un solo lanzamiento contra el estado existente del
      portero; ninguna recolocación instantánea.
- [ ] Espera, fintas repetidas, cancelación e interrupción: recuperación e input
      disponibles, sin bloqueo ni acumulación imposible de movimientos.
- [ ] Las señales READ/HOLD/COMMIT siguen siendo legibles a velocidad natural.
- [ ] Cinco tiros y reinicio funcionan; cada parada tiene contacto físico.
- [ ] Probar móvil real en vertical y horizontal, fluidez, visibilidad y comodidad.

Guardar éxitos y fallos, sin repetir automáticamente hasta obtener un aprobado.
La aceptación final requiere la revisión humana de estos puntos; las capturas y
la emulación táctil no la sustituyen.

No publiques trazas humanas ni datos de calibración. Describe el dispositivo, navegador, gesto esperado y resultado observado.
