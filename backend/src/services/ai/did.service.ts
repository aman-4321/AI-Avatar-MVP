export interface DidCreateTalkResponse {
  id?: string;
  result_url?: string;
  status?: string;
  [key: string]: any;
}

export async function createDidVideo(params: {
  avatarImageUrl: string;
  text?: string;
  voiceId?: string;
  audioUrl?: string;
}): Promise<DidCreateTalkResponse> {
  const script = params.audioUrl
    ? { type: "audio", audio_url: params.audioUrl }
    : { type: "text", input: params.text, voice: params.voiceId };

  const safeGuidelines = `
Safety & quality guidelines:
- Use only original, non‑famous characters. Do not imitate real people or public figures.
- No trademarks, logos, or copyrighted elements.
- Vertical portrait framing; keep the face centered and well‑lit.
- Keep background simple and non‑distracting.
- Natural tone and lip movement; avoid extreme expressions.
`;
  const body = {
    source_url: params.avatarImageUrl,
    script,
    config: {
      stitch: true,
      background: { color: "#000000" },
      align: "center",
      crop: { type: "vertical" },
      resolution: "720x1280",
    },
    guidelines: safeGuidelines,
  } as any;

  const key = process.env.DID_API_KEY || "";
  const authHeader = key.startsWith("Basic ")
    ? key
    : `Basic ${Buffer.from(key).toString("base64")}`;

  const baseUrl = "https://api.d-id.com";
  const response = await fetch(`${baseUrl}/talks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("D-ID error:", response.status, text);
    return { status: `error:${response.status}` } as DidCreateTalkResponse;
  }
  const created = (await response.json()) as DidCreateTalkResponse;
  return created;
}
