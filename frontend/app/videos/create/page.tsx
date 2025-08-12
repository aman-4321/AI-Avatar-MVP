"use client";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../../lib/axios";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import Image from "next/image";

function useQuery() {
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());
  useEffect(() => {
    if (typeof window !== "undefined") {
      setParams(new URLSearchParams(window.location.search));
    }
  }, []);
  return params;
}

export default function VideoCreatePage() {
  const query = useQuery();
  type AvatarItem = { id: string; imageUrl: string; prompt: string };
  type ListAvatarsResponse = { avatars: AvatarItem[] };
  type VoiceAsset = { id: string; audioUrl: string; audioKey: string };
  type ListVoicesResponse = { voices: VoiceAsset[] };
  type ProviderVoice = { voice_id: string; name: string };
  type ProviderVoicesResponse = { voices: ProviderVoice[] };

  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [selectedAudioKey, setSelectedAudioKey] = useState<string>("");
  const [providerVoices, setProviderVoices] = useState<ProviderVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [scriptText, setScriptText] = useState<string>("");
  const [mode, setMode] = useState<"audio" | "script">("audio");
  const [submitting, setSubmitting] = useState(false);
  const avatarId = query.get("avatarId") || "";

  useEffect(() => {
    const load = async () => {
      try {
        const avatarsResponse = await axiosInstance.get<ListAvatarsResponse>(
          "/avatars"
        );
        setAvatars(avatarsResponse.data.avatars || []);
        if (avatarId) setSelectedAvatarId(avatarId);
        // load saved voices
        const voicesResponse = await axiosInstance.get<ListVoicesResponse>(
          "/voice"
        );
        const voiceList = voicesResponse.data.voices || [];
        setVoices(
          voiceList.map((voice) => ({
            id: voice.id,
            audioUrl: voice.audioUrl,
            audioKey: voice.audioKey,
          }))
        );
        // load provider voices for script mode
        try {
          const providerResponse =
            await axiosInstance.get<ProviderVoicesResponse>(
              "/voice/providers/elevenlabs/voices"
            );
          const providerList = providerResponse.data?.voices || [];
          setProviderVoices(
            providerList.map((providerVoice) => ({
              voice_id: providerVoice.voice_id,
              name: providerVoice.name,
            }))
          );
        } catch {}
      } catch {
        setAvatars([]);
      }
    };
    load();
  }, [avatarId]);

  async function create() {
    if (!selectedAvatarId) return;
    if (mode === "audio") {
      if (!selectedAudioKey) return;
      try {
        setSubmitting(true);
        await axiosInstance.post("/videos", {
          avatarId: selectedAvatarId,
          audioKey: selectedAudioKey,
          prompt: prompt || undefined,
        });
        toast.success("Video job created");
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        toast.error(message || "Failed to create video");
        return;
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!selectedVoiceId || (!scriptText && !prompt)) return;
      try {
        setSubmitting(true);
        await axiosInstance.post("/videos", {
          avatarId: selectedAvatarId,
          script: scriptText || undefined,
          voiceId: selectedVoiceId,
          prompt: scriptText ? undefined : prompt || undefined,
          refinePrompt: true,
        });
        toast.success("Video job created");
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        toast.error(message || "Failed to create video");
        return;
      } finally {
        setSubmitting(false);
      }
    }
    window.location.href = "/videos";
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Mode selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`border px-3 py-1 rounded ${
                mode === "audio" ? "bg-gray-100" : ""
              }`}
              onClick={() => setMode("audio")}
            >
              Use saved voice audio
            </button>
            <button
              type="button"
              className={`border px-3 py-1 rounded ${
                mode === "script" ? "bg-gray-100" : ""
              }`}
              onClick={() => setMode("script")}
            >
              Use script + select voice
            </button>
          </div>

          {/* Shared optional prompt (used when refining) */}
          <Textarea
            placeholder="Optional: high-level idea (we can refine to a short script)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={create}
              disabled={
                submitting ||
                !selectedAvatarId ||
                (mode === "audio" && !selectedAudioKey) ||
                (mode === "script" &&
                  !selectedVoiceId &&
                  !scriptText &&
                  !prompt)
              }
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </span>
              ) : (
                "Generate Video"
              )}
            </Button>
            <Button variant="outline" asChild>
              <a href="/videos">Go to Videos</a>
            </Button>
          </div>
          {/* Select Avatar */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Select Avatar</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {avatars.map((avatarItem) => (
                <button
                  key={avatarItem.id}
                  type="button"
                  onClick={() => setSelectedAvatarId(avatarItem.id)}
                  className={`relative border rounded overflow-hidden ${
                    selectedAvatarId === avatarItem.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={avatarItem.imageUrl}
                      alt="avatar"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  {selectedAvatarId === avatarItem.id && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Saved voices list for selection */}
          {mode === "audio" && voices.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Saved Voices</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {voices.map((voiceItem) => (
                  <div
                    key={voiceItem.id}
                    className="flex items-center gap-2 border rounded p-2"
                  >
                    <audio
                      controls
                      src={voiceItem.audioUrl}
                      className="w-full"
                    />
                    <Button
                      variant={
                        selectedAudioKey === voiceItem.audioKey
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() => setSelectedAudioKey(voiceItem.audioKey)}
                    >
                      {selectedAudioKey === voiceItem.audioKey
                        ? "Selected"
                        : "Use"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mode === "audio" && selectedAudioKey && (
            <div className="text-xs text-gray-600">
              Voice selected. Will use synthesized audio.
            </div>
          )}

          {/* Script + provider voice selection */}
          {mode === "script" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Script</div>
                <Textarea
                  placeholder="Enter the exact sentence to speak (or leave blank to refine the idea above)"
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Select Voice</div>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedVoiceId}
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                >
                  <option value="">Choose a voice</option>
                  {providerVoices.map((providerVoice) => (
                    <option
                      key={providerVoice.voice_id}
                      value={providerVoice.voice_id}
                    >
                      {providerVoice.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
