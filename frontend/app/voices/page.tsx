"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export default function VoicesPage() {
  type VoiceAsset = { id: string; audioUrl: string; audioKey: string };
  type ListVoicesResponse = { voices: VoiceAsset[] };
  type ProviderVoice = { voice_id: string; name: string };
  type ProviderVoicesResponse = { voices: ProviderVoice[] };

  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [prompt, setPrompt] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerVoices, setProviderVoices] = useState<ProviderVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");

  const load = async () => {
    try {
      const response = await axiosInstance.get<ListVoicesResponse>("/voice");
      setVoices(
        (response.data.voices || []).map((voice) => ({
          id: voice.id,
          audioUrl: voice.audioUrl,
          audioKey: voice.audioKey,
        }))
      );
      if ((response.data.voices || []).length === 0) {
        toast("No voices yet. Generate one below.");
      }
    } catch {
      setVoices([]);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const response = await axiosInstance.get<ProviderVoicesResponse>(
          "/voice/providers/elevenlabs/voices"
        );
        const providerList = response.data?.voices || [];
        setProviderVoices(
          providerList.map((providerVoice) => ({
            voice_id: providerVoice.voice_id,
            name: providerVoice.name,
          }))
        );
      } catch {}
    })();
  }, [load]);

  async function synthesize() {
    setLoading(true);
    try {
      await axiosInstance.post("/voice/synthesize", {
        prompt,
        voiceId: selectedVoiceId || voiceId || undefined,
      });
      await load();
      setPrompt("");
      toast.success("Voice generated");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Voices</h1>
            <p className="text-sm text-gray-600">
              Generate narration from a prompt or pick a specific provider
              voice.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/videos/create">Next</a>
            </Button>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Synthesize a Voice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the voiceover you want (we'll generate a short script and audio)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              className="border rounded px-2 py-1"
              value={selectedVoiceId}
              onChange={(e) => {
                setSelectedVoiceId(e.target.value);
                setVoiceId(e.target.value);
              }}
            >
              <option value="">Default Voice</option>
              {providerVoices.map((providerVoice) => (
                <option
                  key={providerVoice.voice_id}
                  value={providerVoice.voice_id}
                >
                  {providerVoice.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Voice ID (optional)"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
            />
            <Button onClick={synthesize} disabled={loading || !prompt}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </span>
              ) : (
                "Generate Voice"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold">My Voices</h2>
      {voices.length === 0 ? (
        <div className="text-sm text-gray-600">
          No voices yet. Generate one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {voices.map((voiceItem) => (
            <Card key={voiceItem.id} className="rounded-xl shadow-sm">
              <CardContent className="p-3 space-y-3">
                <audio controls src={voiceItem.audioUrl} className="w-full" />
                <div className="text-xs text-gray-600">
                  {voiceItem.audioKey}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
