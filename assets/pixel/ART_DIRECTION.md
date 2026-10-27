# BioDex · Dirección pixel art 2.6

Los fondos rodean el dispositivo FIELD-02. Sus detalles se concentran en los lados
para que el contenido central siga siendo legible. Las ilustraciones originales
de criaturas, avatares, territorios y refugio permanecen intactas.

## Recursos finales

| Archivo | Uso |
| --- | --- |
| `assets/pixel/bosque.webp` | Bosque y montañas al amanecer |
| `assets/pixel/prisma.webp` | Lago cristalino y montañas azules |
| `assets/pixel/bruma.webp` | Bosque de niebla y faroles |
| `assets/pixel/arcana.webp` | Cumbres al anochecer y cristales |
| `assets/pixel/favicon.svg` | Lente FIELD-02 en la pestaña y la cabecera |
| `assets/pixel/favicon-32.png` | Respaldo PNG de 32 px |
| `assets/pixel/apple-touch-icon.png` | Icono de 180 px |
| `assets/fonts/VT323-Regular.ttf` | Tipografía local de títulos y controles |
| `assets/fonts/OFL-VT323.txt` | Licencia de VT323 |

Los cuatro paisajes se generaron con la herramienta integrada imagegen y se
optimizaron a WebP sin reemplazar arte existente. El icono es vectorial y nativo
de la interfaz; `tools/build-pixel-icons.py` reproduce SVG y PNG. La fuente VT323
se obtuvo del repositorio oficial Google Fonts y se distribuye con su licencia.
No se solicitan fuentes a servicios externos al abrir el juego.

## Prompts finales de los fondos

El prompt utilizado para cada paisaje es la plantilla siguiente, sustituyendo
`{scene}` por la escena correspondiente:

```text
Create one landscape bitmap game background asset for the BioDex FIELD-02 browser game. Wide panoramic 16:9 composition, refined authentic 16-bit pixel art with visible deliberate square pixel clusters and a limited coherent palette, no smooth painterly blending. Scene: {scene}. This is an outer webpage background surrounding a large central handheld-console UI that will cover the middle 65 percent. Put the richest environmental details at the OUTER 15 percent on each side and bottom corners, keep the center airy, quiet and low contrast with clear atmospheric depth. Build foreground silhouettes, midground terrain and distant sky, restful fantasy exploration mood. Crisp readable shapes, beautiful restrained dithering, preserve natural color variation without noisy tiny detail. No characters, creatures, UI, devices, words, lettering, logos or watermark. Landscape art only. Palette complements ivory hardware, deep forest green panels and muted golden buttons.
```

- Bosque: `an emerald forest at golden dawn, layered trees framing the far left and far right, a small winding stream and ancient mossy stone steps at the lower edges, pale warm sky and distant blue green mountains in the quiet middle`
- Prisma: `a turquoise crystal lake with willow and pine trees framing both outer edges, small glowing crystal rocks at the bottom corners, distant lavender blue mountains, a peach and pale turquoise sky, broad calm open water in the middle`
- Bruma: `a mysterious tranquil woodland station among ferns and mist, dark pine trees framing both outer edges, small copper lanterns near the outer bottom corners, receding layered teal forests and a muted mint sky, calm low contrast open foggy valley in the middle`
- Arcana: `a serene mountain pass under a deep indigo and plum twilight sky, pixel stars, tall violet mountains framing the outer edges, warm amber crystals and wild plants at the lower corners, a distant pale moon and layered cool mountains at center`
