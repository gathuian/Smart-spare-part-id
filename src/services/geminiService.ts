import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifyPart(base64Image: string) {
  try {
    // Extract base64 content
    const base64Data = base64Image.split(',')[1];
    
    const prompt = `Identify this industrial or mechanical spare part. 
    Return ONLY a JSON object with the following structure:
    {
      "name": "The common industrial name of the part",
      "description": "A concise 2-sentence technical description",
      "possibleUses": ["list", "of", "3", "real-world", "uses"],
      "confidence": a number between 75 and 99
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ]
    });

    const text = response.text || "{}";
    
    // Clean up potential markdown formatting from JSON
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Identification failed:", error);
    throw error;
  }
}
