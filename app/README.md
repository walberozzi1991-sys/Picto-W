# PICTO W

Aplicación web que transforma descripciones de acciones y rutinas
en secuencias visuales mediante inteligencia artificial.

## Qué hace

El usuario escribe una rutina con sus propias palabras.

Ejemplo:

"Mañana me levanto, me lavo los dientes, me visto,
preparo la mochila y voy a la escuela."

PICTO W interpreta el texto y lo transforma en pasos:

1. Levantarse
2. Lavarse los dientes
3. Vestirse
4. Preparar la mochila
5. Ir a la escuela

Después genera un pictograma individual para cada acción.

## Estilo visual

Los pictogramas utilizan un estilo visual propio:

- blanco y negro
- fondo blanco
- figuras humanas simples
- cabezas circulares blancas con contorno negro
- líneas negras uniformes
- alto contraste
- pocos elementos
- una acción por pictograma
- sin texto dentro de la imagen
- sin logos
- sin marcas comerciales
- sin personajes reconocibles
- sin sombras
- sin degradados
- sin texturas
- sin elementos decorativos innecesarios

El objetivo es crear una biblioteca visual consistente y propia.

## Tecnología

- Next.js
- React
- Vercel
- GitHub
- Gemini API
- Gemini 3.1 Flash Lite para interpretar las rutinas
- Gemini 3.1 Flash Image para generar imágenes

## Estructura

```text
Picto-W/
│
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.js
│   │   │
│   │   └── generate-pictogram/
│   │       └── route.js
│   │
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
