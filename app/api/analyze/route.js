import { NextResponse } from "next/server";

const schema = {
  type: "object",
  properties: {
    title: {
      type: "string"
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: {
            type: "string"
          },
          label: {
            type: "string"
          },
          description: {
            type: "string"
          }
        },
        required: [
          "action",
          "label",
          "description"
        ]
      }
    }
  },
  required: [
    "title",
    "steps"
  ]
};

export async function POST(request) {
  try {

    const { text } = await request.json();

    if (
      !text ||
      typeof text !== "string" ||
      text.trim().length < 2
    ) {
      return NextResponse.json(
        {
          error: "Texto insuficiente."
        },
        {
          status: 400
        }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Falta configurar GEMINI_API_KEY en las variables de entorno."
        },
        {
          status: 500
        }
      );
    }

    const prompt = `
Sos el motor de interpretación de una aplicación
de comunicación visual.

Tu tarea es transformar el texto del usuario en
una secuencia ordenada de acciones concretas.

REGLAS:

- Separá la rutina en pasos simples.
- Una acción principal por paso.
- Conservá el orden temporal.
- No inventes acciones que no estén implícitas.
- Si una frase contiene varias acciones necesarias,
  podés separarlas.
- Usá español claro.
- "label" debe ser corto, idealmente entre
  2 y 5 palabras.
- "action" debe ser un identificador en minúsculas
  y sin puntuación.
- "description" debe describir visualmente qué
  debería mostrar un pictograma de ese paso.
- Máximo 12 pasos.
- No incluy explicaciones fuera del JSON.

TEXTO DEL USUARIO:

${text}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key":
            process.env.GEMINI_API_KEY
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            responseMimeType:
              "application/json",

            responseSchema:
              schema,

            temperature: 0.2
          }
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Error de Gemini."
        },
        {
          status: 502
        }
      );
    }

    const raw =
      data?.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (!raw) {

      return NextResponse.json(
        {
          error:
            "Gemini no devolvió una rutina."
        },
        {
          status: 502
        }
      );
    }

    const parsed =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed.steps) ||
      parsed.steps.length === 0
    ) {

      return NextResponse.json(
        {
          error:
            "No se detectaron acciones."
        },
        {
          status: 422
        }
      );
    }

    return NextResponse.json(
      parsed
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "No se pudo procesar la rutina."
      },
      {
        status: 500
      }
    );
  }
}
