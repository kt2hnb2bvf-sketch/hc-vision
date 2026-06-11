import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { images } = await req.json();

    // 🔥 Convertir base64 limpio
    const imageBlocks = images.map((img) => {
      const base64 = img.split(",")[1];
      const mime = img.match(/data:(.*);base64/)[1];

      return {
        type: "input_image",
        source: {
          type: "base64",
          media_type: mime,
          data: base64
        }
      };
    });

    const response = await client.responses.create({
      model: "gpt-5.4-nano",
      input: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "input_text",
              text: `
Analiza estas ${images.length} fotos del mismo plato.
Son ángulos distintos o detalles.

Devuelve UN único JSON sin repetir ingredientes.
Usa todas las fotos para mejorar precisión.

---

Eres un experto en nutrición diabetológica.

Usas DOS fuentes:

1. Tabla Fundación Diabetes España (PRIORIDAD)
2. Conocimiento nutricional

---

ETIQUETAS NUTRICIONALES (PRIORIDAD MÁXIMA)

Si una imagen contiene etiqueta:
- usa HC y kcal reales por 100g
- ignora tabla y estimaciones

---

TABLA FUNDACIÓN (usar si coincide)

Arroz cocido: 26g HC  
Pasta cocida: 20g HC  
Pan blanco: 50g HC  
Pan integral: 43g HC  
Patata hervida: 20g HC  
Legumbres: 20g HC  
Quinoa: 21g HC  
Avena: 29g HC  

Frutas:
Plátano 20g  
Manzana 10g  
Naranja 10g  
Uva 20g  

Lácteos:
Leche 5g  
Yogur 5g  

Otros:
Pizza 25g  
Arroz sushi 22g  

---

REGLAS GRAMOS:

- arroz/pasta: 150-200g
- carne/pescado: 150-200g
- verdura: 100-150g
- pan: 25g

---

AJUSTE COCCIÓN:

- frito: más kcal
- hervido: base
- horno azúcar: IG alto
- al dente: IG menor

---

UNIDADES NATURALES:

Makis: 20g  
Temaki: 80g  
Picos: 5g  
Croquetas: 30g  
Pizza: 100g  
Dátil: 12g  
Uva: 8g  
Yogur: 125g  
Leche: 200ml  
Pan: 25g  

---

SALIDA:

{
  "items":[
    {
      "name":"nombre",
      "grams":120,
      "hc_per_100g":22,
      "gi":42,
      "kcal_per_100g":140,
      "confidence":0.9,
      "source":"tabla_fundacion",
      "units":{
        "label":"makis",
        "grams_per_unit":20,
        "default_count":6
      }
    }
  ]
}

REGLAS:
- no repitas alimentos
- usa todas las fotos
- units null si no aplica
- confidence 0-1
`
            }
          ]
        }
      ]
    });

    const text = response.output_text;

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.log("ERROR JSON:", text);
      return new Response(JSON.stringify({ items: [] }));
    }

    return new Response(JSON.stringify(json));

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ items: [] }));
  }
}