# Gimnasios BioDex · motor 1.0

Prueba independiente: https://nespinozagonzalez-hub.github.io/gimnasiosbiodex/ensayo.html

## Organización

- `motor/combat.js`: combate determinista, afinidades, habilidades, pasivas, efectos, fases y relevos. No realiza peticiones de red.
- `motor/roster.js`: fichas de las 33 bioformas y tabla de afinidades.
- `motor/questions.js`: presentación, aleatorización, calificación y resolución de un solo uso. Admite otro banco como segundo argumento de `create`.
- `motor/renderer.js`: personajes enfrentados, proyectiles, impactos y escudos.
- `misiones/umbral.js`: ejemplo de misión, historia, fases y movimientos del jefe.
- `bancos/umbral.js`: 16 preguntas originales de ensayo sobre lectura crítica y evidencia.
- `assets/bioformas/manifest.js`: arte y orientación nativa de las 33 bioformas.
- `HABILIDADES.md`: tabla completa de habilidades, pasivas y estadísticas de combate.

El Atlas táctico de la interfaz permite buscar las 33 bioformas, comparar afinidades y ver las poses de ambos lados.

## Acceso y datos existentes

La página usa `config.js`, el mismo endpoint publicado de BioDex. Solo envía `login`, `load` y `logout`. Usa el nombre y PIN de la cuenta existente; la respuesta `progreso.capturadas` determina las bioformas seleccionables. El PIN se borra del formulario y el token permanece en memoria de la pestaña. No se añaden sesiones a localStorage ni sessionStorage.

El login puede registrar una sesión y datos de acceso en el backend existente; no cambia las capturas. La batalla no envía estadísticas, ganadores, recompensas ni snapshots de progreso a Google Sheets. No se ha cambiado el script ni el esquema de datos.

El modo de ensayo presta las 33 bioformas y se identifica como tal. Una cuenta vacía debe capturar primero una bioforma o salir para usar el ensayo. El refresco vuelve a consultar la colección sin inventar desbloqueos.

## Reglas

Selecciona 1–3 bioformas; la primera entra en campo. Ataque, habilidad y defensa requieren responder. Un error no ejecuta la acción; un intento de ataque devuelve 1 de energía, pero una habilidad fallida no consume sus 2 puntos. La explicación se muestra antes de la respuesta rival.

La afinidad modifica el daño de ambos bandos. La defensa y las protecciones de habilidad esperan al próximo golpe; no desaparecen durante una carga. Cambiar voluntariamente consume un turno; el relevo obligatorio es gratuito. Curar no revive aliados caídos. El escudo de un jefe absorbe daño salvo perforación. Los efectos de marca, eco y debilidad se retiran al cambiar de fase. Si un eco derrota al jefe después de que caiga todo el equipo, prevalece la derrota del equipo.

Las estadísticas originales se transforman en rangos acotados para el ensayo (vida, ataque, defensa). La etapa y la rareza no entregan una victoria automática. Cada habilidad conserva el nombre de la BioDex; su efecto de combate está definido aquí.

## Crear otra misión

1. Crear una configuración en `misiones/` con `id`, `phases` y sus movimientos. El motor admite una o varias fases.
2. Crear su banco de preguntas en `bancos/`, con IDs únicos, cuatro opciones, índice correcto y explicación.
3. Crear su página tomando esta interfaz como base y apuntar a la configuración y banco nuevos, manteniendo las rutas compartidas del motor. Adaptar los textos de historia, imágenes y recompensa al nuevo líder.
4. Iniciar el combate con `BattleEngine.create(equipo, configuracion)` y el banco con `MissionQuestions.create(undefined, banco)`. El motor y las cuentas se reutilizan.

## Recompensas de esta prueba

El emblema solo existe en la partida actual. Las victorias se calculan en el navegador y no son una acreditación validada por el servidor. Para premios reales puede usarse el canje actual de códigos entregados por el docente; una acreditación automática confiable necesita una ampliación del servidor o un servicio de misiones separado.

## Verificar

Desde la raíz del repositorio: `node --test tests/*.test.cjs`.

No contiene dependencias ni una etapa de compilación. GitHub Pages sirve esta carpeta junto al sitio actual.

## Interfaz 1.1

Las preguntas y explicaciones se presentan en una ventana sobre la arena, con acciones siempre visibles. Antes de confirmar se puede volver a elegir estrategia; esto conserva la misma pregunta pendiente y no avanza el turno. El panel de preparación acompaña al desplazamiento y presenta el acceso al gimnasio justo debajo del equipo; en pantallas estrechas existe un acceso inferior fijo. En tablet y PC, la arena y los comandos comparten una vista compacta y la información táctica lateral puede desplazarse de forma independiente.
