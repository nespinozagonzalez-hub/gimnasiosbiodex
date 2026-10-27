# Gimnasios personales de BioDex

Liga de los cinco sellos para los cursos de Nicolás Espinoza. Las batallas y sus preguntas se mantienen en este repositorio independiente de la BioDex distribuida como gestor.

## Entradas

- `index.html`: liga de los cinco gimnasios.
- `combate.html?gym=aurora`, `prisma`, `nexo`, `nova` o `bruma`: gimnasio independiente.
- `revision.html`: mesa de preparación de preguntas y recompensas.
- `revision-tablet.html`: revisión en tablet horizontal, vertical y PC.
- `ensayo.html`: prototipo original del Umbral.

## Conexión con la colección

`config.js` conserva el endpoint de la BioDex personal actual y define una URL absoluta para volver a ella. El acceso usa el nombre y PIN existentes; consulta las bioformas de la cuenta. No se trasladan cuentas, contraseñas, datos de estudiantes ni scripts de Google Sheets. Los códigos de recompensa se canjean en la BioDex habitual.

Todos los sprites, PNG, fondos, retratos y fuentes que requiere el juego están copiados en `assets/`. El sitio no carga archivos desde el repositorio del producto para dibujar las batallas.

## Preguntas y recompensas

Cada archivo de `bancos/liga/` tiene 30 espacios de ensayo. Para activarlo, se reemplazan las preguntas, se marca cada una como definitiva y se cambia el banco a `published`. Los ensayos muestran cuatro recompensas simuladas. Las cuentas reales con bancos publicados reciben los cuatro códigos existentes tras vencer.

La edición de estos archivos solo afecta a esta liga. La mesa de preparación edita y descarga archivos de este proyecto; no es un editor compartido para clientes del gestor. El registro de sellos se guarda localmente y los códigos son compartidos. Este repositorio es público; no proporciona aislamiento de datos entre docentes ni validación de victorias en servidor.

## Publicación

En GitHub, abrir **Settings → Pages → Deploy from a branch → main → / (root) → Save**. El archivo `.nojekyll` permite servir directamente los recursos estáticos. No hay instalación ni compilación del juego.

Al habilitar Pages, la dirección esperada es `https://nespinozagonzalez-hub.github.io/gimnasiosbiodex/`.

## Pruebas

```bash
node --test tests/*.test.cjs
```

Las pruebas cubren el motor, el reloj, los cinco bancos, las recompensas y las rutas de recursos después del traslado. `reference/biodex.json` conserva únicamente la correspondencia pública de sectores, IDs y códigos para comprobar la compatibilidad; no es una conexión a datos de alumnos.

La ruta y sus recompensas están descritas en [LIGA_CINCO_SELLOS.md](LIGA_CINCO_SELLOS.md). El motor original se documenta en [MOTOR.md](MOTOR.md).
