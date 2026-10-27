# Liga BioDex · los cinco sellos

Ruta pública: https://nespinozagonzalez-hub.github.io/gimnasiosbiodex/index.html

Mesa de preparación: https://nespinozagonzalez-hub.github.io/gimnasiosbiodex/revision.html

## Estado

Cinco gimnasios con líderes, escenarios, tres escenas de historia y dos fases. Cada banco contiene exactamente 30 espacios pendientes (`draft`, `placeholder: true`). La vista estudiantil no presenta rótulos de maqueta ni ofrece preguntas provisionales: permite conectar la colección y activar destinos, que muestran «Actividad próximamente» hasta publicar sus 30 preguntas. La preparación docente se conserva en `revision.html`, con enlace `preview=1` y premios desactivados.

## Ruta y recompensas

| Orden | Sector original | Gimnasio | Líder | Bioformas al vencer |
|---|---|---|---|---|
| 1 | Sector Aurora (S01) | Estación Prismara | Ayla | Auralis, Prismara, Lunor, Orbelix |
| 2 | Santuario Prisma (S02) | Cámara Solvian | Lior | Solvian, Vireon, Nexora, Clyrion |
| 3 | Distrito Nexo (S03) | Cueva Aegira | Nara | Terral, Valtrix, Aegira, Myrka |
| 4 | Muralla Nova (S04) | Horno Cylar | Brann | Zephor, Spirel, Embera, Cylar |
| 5 | Laboratorio Bruma (S05) | Fosa Velion | Mara | Altor, Dravik, Velion, Umbrin |

Las cuatro recompensas de cada gimnasio pertenecen al sector que muestra el atlas actual; son 20 IDs distintos. Nimbel se conserva como criatura inicial del recorrido si ya está capturado en la cuenta; no se entrega automáticamente al ingresar. Los premios no sustituyen capturas anteriores ni reservan exclusividad: si el alumno ya tiene una bioforma, BioDex reconoce el código como duplicado. Las tres mega legendarias no forman parte de esta ruta.

### Códigos existentes

#### Estación Prismara · Sector Aurora

- B002 Auralis: `CAP-AURALIS-216`
- B003 Prismara: `CAP-PRISMARA-337`
- B004 Lunor: `CAP-LUNOR-441`
- B005 Orbelix: `CAP-ORBELIX-512`

#### Cámara Solvian · Santuario Prisma

- B006 Solvian: `CAP-SOLVIAN-633`
- B007 Vireon: `CAP-VIREON-745`
- B008 Nexora: `CAP-NEXORA-856`
- B009 Clyrion: `CAP-CLYRION-967`

#### Cueva Aegira · Distrito Nexo

- B010 Terral: `CAP-TERRAL-178`
- B011 Valtrix: `CAP-VALTRIX-289`
- B012 Aegira: `CAP-AEGIRA-390`
- B013 Myrka: `CAP-MYRKA-402`

#### Horno Cylar · Muralla Nova

- B014 Zephor: `CAP-ZEPHOR-513`
- B015 Spirel: `CAP-SPIREL-624`
- B016 Embera: `CAP-EMBERA-735`
- B017 Cylar: `CAP-CYLAR-846`

#### Fosa Velion · Laboratorio Bruma

- B019 Altor: `CAP-ALTOR-167`
- B020 Dravik: `CAP-DRAVIK-278`
- B021 Velion: `CAP-VELION-389`
- B022 Umbrin: `CAP-UMBRIN-490`

## Reglas del reloj

- 45 segundos por defecto; cada pregunta admite `seconds` entre 5 y 600. Ajustar el tiempo al texto, las imágenes y las necesidades del curso.
- El tiempo empieza al abrir la pregunta. Se puede elegir una alternativa y luego confirmar; hay que confirmar antes del límite.
- Al agotarse, se consume la pregunta una sola vez, falla la acción y se ejecuta el movimiento anunciado del rival. Ese movimiento puede ser ataque, carga o escudo.
- Cambiar de estrategia conserva la misma pregunta, el orden de alternativas, la selección y la fecha límite.
- Cambiar de pestaña no pausa el reloj. Al regresar se comprueba la fecha límite, incluso si el navegador suspendió temporalmente sus callbacks.
- Después de confirmar, el reloj se detiene y se puede leer la explicación sin presión.
- Solo la preparación docente ofrece la opción sin reloj. El acceso estudiantil siempre usa el tiempo configurado.
- El banco se baraja sin repeticiones dentro del intento. La victoria puede llegar antes de usar las 30 preguntas; si se agotan sin vencer, finaliza el intento.

## Qué falta para publicar contenido real

1. Reemplazar las 30 preguntas de `bancos/liga/aurora.json` (o el archivo correspondiente). La mesa permite editarlas, importarlas y descargarlas.
2. Cada pregunta necesita `id`, `topic`, `stem`, cuatro `options`, `answer` de 0 a 3, `explain` y `placeholder: false`. `seconds` y `figure` son opcionales.
3. Para una imagen: `figure: {src: "imagenes/neurona-01.webp", alt: "Esquema de una neurona"}`. Colocar el archivo en `imagenes/`.
4. Cuando las 30 sean definitivas, cambiar `status` a `published` y aumentar `version` si se reemplaza un banco ya utilizado. El validador rechaza bancos incompletos, preguntas con índices inválidos y publicaciones con espacios de ensayo.
5. Reemplazar solo ese JSON. Los enlaces, la historia y el motor seguirán funcionando. No se necesitan cambios en Apps Script.

Para pasarme preguntas basta con: enunciado, alternativas A–D, correcta y explicación, agrupadas por gimnasio. Tiempo sugerido e imagen son opcionales.

## Recompensas y datos

Una victoria permite capturas reales solo cuando el banco está publicado y el jugador usó su cuenta. Las cuatro recompensas se canjean automáticamente, en serie, mediante el servicio existente. Cada bioforma necesita confirmación del servidor antes de mostrarse como recibida. Ante un fallo de conexión hay reintento individual o de premios pendientes; los duplicados se reconocen sin añadir otra copia. El equipo prestado de preparación nunca recibe capturas reales.

La conexión usa `login`, `load`, `redeem` y `logout`. No cambia el script, sus tablas, el endpoint ni sube snapshots del navegador. El PIN se borra. La sesión se comparte con BioDex mediante la clave existente de `sessionStorage` y siempre se valida con `load` al entrar. Los enlaces a BioDex navegan en la misma pestaña para recuperar esa sesión y consultar la colección recién guardada.

Cada destino tiene un código `LIGA-*`, documentado en README y distinto de los códigos GYM del gestor. Las activaciones y los sellos se recuerdan por nombre en este navegador. Desde otro equipo se vuelve a introducir el código. Este registro local no es una acreditación del servidor.

## Alcance de las medidas contra ayuda externa

El tiempo, las preguntas/alternativas aleatorias, el bloqueo de copiar/seleccionar/arrastrar dentro de la pregunta, la restricción de impresión y la marca de explorador dificultan sacar contenido rápidamente. Se conservan los botones, el teclado y el texto accesible para lectores de pantalla. Una web no puede impedir capturas del sistema, fotografías, lectura con otra herramienta ni colaboración externa. Tampoco se bloquean herramientas de accesibilidad.

Esta implementación no verifica victorias en el servidor. Los códigos de captura son compartidos y están en un repositorio público; pueden reenviarse o encontrarse en el código. Para acreditación fiable, recompensas individuales o evaluación formal se necesitaría un servicio que valide intentos y emita premios, ampliación que este proyecto no incorpora.

## Archivos

- `index.html`, `liga-hub.js`, `liga.css`: portal de cinco gimnasios.
- `combate.html?gym=aurora` (o `prisma`, `nexo`, `nova`, `bruma`): acceso, colección, historia y combate.
- `liga-config.js`: ruta, líderes, fases y recompensas.
- `league-loader.js`: carga y valida el banco antes de iniciar el motor.
- `motor/league.js`: reglas de publicación, premios y registro local.
- `account.js`: sesión y operaciones del servicio BioDex.
- `motor/access.js`: activación de los cinco destinos por código.
- `motor/rewards.js`: canje confirmado, duplicados y reintentos.
- `revision.html`, `revision.js`: mesa de preparación e importación/exportación.
- `ensayo.html`: se conserva el ensayo original del Umbral, con enlace a la nueva liga.

## Validación

`node --test tests/*.test.cjs`

Las pruebas comprueban reloj estricto, consumo único, 30 preguntas sin repetición, publicación y premios, correspondencia de los 20 códigos con el backend original, pertenencia al sector y victoria posible en los cinco gimnasios, sesiones compartidas, accesos por código, canjes en serie, fallos parciales y recuperación de respuestas perdidas.
