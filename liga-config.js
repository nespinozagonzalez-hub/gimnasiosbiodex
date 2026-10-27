(function(root){
'use strict';
const GYMS=[
  {
    "slug": "aurora",
    "entryCode": "LIGA-AURORA-742",
    "id": "liga-aurora",
    "order": 1,
    "title": "Estación Prismara",
    "subtitle": "El primer horizonte",
    "sectorId": "S01",
    "sector": "Sector Aurora",
    "leader": "Ayla",
    "leaderTitle": "Guardiana del alba",
    "subject": "Desafío de 2.º medio",
    "portrait": "assets/avatars/aurora.png",
    "portraitSheet": false,
    "background": "assets/territories/S01.webp",
    "landscape": "assets/pixel/bosque.webp",
    "questionSeconds": 45,
    "bankUrl": "bancos/liga/aurora.json",
    "emblem": "Sello de Aurora",
    "summary": "Aquí comienza la ruta. Entre puentes de musgo y faroles, Ayla protege el prisma que anuncia cada nuevo amanecer.",
    "phases": [
      {
        "id": "B002",
        "name": "Auralis",
        "type": "Aurora",
        "baseHp": 45,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Aurora",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 16
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Ayla",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 32
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 10
          }
        ],
        "intro": "Auralis custodia el primer sello."
      },
      {
        "id": "B003",
        "name": "Prismara",
        "type": "Aurora",
        "baseHp": 45,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Aurora",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 18
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Ayla",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 34
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 10
          }
        ],
        "intro": "Prismara custodia el último sello."
      }
    ],
    "rewards": [
      {
        "id": "B002",
        "name": "Auralis",
        "code": "CAP-AURALIS-216"
      },
      {
        "id": "B003",
        "name": "Prismara",
        "code": "CAP-PRISMARA-337"
      },
      {
        "id": "B004",
        "name": "Lunor",
        "code": "CAP-LUNOR-441"
      },
      {
        "id": "B005",
        "name": "Orbelix",
        "code": "CAP-ORBELIX-512"
      }
    ],
    "story": [
      {
        "title": "El primer horizonte.",
        "caption": "SECTOR AURORA / ESTACIÓN PRISMARA",
        "line": "Aquí comienza la ruta. Entre puentes de musgo y faroles, Ayla protege el prisma que anuncia cada nuevo amanecer. Soy Ayla. Si quieres atravesar este territorio, tendrás que combinar tus respuestas con las habilidades de tus compañeros."
      },
      {
        "title": "Cada compañero cambia la estrategia.",
        "caption": "PREGUNTAS + AFINIDADES + HABILIDADES",
        "line": "Trae hasta tres bioformas de tu colección. Elige atacar, usar una habilidad o defender. Una respuesta correcta activa la acción; un error permite que el rival responda. Consulta el Atlas táctico para combinar afinidades, curación y protección."
      },
      {
        "title": "El sello responde a tu decisión.",
        "caption": "UN RELOJ PARA CADA DESAFÍO",
        "line": "Tendrás 45 segundos por pregunta, salvo que la pregunta indique otro tiempo. Al agotarse, tu acción falla y el rival continúa. El reloj sigue aunque cambies de estrategia o pestaña. Hay un banco de 30 preguntas, sin repeticiones en cada intento. Esta maqueta usa preguntas de ensayo y recompensas simuladas."
      }
    ]
  },
  {
    "slug": "prisma",
    "entryCode": "LIGA-PRISMA-385",
    "id": "liga-prisma",
    "order": 2,
    "title": "Cámara Solvian",
    "subtitle": "Los espejos del lago",
    "sectorId": "S02",
    "sector": "Santuario Prisma",
    "leader": "Lior",
    "leaderTitle": "Custodio del reflejo",
    "subject": "Desafío de 2.º medio",
    "portrait": "assets/avatars/prisma.png",
    "portraitSheet": false,
    "background": "assets/territories/S02.webp",
    "landscape": "assets/pixel/prisma.webp",
    "questionSeconds": 45,
    "bankUrl": "bancos/liga/prisma.json",
    "emblem": "Sello de Prisma",
    "summary": "Los cristales del santuario dividen la luz. Lior te espera en una cámara donde elegir el ángulo correcto cambia el encuentro.",
    "phases": [
      {
        "id": "B006",
        "name": "Solvian",
        "type": "Prisma",
        "baseHp": 48,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Prisma",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 17
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Lior",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 33
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 11
          }
        ],
        "intro": "Solvian custodia el primer sello."
      },
      {
        "id": "B009",
        "name": "Clyrion",
        "type": "Nexo",
        "baseHp": 48,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Prisma",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 19
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Lior",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 35
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 11
          }
        ],
        "intro": "Clyrion custodia el último sello."
      }
    ],
    "rewards": [
      {
        "id": "B006",
        "name": "Solvian",
        "code": "CAP-SOLVIAN-633"
      },
      {
        "id": "B007",
        "name": "Vireon",
        "code": "CAP-VIREON-745"
      },
      {
        "id": "B008",
        "name": "Nexora",
        "code": "CAP-NEXORA-856"
      },
      {
        "id": "B009",
        "name": "Clyrion",
        "code": "CAP-CLYRION-967"
      }
    ],
    "story": [
      {
        "title": "Los espejos del lago.",
        "caption": "SANTUARIO PRISMA / CÁMARA SOLVIAN",
        "line": "Los cristales del santuario dividen la luz. Lior te espera en una cámara donde elegir el ángulo correcto cambia el encuentro. Soy Lior. Si quieres atravesar este territorio, tendrás que combinar tus respuestas con las habilidades de tus compañeros."
      },
      {
        "title": "Cada compañero cambia la estrategia.",
        "caption": "PREGUNTAS + AFINIDADES + HABILIDADES",
        "line": "Trae hasta tres bioformas de tu colección. Elige atacar, usar una habilidad o defender. Una respuesta correcta activa la acción; un error permite que el rival responda. Consulta el Atlas táctico para combinar afinidades, curación y protección."
      },
      {
        "title": "El sello responde a tu decisión.",
        "caption": "UN RELOJ PARA CADA DESAFÍO",
        "line": "Tendrás 45 segundos por pregunta, salvo que la pregunta indique otro tiempo. Al agotarse, tu acción falla y el rival continúa. El reloj sigue aunque cambies de estrategia o pestaña. Hay un banco de 30 preguntas, sin repeticiones en cada intento. Esta maqueta usa preguntas de ensayo y recompensas simuladas."
      }
    ]
  },
  {
    "slug": "nexo",
    "entryCode": "LIGA-NEXO-916",
    "id": "liga-nexo",
    "order": 3,
    "title": "Cueva Aegira",
    "subtitle": "El pacto de los caminos",
    "sectorId": "S03",
    "sector": "Distrito Nexo",
    "leader": "Nara",
    "leaderTitle": "Guardiana de los puentes",
    "subject": "Desafío de 2.º medio",
    "portrait": "assets/avatars/nexo.png",
    "portraitSheet": false,
    "background": "assets/territories/S03.webp",
    "landscape": "assets/pixel/bosque.webp",
    "questionSeconds": 45,
    "bankUrl": "bancos/liga/nexo.json",
    "emblem": "Sello de Nexo",
    "summary": "Nara custodia la conexión entre las torres. Su equipo resiste los golpes: coordina tus habilidades para atravesar sus defensas.",
    "phases": [
      {
        "id": "B011",
        "name": "Valtrix",
        "type": "Nova",
        "baseHp": 51,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Nexo",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 18
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Nara",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 34
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 12
          }
        ],
        "intro": "Valtrix custodia el primer sello."
      },
      {
        "id": "B012",
        "name": "Aegira",
        "type": "Nova",
        "baseHp": 51,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Nexo",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 20
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Nara",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 36
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 12
          }
        ],
        "intro": "Aegira custodia el último sello."
      }
    ],
    "rewards": [
      {
        "id": "B010",
        "name": "Terral",
        "code": "CAP-TERRAL-178"
      },
      {
        "id": "B011",
        "name": "Valtrix",
        "code": "CAP-VALTRIX-289"
      },
      {
        "id": "B012",
        "name": "Aegira",
        "code": "CAP-AEGIRA-390"
      },
      {
        "id": "B013",
        "name": "Myrka",
        "code": "CAP-MYRKA-402"
      }
    ],
    "story": [
      {
        "title": "El pacto de los caminos.",
        "caption": "DISTRITO NEXO / CUEVA AEGIRA",
        "line": "Nara custodia la conexión entre las torres. Su equipo resiste los golpes: coordina tus habilidades para atravesar sus defensas. Soy Nara. Si quieres atravesar este territorio, tendrás que combinar tus respuestas con las habilidades de tus compañeros."
      },
      {
        "title": "Cada compañero cambia la estrategia.",
        "caption": "PREGUNTAS + AFINIDADES + HABILIDADES",
        "line": "Trae hasta tres bioformas de tu colección. Elige atacar, usar una habilidad o defender. Una respuesta correcta activa la acción; un error permite que el rival responda. Consulta el Atlas táctico para combinar afinidades, curación y protección."
      },
      {
        "title": "El sello responde a tu decisión.",
        "caption": "UN RELOJ PARA CADA DESAFÍO",
        "line": "Tendrás 45 segundos por pregunta, salvo que la pregunta indique otro tiempo. Al agotarse, tu acción falla y el rival continúa. El reloj sigue aunque cambies de estrategia o pestaña. Hay un banco de 30 preguntas, sin repeticiones en cada intento. Esta maqueta usa preguntas de ensayo y recompensas simuladas."
      }
    ]
  },
  {
    "slug": "nova",
    "entryCode": "LIGA-NOVA-528",
    "id": "liga-nova",
    "order": 4,
    "title": "Horno Cylar",
    "subtitle": "La fortaleza del crepúsculo",
    "sectorId": "S04",
    "sector": "Muralla Nova",
    "leader": "Brann",
    "leaderTitle": "Custodio de la forja",
    "subject": "Desafío de 2.º medio",
    "portrait": "assets/avatars/terra.png",
    "portraitSheet": false,
    "background": "assets/territories/S04.webp",
    "landscape": "assets/pixel/arcana.webp",
    "questionSeconds": 45,
    "bankUrl": "bancos/liga/nova.json",
    "emblem": "Sello de Nova",
    "summary": "Tras la muralla, Brann mantiene encendida una antigua forja. Lee las señales de sus bioformas y decide cuándo proteger a tu equipo.",
    "phases": [
      {
        "id": "B015",
        "name": "Spirel",
        "type": "Bruma",
        "baseHp": 54,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Nova",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 19
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Brann",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 35
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 13
          }
        ],
        "intro": "Spirel custodia el primer sello."
      },
      {
        "id": "B017",
        "name": "Cylar",
        "type": "Lumen",
        "baseHp": 54,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Nova",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 21
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Brann",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 37
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 13
          }
        ],
        "intro": "Cylar custodia el último sello."
      }
    ],
    "rewards": [
      {
        "id": "B014",
        "name": "Zephor",
        "code": "CAP-ZEPHOR-513"
      },
      {
        "id": "B015",
        "name": "Spirel",
        "code": "CAP-SPIREL-624"
      },
      {
        "id": "B016",
        "name": "Embera",
        "code": "CAP-EMBERA-735"
      },
      {
        "id": "B017",
        "name": "Cylar",
        "code": "CAP-CYLAR-846"
      }
    ],
    "story": [
      {
        "title": "La fortaleza del crepúsculo.",
        "caption": "MURALLA NOVA / HORNO CYLAR",
        "line": "Tras la muralla, Brann mantiene encendida una antigua forja. Lee las señales de sus bioformas y decide cuándo proteger a tu equipo. Soy Brann. Si quieres atravesar este territorio, tendrás que combinar tus respuestas con las habilidades de tus compañeros."
      },
      {
        "title": "Cada compañero cambia la estrategia.",
        "caption": "PREGUNTAS + AFINIDADES + HABILIDADES",
        "line": "Trae hasta tres bioformas de tu colección. Elige atacar, usar una habilidad o defender. Una respuesta correcta activa la acción; un error permite que el rival responda. Consulta el Atlas táctico para combinar afinidades, curación y protección."
      },
      {
        "title": "El sello responde a tu decisión.",
        "caption": "UN RELOJ PARA CADA DESAFÍO",
        "line": "Tendrás 45 segundos por pregunta, salvo que la pregunta indique otro tiempo. Al agotarse, tu acción falla y el rival continúa. El reloj sigue aunque cambies de estrategia o pestaña. Hay un banco de 30 preguntas, sin repeticiones en cada intento. Esta maqueta usa preguntas de ensayo y recompensas simuladas."
      }
    ]
  },
  {
    "slug": "bruma",
    "entryCode": "LIGA-BRUMA-263",
    "id": "liga-bruma",
    "order": 5,
    "title": "Fosa Velion",
    "subtitle": "El último farol",
    "sectorId": "S05",
    "sector": "Laboratorio Bruma",
    "leader": "Mara",
    "leaderTitle": "Guardiana de la niebla",
    "subject": "Desafío de 2.º medio",
    "portrait": "assets/iria-pixel.png",
    "portraitSheet": true,
    "background": "assets/territories/S05.webp",
    "landscape": "assets/pixel/bruma.webp",
    "questionSeconds": 45,
    "bankUrl": "bancos/liga/bruma.json",
    "emblem": "Sello de Bruma",
    "summary": "Entre invernaderos y canales, Mara guarda el último sello de esta ruta. Observa los movimientos que emergen de la niebla y conserva tu vínculo.",
    "phases": [
      {
        "id": "B020",
        "name": "Dravik",
        "type": "Vector",
        "baseHp": 57,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Bruma",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 20
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Mara",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 36
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 14
          }
        ],
        "intro": "Dravik custodia el primer sello."
      },
      {
        "id": "B022",
        "name": "Umbrin",
        "type": "Umbral",
        "baseHp": 57,
        "hpPerAlly": 14,
        "moves": [
          {
            "name": "Pulso de Bruma",
            "hint": "Un golpe directo. La cifra estima el daño a tu bioforma activa.",
            "kind": "attack",
            "power": 22
          },
          {
            "name": "Concentración del sello",
            "hint": "El rival concentra energía. Preparar una defensa protege la próxima oleada.",
            "kind": "charge",
            "power": 0
          },
          {
            "name": "Oleada de Mara",
            "hint": "Ataque potente anunciado. Puedes defender o usar protección.",
            "kind": "attack",
            "power": 38
          },
          {
            "name": "Barrera del territorio",
            "hint": "El rival preparará un escudo. Algunas habilidades lo atraviesan.",
            "kind": "shield",
            "power": 0,
            "shield": 14
          }
        ],
        "intro": "Umbrin custodia el último sello."
      }
    ],
    "rewards": [
      {
        "id": "B019",
        "name": "Altor",
        "code": "CAP-ALTOR-167"
      },
      {
        "id": "B020",
        "name": "Dravik",
        "code": "CAP-DRAVIK-278"
      },
      {
        "id": "B021",
        "name": "Velion",
        "code": "CAP-VELION-389"
      },
      {
        "id": "B022",
        "name": "Umbrin",
        "code": "CAP-UMBRIN-490"
      }
    ],
    "story": [
      {
        "title": "El último farol.",
        "caption": "LABORATORIO BRUMA / FOSA VELION",
        "line": "Entre invernaderos y canales, Mara guarda el último sello de esta ruta. Observa los movimientos que emergen de la niebla y conserva tu vínculo. Soy Mara. Si quieres atravesar este territorio, tendrás que combinar tus respuestas con las habilidades de tus compañeros."
      },
      {
        "title": "Cada compañero cambia la estrategia.",
        "caption": "PREGUNTAS + AFINIDADES + HABILIDADES",
        "line": "Trae hasta tres bioformas de tu colección. Elige atacar, usar una habilidad o defender. Una respuesta correcta activa la acción; un error permite que el rival responda. Consulta el Atlas táctico para combinar afinidades, curación y protección."
      },
      {
        "title": "El sello responde a tu decisión.",
        "caption": "UN RELOJ PARA CADA DESAFÍO",
        "line": "Tendrás 45 segundos por pregunta, salvo que la pregunta indique otro tiempo. Al agotarse, tu acción falla y el rival continúa. El reloj sigue aunque cambies de estrategia o pestaña. Hay un banco de 30 preguntas, sin repeticiones en cada intento. Esta maqueta usa preguntas de ensayo y recompensas simuladas."
      }
    ]
  }
];
const api={GYMS,get:slug=>GYMS.find(g=>g.slug===slug)};
if(typeof module==='object'&&module.exports)module.exports=api;else root.BioDexGyms=api;
})(typeof window!=='undefined'?window:this);
