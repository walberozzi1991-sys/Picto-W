import { NextResponse } from "next/server";

const STYLE = `
Create a proprietary accessibility-oriented communication pictogram.

VISUAL STYLE:

- pure black and white only
- pure white background
- simple human figure
- white circular head with black outline
- simple black body and limbs
- thick and uniform black line
- minimal geometric shapes
- very few visual elements
- centered composition
- one clearly identifiable action
- no text inside the image
- no letters
- no numbers
- no speech bubbles
- no decorative elements
- no shadows
- no gradients
- no textures
- no photorealism
- no 3D
- no color
- no unnecessary facial details
- very high contrast
- consistent proportions
- consistent line thickness
- simple enough to be understood immediately
- designed for visual communication
- designed as part of a consistent proprietary pictogram system

IMPORTANT:

Do not imitate, reproduce, trace or reference any existing
pictogram collection.

Do not use logos.

Do not use branded objects.

Do not use copyrighted characters.

Do not use recognizable commercial branding.

The image must communicate the requested action
clearly and immediately.

Generate exactly one square pictogram.
`;

export async function POST(request) {
  try {

    const {
      action,
      description
    } = await request.json();

    if (!action || !description) {
      return NextResponse.json(
        {
          error:
            "Falta la acción o descripción."
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
            "Falta configurar GEMINI_API_KEY."
        },
        {
          status: 500
        }
      );
    }

    const prompt = `
${STYLE}

ACTION:

${action}

VISUAL DESCRIPTION:

${description}

Create one simple black-and-white
communication pictogram representing
this exact action.

Do not add any text.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
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
            responseModalities: [
              "Image"
            ]
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
            "Error generando el pictograma."
        },
        {
          status: 502
        }
      );
    }

    const parts =
      data?.candidates?.[0]
        ?.content?.parts || [];

    const imagePart =
      parts.find(
        (part) =>
          part.inlineData &&
          part.inlineData.data
      );

    if (!imagePart) {

      return NextResponse.json(
        {
          error:
            "Gemini no devolvió una imagen."
        },
        {
          status: 502
        }
      );
    }

    const mime =
      imagePart.inlineData.mimeType ||
      "image/png";

    const base64 =
      imagePart.inlineData.data;

    return NextResponse.json({
      image:
        `data:${mime};base64,${base64}`
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "No se pudo generar el pictograma."
      },
      {
        status: 500
      }
    );
  }
}
