import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { images } = await req.json();

    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ items: [] }), { status: 400 });
    }

    // 🔥 convertir imágenes a formato correcto
    const content = [
      {
        type: "input_text",
        text: `
Analiza estas imágenes del plato.

Devuelve SOLO JSON:

{
  "items":[
    {
      "name":"alimento",
      "grams":100,
      "hc_per_100g":20,
      "units":{
        "label":"makis",
        "grams_per_unit":20,
        "default_count":5
      }
    }
  ]
}

- No expliques nada
- No texto fuera del JSON
`
      },

      ...images.map((img) => ({
        type: "input_image",
        image_url: img
      }))
    ];

    const response = await client.responses.create({
      model: "gpt-5.4-nano",
      input: [
        {
          role: "user",
          content
        }
      ],
      max_output_tokens: 800
    });

    const text = response.output_text;

    let json;

    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("JSON ERROR:", text);
      return new Response(JSON.stringify({ items: [] }));
    }

    return new Response(JSON.stringify(json));

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ items: [] }), { status: 500 });
  }
}