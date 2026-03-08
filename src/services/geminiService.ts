import { GoogleGenAI, Type } from "@google/genai";

export async function suggestField(fieldName: string, currentValue: string, context: any): Promise<string[]> {
  try {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || (process as any).env?.API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an AI assistant for a music generation platform.
      The user is filling out a form to generate music.
      Field Name: ${fieldName}
      Current Value: ${currentValue}
      Context: ${JSON.stringify(context)}
      
      Provide 5 creative suggestions for this field. Make them concise and relevant.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "A list of 5 suggestions",
            },
          },
          required: ["suggestions"],
        },
      },
    });

    const json = JSON.parse(response.text || "{}");
    return json.suggestions || [];
  } catch (e) {
    console.error("Failed to parse suggestions", e);
    return [];
  }
}
