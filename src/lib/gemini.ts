import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseRecipe(input: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Analiza el siguiente contenido (link o texto) y extrae una receta en formato JSON:
    Estructura: { 
      titulo: string, 
      categoria: "Sopas"|"Carnes"|"Pescados"|"Postres"|...,
      dieta: ["Keto", "Low Carb", ...],
      ingredientes: [string], 
      pasos: [string],
      imageSearchTerm: string (un termino para buscar una foto apetecible en Unsplash)
    }
    Contenido: ${input}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
