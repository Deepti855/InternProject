const SCORE_MIN = 0;
const SCORE_MAX = 100;

const clamp = (value, min = SCORE_MIN, max = SCORE_MAX) =>
  Math.max(min, Math.min(max, value));

const buildContextText = ({ title, content, product_name, brand, sustainability_category }) =>
  [title, content, product_name, brand, sustainability_category].filter(Boolean).join(" ").toLowerCase();

const fallbackScore = (payload) => {
  const text = buildContextText(payload);
  let score = 45;

  if (payload.sustainability_category === "eco-friendly") score += 14;
  if (payload.sustainability_category === "zero-waste") score += 18;
  if (payload.sustainability_category === "fair-trade") score += 16;

  const positiveKeywords = [
    "recycled", "recyclable", "organic", "biodegradable", "compostable",
    "fair trade", "fair-trade", "ethical", "renewable", "low carbon",
    "solar", "plastic-free", "refill", "minimal packaging", "upcycled"
  ];
  const cautionKeywords = [
    "single-use", "disposable", "synthetic", "microplastic", "fast fashion",
    "high carbon", "cheap labor", "unclear sourcing", "mixed material"
  ];

  positiveKeywords.forEach((keyword) => {
    if (text.includes(keyword)) score += 4;
  });
  cautionKeywords.forEach((keyword) => {
    if (text.includes(keyword)) score -= 5;
  });

  if (payload.product_link) score += 2;

  const finalScore = clamp(score);
  const explanation =
    finalScore >= 80
      ? "Mostly sustainable materials and ethical indicators with relatively low-impact signals."
      : finalScore >= 60
        ? "Some sustainability strengths are present, but parts of sourcing or lifecycle impact are unclear."
        : "Limited evidence of sustainability practices; materials and impact details need improvement.";

  return { score: finalScore, explanation, source: "fallback" };
};

const tryOpenAIScore = async (payload) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
Rate this product review's sustainability from 0 to 100.
Consider materials, ethical labor practices, and carbon footprint claims.
Respond as strict JSON: {"score": number, "explanation": "short reason"}

Review payload:
${JSON.stringify(payload, null, 2)}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(content);
    const score = clamp(Number(parsed.score));
    const explanation = String(parsed.explanation || "").slice(0, 220);
    if (!Number.isFinite(score) || !explanation) return null;
    return { score, explanation, source: "openai" };
  } catch (_err) {
    return null;
  }
};

const getCommunityImpact = (product, purchasesCount) => {
  if (purchasesCount < 100 || !product) return null;
  
  // Logic: 100 people buy a high-score product
  // CarbonOffset = purchasesCount * (Average Baseline Carbon (e.g. 5.0) - Product Carbon)
  const baseline = 5.0; // hypothetical average carbon per standard item
  const offset = purchasesCount * (baseline - (product.carbon_per_unit || 1.0));
  
  if (offset > 0) {
    return {
      message: `Carbon Offset by this Community: ${offset.toFixed(1)} kg`,
      badge: "Eco-Leader Community" 
    };
  }
  return null;
};

const getSustainabilityScore = async (payload) => {
  const aiResult = await tryOpenAIScore(payload);
  if (aiResult) return aiResult;
  return fallbackScore(payload);
};

module.exports = { getSustainabilityScore, getCommunityImpact };
