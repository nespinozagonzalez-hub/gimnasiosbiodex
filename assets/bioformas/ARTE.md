# Arte y orientación

Los 33 IDs tienen una entrada en `manifest.js`. Doce usan sprites pixel art en tres atlas de 2 × 2; los otros 21 reutilizan los PNG transparentes existentes de `assets/cutouts/`. No se sustituyen los archivos originales de BioDex.

- `pixel-a.png`: B001 Nimbel, B004 Lunor, B008 Nexora, B010 Terral.
- `pixel-b.png`: B014 Zephor, B019 Altor, B023 Caelix, B024 Nuvora.
- `pixel-c.png`: B003 Prismara, B013 Myrka, B015 Spirel, B016 Embera.

Todos los sprites seleccionados tienen orientación nativa hacia la derecha. El renderizador consulta el manifiesto: jugador hacia la derecha, rival hacia la izquierda. La orientación se aplica también al consultar fichas y al relevar. Las imágenes de respaldo de Lunor y Zephor tienen orientación original hacia la izquierda y se invierten cuando corresponde.

Los dos primeros atlas proceden de la preview aprobada. El tercer atlas se generó con la herramienta integrada de imágenes a partir de los cuatro PNG originales para corregir sus poses frontales. Se conserva el canal alfa generado. La comparación lateral se encuentra en el Atlas táctico de la interfaz.

## Prompt del atlas C

Use case: style-transfer. Asset: ONE square 2x2 sprite atlas for BioDex RPG, four equal cells and transparent gutters, true transparent background, no text. Adapt these four reference creatures to crisp detailed pixel art RPG sprites, preserve their recognizable identities/colors. ALL FOUR are SIDE PROFILE FACING RIGHT, eyes/gaze and head toward RIGHT edge. Never front-facing. Top left: reference1 Prismara the floating golden prismatic crystal mage; show angular side helmet facing right and crystal orbit. Top right: reference2 Myrka round purple creature with lime tips, one prominent turquoise eye visible on its RIGHT-facing profile, tiny mouth faces right. Bottom left: reference3 Spirel tall purple mushroom spirit with cream cap and green lanterns, pointed face in profile toward right. Bottom right: reference4 Embera amber teardrop slime with green bubbles and inner light; one big eye and nose/muzzle silhouette toward right. Each centered full-body in its own quarter, generous transparent margins, all body parts stay inside cell. Uniform pixel density, clean dark outline, limited colors, no shadows/background/floor/grid/borders/labels.
