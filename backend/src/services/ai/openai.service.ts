import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GenerateImageResult {
  imageUrl?: string;
  base64Image?: string;
}

export async function generateScriptFromIdea(idea: string): Promise<string> {
  if (!idea || idea.length < 3) throw new Error("Idea prompt is required");
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You write ultra‑short TikTok UGC lines optimized for lip‑sync.

Rules:
- Output exactly ONE sentence. No quotes. No extra text.
- Duration: 8–12 seconds. Target ~2.5 words/sec (≈20–30 words total).
- Language: simple, pronounceable words; spell out numbers ("ten", not 10).
- Avoid: acronyms, emojis, URLs, brand names, hard‑to‑pronounce names, stage directions.
- Style: upbeat, friendly, confident; present tense; active voice; minimal commas.
- If user gives a time target (e.g., “in 10 seconds”), match it.

Return only the sentence.`,
      },
      { role: "user", content: `Idea: ${idea}` },
    ],
    temperature: 0.8,
  } as any);
  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI did not return a script");
  return text;
}

export async function generateDalle3Image(
  prompt: string,
  responseFormat: "url" | "b64_json" = "url"
): Promise<GenerateImageResult> {
  if (!prompt) throw new Error("Prompt is required");

  const safePrefix = `
Portrait guidance (vertical, lip‑sync friendly):
- Create an original, non‑famous human character. Do not resemble real people or public figures.
- No trademarks, logos, watermarks, or text in the image.
- Framing: vertical portrait, centered head‑and‑shoulders, eyes looking at camera.
- Lighting: soft, diffused studio light; even skin tones; natural shadows.
- Background: clean, plain, minimal; avoid busy scenes.
- Style: photorealistic, sharp focus, high detail; natural skin texture.

`;
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: `${safePrefix}${prompt}`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: responseFormat,
  } as any);

  const imageData: any = response.data?.[0];
  if (!imageData) throw new Error("No image data returned from OpenAI");

  if (responseFormat === "url") {
    return { imageUrl: imageData.url as string };
  }
  return { base64Image: imageData.b64_json as string };
}
