import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { scansTable } from "@workspace/db";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const ARABIC_PROMPT = `You are an expert botanist. Analyze the plant in this image and produce a thorough Arabic-friendly report.

Return ONLY valid JSON (no markdown, no code fences) with this EXACT structure. All textual values MUST be in Arabic except scientific_name.

{
  "name": "الاسم الشائع بالعربية",
  "scientific_name": "Latin scientific name",
  "description": "وصف نباتي مفصّل (3-4 جمل) عن الشكل والأوراق والأزهار.",
  "benefits": "الفوائد الطبية والصحية والبيئية باختصار (2-3 جمل).",
  "care": "تعليمات العناية: الري، الإضاءة، التربة، الحرارة (2-3 جمل).",
  "distribution": "المناطق الجغرافية الأساسية لانتشار النبات حول العالم (1-2 جملة).",
  "usage_methods": ["طريقة استخدام 1", "طريقة استخدام 2", "طريقة استخدام 3"],
  "medical_benefits": ["فائدة طبية 1", "فائدة طبية 2", "فائدة طبية 3"],
  "nutrition": [
    { "name": "فيتامين A", "amount": "XXX mcg", "percentage": "XX%" },
    { "name": "فيتامين C", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "فيتامين E", "amount": "X.X mg", "percentage": "XX%" },
    { "name": "كالسيوم", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "حديد", "amount": "X.X mg", "percentage": "XX%" },
    { "name": "مغنيسيوم", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "بوتاسيوم", "amount": "XXX mg", "percentage": "XX%" }
  ],
  "warnings": {
    "risk_level": "Low | Medium | High",
    "summary": "ملخص قصير عن خطورة النبات.",
    "symptoms": ["عرض 1", "عرض 2"],
    "child_safety": "آمن | حذر | غير آمن",
    "pet_safety": "آمن | حذر | غير آمن",
    "child_note": "ملاحظة للأطفال.",
    "pet_note": "ملاحظة للحيوانات الأليفة."
  },
  "soil_helper": {
    "title": "وصفة التربة المثالية",
    "ingredients": [
      { "name": "بيتموس", "parts": "2 أجزاء" },
      { "name": "بيرلايت", "parts": "1 جزء" },
      { "name": "لحاء صنوبر", "parts": "1 جزء" },
      { "name": "كومبوست", "parts": "1 جزء" }
    ],
    "ph_range": "6.0 - 6.5",
    "moisture_tip": "حافظ على رطوبة التربة دون إغراق.",
    "watering_tip": "اترك مسافة 2 سم من سطح التربة لتسهيل الري.",
    "drainage_tip": "ضع طبقة من الحصى في قاع الأصيص لمنع انسداد الفتحات."
  },
  "community_alerts": ["تنبيه محلي 1", "تنبيه محلي 2"]
}

If this is not a plant or you cannot identify it, return ONLY: {"error": "Could not identify plant in image"}`;

const ENGLISH_PROMPT = `You are an expert botanist. Analyze the plant in this image and produce a thorough English report.

Return ONLY valid JSON (no markdown, no code fences) with this EXACT structure. All textual values MUST be in clear, natural English.

{
  "name": "Common English name",
  "scientific_name": "Latin scientific name",
  "description": "Detailed botanical description (3-4 sentences) about appearance, leaves and flowers.",
  "benefits": "Brief medical, health and environmental benefits (2-3 sentences).",
  "care": "Care instructions: watering, light, soil, temperature (2-3 sentences).",
  "distribution": "Main geographical regions where the plant grows worldwide (1-2 sentences).",
  "usage_methods": ["Usage method 1", "Usage method 2", "Usage method 3"],
  "medical_benefits": ["Medical benefit 1", "Medical benefit 2", "Medical benefit 3"],
  "nutrition": [
    { "name": "Vitamin A", "amount": "XXX mcg", "percentage": "XX%" },
    { "name": "Vitamin C", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "Vitamin E", "amount": "X.X mg", "percentage": "XX%" },
    { "name": "Calcium", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "Iron", "amount": "X.X mg", "percentage": "XX%" },
    { "name": "Magnesium", "amount": "XXX mg", "percentage": "XX%" },
    { "name": "Potassium", "amount": "XXX mg", "percentage": "XX%" }
  ],
  "warnings": {
    "risk_level": "Low | Medium | High",
    "summary": "Short summary about the plant's risk level.",
    "symptoms": ["Symptom 1", "Symptom 2"],
    "child_safety": "Safe | Caution | Unsafe",
    "pet_safety": "Safe | Caution | Unsafe",
    "child_note": "Note for children.",
    "pet_note": "Note for pets."
  },
  "soil_helper": {
    "title": "Ideal soil recipe",
    "ingredients": [
      { "name": "Peat moss", "parts": "2 parts" },
      { "name": "Perlite", "parts": "1 part" },
      { "name": "Pine bark", "parts": "1 part" },
      { "name": "Compost", "parts": "1 part" }
    ],
    "ph_range": "6.0 - 6.5",
    "moisture_tip": "Keep the soil moist without waterlogging.",
    "watering_tip": "Leave a 2 cm gap from the soil surface to make watering easier.",
    "drainage_tip": "Place a layer of gravel at the bottom of the pot to prevent clogged drainage."
  },
  "community_alerts": ["Local alert 1", "Local alert 2"]
}

If this is not a plant or you cannot identify it, return ONLY: {"error": "Could not identify plant in image"}`;

router.post("/", async (req, res) => {
  const { imageBase64, userId, lang } = req.body as {
    imageBase64: string;
    userId: string;
    lang?: "en" | "ar";
  };

  if (!imageBase64 || !userId) {
    res.status(400).json({ error: "imageBase64 and userId required" });
    return;
  }

  try {
    const prompt = lang === "en" ? ENGLISH_PROMPT : ARABIC_PROMPT;

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

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      res.status(422).json({ error: "Invalid JSON from AI" });
      return;
    }

    if (parsed.error) {
      res.status(422).json({ error: parsed.error });
      return;
    }

    const scanId = generateId();

    await db.insert(scansTable).values({
      id: scanId,
      userId,
      plantName: parsed.name as string,
      scientificName: parsed.scientific_name as string,
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
      distribution: parsed.distribution,
      usageMethods: parsed.usage_methods,
      medicalBenefits: parsed.medical_benefits,
      warnings: parsed.warnings,
      soilHelper: parsed.soil_helper,
      communityAlerts: parsed.community_alerts,
      imageBase64: imageBase64.length > 500000 ? undefined : imageBase64,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    res.status(500).json({ error: message });
  }
});

export default router;
