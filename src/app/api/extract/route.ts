import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { content, type } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Actúa como un chef experto. Analiza este ${type}: "${content}".
      Extrae TODAS las recetas presentes.
      Devuelve ÚNICAMENTE un objeto JSON con esta estructura:
      {
        "recetasEncontradas": [
          {
            "id": "temp1",
            "titulo": "Nombre de la receta",
            "categoria": "Carnes|Sopas|Pescados|etc",
            "dieta": ["Keto", "Low Carb"],
            "ingredientes": ["item 1", "item 2"],
            "pasos": ["paso 1", "paso 2"],
            "busquedaImagen": "un termino descriptivo para buscar en unsplash"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    // Limpiamos el texto por si Gemini mete markdown
    const cleanJson = response.replace(/```json|```/g, "");
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error) {
    return NextResponse.json({ error: "Error procesando receta" }, { status: 500 });
  }
}
