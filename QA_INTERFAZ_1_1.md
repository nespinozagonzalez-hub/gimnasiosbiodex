# Verificación del traslado independiente

- Fuente: BioDex, commit `8aa36575c57bb0efa56bc4a147c8d572b05f812e`.
- Destino: `nespinozagonzalez-hub/gimnasiosbiodex`.
- Se conservan los cinco gimnasios y sus cinco bancos de 30 espacios.
- El motor original del Umbral queda en `ensayo.html`.
- Todos los sprites, PNG, fondos, retratos y fuentes necesarios están copiados en este proyecto.
- Las 33 fichas resuelven su arte desde rutas locales.
- Los enlaces para canjear códigos vuelven a la URL absoluta de la BioDex original.
- El endpoint de acceso es idéntico al del proyecto original; no se incluyen scripts ni datos de Google Sheets.
- Pasan 35 pruebas: motor, reloj, afinidades, bancos, recompensas, rutas de archivos y entrada de la liga.
- No se han usado credenciales reales en las pruebas.

La publicación del nuevo sitio requiere habilitar GitHub Pages en `main` y la raíz del repositorio. Esa activación es independiente del traslado de archivos.
