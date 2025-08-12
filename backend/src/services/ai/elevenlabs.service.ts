export async function synthesizeSpeechBase64(params: {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: { stability?: number; similarity_boost?: number };
}): Promise<string> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${params.voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
      body: JSON.stringify({
        text: params.text,
        model_id: params.modelId || "eleven_monolingual_v1",
        voice_settings: {
          stability: params.voiceSettings?.stability ?? 0.75,
          similarity_boost: params.voiceSettings?.similarity_boost ?? 0.85,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ElevenLabs error: ${response.status} ${text}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}
