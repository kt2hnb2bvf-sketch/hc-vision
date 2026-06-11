import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { images } = await req.json();

    const content = [
      {
        type: "input_text",
        text: `
Analiza comida.

Makis:
- 1 maki = 30-35g
- 8 makis ≈ 240-280g

Devuelve JSON:
{
 items:[{
  name:"",
  grams:0,
  hc_per_100g:0,
  gi:0
 }]
}
`
      },
      ...images.map(img => ({
        type: "input_image",
        image_url: img
      }))
    ];

    const response = await client.responses.create({
      model: "gpt-5.4-nano",
      input: [{ role: "user", content }]
    });

    return new Response(response.output_text);

  } catch (e) {
    return new Response(JSON.stringify({ items: [] }));
  }
}