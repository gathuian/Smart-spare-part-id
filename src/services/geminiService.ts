import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifyPart(base64Image: string) {
  try {
    // Extract base64 content
    const base64Data = base64Image.split(',')[1];
    
    const prompt = `Identify this industrial or mechanical spare part from the provided image.
    If you cannot identify any industrial or mechanical part because the image is too low quality, too deformed, or does not contain a machine part, return ONLY the word "UNIDENTIFIABLE".
    
    Otherwise, return ONLY a JSON object with the following structure:
    {
      "name": "The common industrial name of the part",
      "category": "The specific industrial category (e.g., HVAC, Hydraulics, Electrical)",
      "description": "A concise 2-sentence technical description",
      "possibleUses": ["list", "of", "3", "real-world", "uses"],
      "technicalSpecs": {
        "material": "Estimated material (e.g., Stainless Steel 304, Cast Iron)",
        "dimensions": "Standard industrial dimensions for this type of part",
        "tempRange": "Standard operating temperature range (e.g., -20°C to 120°C)"
      },
      "maintenanceTips": ["Tip 1 on how to care for/maintain this part", "Tip 2...", "Tip 3..."],
      "youtubeSearchQuery": "A specific search query for YouTube to find a great explanation or tutorial video (e.g., 'how an industrial centrifugal pump works')",
      "similarParts": [
        { "name": "Part Name", "reason": "Why it is complementary or similar" },
        { "name": "Part Name", "reason": "Why it is complementary or similar" }
      ],
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

    const text = (response.text || "").trim();
    
    if (text.includes("UNIDENTIFIABLE")) {
      throw new Error("UNABLE_TO_SCAN: Signature could not be resolved from telemetry feed.");
    }
    
    // Clean up potential markdown formatting from JSON
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Identification failed:", error);
    throw error;
  }
}
