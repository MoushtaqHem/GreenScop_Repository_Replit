import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { scansTable } from "@workspace/db";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

router.post("/", async (req, res) => {
  const { imageBase64, userId } = req.body as {
    imageBase64: string;
    userId: string;
  };

  if (!imageBase64 || !userId) {
    res.status(400).json({ error: "imageBase64 and userId required" });
    return;
  }

  const prompt = `You are a plant identification expert. Analyze the plant in this image and provide a detailed report.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "name": "Common Name",
  "scientific_name": "Scientific Name",
  "description": "Detailed description of the plant in 2-3 sentences",
  "benefits": "Health and ecological benefits in 2-3 sentences",
  "care": "Care instructions including watering, sunlight, soil needs in 2-3 sentences",
  "nutrition": [
    { "name": "Vitamin A", "amount": "XXX mcg", "percentage": "XX%" },
    { "name": "Vitamin C", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "Vitamin E", "amount": "X.X mg", "percentage": "XX%" },
    { "name": "Calcium", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "Iron", "amount": "X.X mg", "percentage": "XX%" },
    { "name": "Magnesium", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "Potassium", "amount": "XXX mg", "percentage": "XX%" }
  ]
}

If this is not a plant or you cannot identify it, return:
{"error": "Could not identify plant in image"}`;

  const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData,
            },
          },
        ],
      },
    ],
    config: { maxOutputTokens: 8192 },
  });

  const rawText = response.text ?? "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    res.status(422).json({ error: "Could not parse AI response" });
    return;
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (parsed.error) {
    res.status(422).json({ error: parsed.error });
    return;
  }

  const scanId = generateId();

  await db.insert(scansTable).values({
    id: scanId,
    userId,
    plantName: parsed.name,
    scientificName: parsed.scientific_name,
    imageBase64: imageBase64.length > 500000 ? null : imageBase64,
  });

  res.json({
    id: scanId,
    name: parsed.name,
    scientificName: parsed.scientific_name,
    description: parsed.description,
    benefits: parsed.benefits,
    care: parsed.care,
    nutrition: parsed.nutrition,
    imageBase64: imageBase64.length > 500000 ? undefined : imageBase64,
    createdAt: new Date().toISOString(),
  });
});

export default router;
