# Gimnasios personales de BioDex

Liga de los cinco sellos para los cursos de Nicolás Espinoza. Las batallas y sus preguntas se mantienen en este repositorio independiente de la BioDex distribuida como gestor.

## Ligas por curso

El repositorio comparte el motor, las ilustraciones, los líderes, la sesión BioDex y las cuatro recompensas por victoria. Cada curso tiene su propio banco, sus códigos de entrada y su registro local de activaciones y sellos. Cambiar de liga conserva la colección de la cuenta, y una captura ya obtenida se reconoce como duplicada.

| Curso | Entrada | Banco | Estado |
| --- | --- | --- | --- |
| 2.º medio | `index.html` (también la raíz del sitio) | `bancos/liga/` | Publicado, 150 preguntas |
| 7.º básico | `index.html?liga=7basico` | `bancos/7basico/` | Publicado, 150 preguntas |
| 6.º básico | `index.html?liga=6basico` | Pendiente | Próximamente, sin preguntas ni combate |

El enlace de 2.º medio, sus cinco archivos de preguntas y sus códigos `LIGA-*` se conservan. Los guardados existentes siguen usando las claves anteriores. La liga de 7.º utiliza códigos `LIGA7-*` y claves locales separadas, incluso si el nombre de cuenta es el mismo. Los enlaces de combate, resultado, edición y revisión de pantalla conservan el curso seleccionado. Un curso inexistente o pendiente nunca utiliza preguntas de otra liga.

`ligas.js` registra los cursos; `course-context.js` configura la página y el selector. Para sumar 6.º se importa su Excel en una carpeta propia, se completan temas y códigos del registro y se marca esa liga como disponible. El motor y los recursos gráficos no se duplican.

### Códigos de 7.º básico

| Sector | Contenido | Código |
| --- | --- | --- |
| Aurora | Materia y gases | `LIGA7-AURORA-742` |
| Prisma | Fuerzas y sus efectos | `LIGA7-PRISMA-385` |
| Nexo | Microorganismos e inmunidad | `LIGA7-NEXO-916` |
| Nova | Pubertad y reproducción | `LIGA7-NOVA-528` |
| Bruma | Autocuidado y prevención | `LIGA7-BRUMA-263` |

Las preguntas de 7.º se importaron de `Liga_Ciencias_7Basico.xlsx`: 100 de cuatro alternativas, 50 de cinco y 50 con numerales I–IV. Se conservan los tiempos 45/60/75/90 segundos, el barajado y los cuatro premios del combate existente. Los puntajes por ronda de la hoja no generan nuevas capturas.

La importación se registra en `reference/septimo-import.json`. Incluye una corrección del ítem `7B-BRUMA-30`: el esquema escolar VPH del Excel estaba desactualizado. Se reemplazó el numeral IV por «la vacuna contra el VPH protege contra todas las ITS», que es falso, y se actualizó la explicación; la clave sigue siendo B (I y III). La corrección se contrastó el 30-10-2026 con [MINSAL, vacuna escolar VPH](https://saludresponde.minsal.cl/vacuna-escolar-contra-el-vph/). El archivo conserva el contenido original de ese ítem para revisar la diferencia.

## Entradas

- `index.html`: liga de los cinco gimnasios.
- `combate.html?gym=aurora`, `prisma`, `nexo`, `nova` o `bruma`: gimnasio independiente.
- `revision.html`: mesa de preparación de preguntas y recompensas.
- `revision-tablet.html`: revisión en tablet horizontal, vertical y PC.
- `ensayo.html`: prototipo original del Umbral.

## Conexión con la colección

`config.js` conserva el endpoint de la BioDex personal actual y define una URL absoluta para volver a ella. El acceso usa el nombre y PIN existentes; consulta las bioformas de la cuenta y su avatar. Comparte la sesión `biodex_session_v2` con BioDex mediante `sessionStorage`, sin guardar el PIN. Al navegar en la misma pestaña se recupera y valida la sesión contra el servidor; desde otra pestaña o equipo puede requerir el acceso nuevamente. Los enlaces a BioDex usan la misma pestaña para consultar la colección recién guardada. No se trasladan cuentas, contraseñas, datos de estudiantes ni scripts de Google Sheets. Al ganar una actividad publicada, las cuatro recompensas se canjean automáticamente mediante la acción `redeem` del servicio existente. Cada captura se muestra como recibida solo cuando llega la confirmación del servidor. Se puede reintentar todo el lote o una captura pendiente sin duplicar bioformas.

Todos los sprites, PNG, fondos, retratos y fuentes que requiere el juego están copiados en `assets/`. El sitio no carga archivos desde el repositorio del producto para dibujar las batallas.

## Preguntas y recompensas

Los cinco bancos de 2.º medio están publicados: 150 preguntas reales de `Liga_Celular_2doMedio.xlsx`, 30 por gimnasio. Se importaron sin cambiar sus enunciados, alternativas, claves, numerales ni retroalimentaciones. Se conservan 100 preguntas con cuatro alternativas y 50 con cinco; 50 incluyen enunciados I–IV. La procedencia y las firmas de contenido se registran en `reference/cellular-import.json`.

| Gimnasio | Contenido del Excel |
| --- | --- |
| Aurora | Ciclo celular |
| Prisma | Mitosis |
| Nexo | Meiosis y variabilidad |
| Nova | Cuando la división falla |
| Bruma | Biotecnología y edición genética |

El tiempo por pregunta es 45 s para las 12 de entrada, 60 s para las 8 de aplicación simple, 75 s para las 4 de aplicación con numerales y 90 s para las 6 de análisis. La duración real aparece en cada pregunta y no se reinicia al reconsiderar la estrategia. Los bancos se barajan sin repeticiones; una batalla puede terminar antes de usar los 30 ítems. Se conserva el premio de cuatro capturas por victoria; los puntajes por ronda de la hoja no generan capturas adicionales.

Para reemplazar contenido más adelante, se actualiza únicamente el JSON correspondiente. Cada pregunta admite cuatro o cinco alternativas, una clave dentro de ese rango y, opcionalmente, cuatro `statements` para los numerales I–IV. Se mantiene `placeholder: false` en preguntas definitivas y `status: published` cuando las 30 estén listas. La mesa de preparación permite editar la quinta alternativa y los cuatro numerales.

El estudiante conecta su cuenta e introduce un código en la liga o en la entrada del gimnasio. Los códigos personales de esta liga son distintos de los códigos GYM del gestor:

| Sector | Código de entrada |
| --- | --- |
| Aurora | `LIGA-AURORA-742` |
| Prisma | `LIGA-PRISMA-385` |
| Nexo | `LIGA-NEXO-916` |
| Nova | `LIGA-NOVA-528` |
| Bruma | `LIGA-BRUMA-263` |

Las activaciones se recuerdan por nombre en este navegador. Desde otro dispositivo se vuelve a introducir el código. Son accesos de aula en un sitio estático público, no contraseñas ni permisos privados en servidor.

La preparación docente se abre desde `revision.html`; su enlace de combate agrega `preview=1`, usa equipo prestado y mantiene las recompensas desactivadas. La portada de estudiantes no ofrece este modo ni el prototipo Umbral.

La edición de estos archivos solo afecta a esta liga. La mesa de preparación edita y descarga archivos de este proyecto; no es un editor compartido para clientes del gestor. El registro de sellos y activaciones se guarda localmente; las capturas sí quedan en la cuenta remota. Los códigos son compartidos. Este repositorio es público; no proporciona aislamiento de datos entre docentes ni validación de victorias en servidor.

## Publicación

En GitHub, abrir **Settings → Pages → Deploy from a branch → main → / (root) → Save**. El archivo `.nojekyll` permite servir directamente los recursos estáticos. No hay instalación ni compilación del juego.

Pages está habilitado. La dirección es `https://nespinozagonzalez-hub.github.io/gimnasiosbiodex/`.

## Pruebas

```bash
node --test tests/*.test.cjs
```

Las pruebas cubren el motor, el reloj, los cinco bancos, los accesos por código, la sesión compartida, canjes en serie, duplicados, fallos parciales, respuestas perdidas y las rutas de recursos. `reference/biodex.json` conserva únicamente la correspondencia pública de sectores, IDs y códigos para comprobar la compatibilidad; no es una conexión a datos de alumnos.

La ruta y sus recompensas están descritas en [LIGA_CINCO_SELLOS.md](LIGA_CINCO_SELLOS.md). El motor original se documenta en [MOTOR.md](MOTOR.md).

## Presentación

El interruptor «Letra retro» alterna VT323 con una tipografía de lectura clara y recuerda la elección en este navegador. Está disponible en la liga, el combate y la preparación docente. Los gimnasios sin activar se muestran desaturados y oscurecidos; al reconocer el código recuperan su color. Las acciones de acceso conservan su contraste y funcionan con teclado.

El fondo de gran arena y el recibimiento del explorador son ilustraciones creadas con ImageGen e integradas en `assets/ui/`. Se codificaron como WebP sin pérdida, conservando sus dimensiones y píxeles. Sus indicaciones de arte se documentan en `assets/ui/README.md`.
