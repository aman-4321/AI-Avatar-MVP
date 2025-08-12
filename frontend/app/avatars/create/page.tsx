"use client";
import { useState } from "react";
import { axiosInstance } from "../../../lib/axios";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AvatarCreatePage() {
  const [prompt, setPrompt] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function generate() {
    try {
      setGenerating(true);
      const requests = Array.from({ length: 6 }).map(() =>
        axiosInstance.post("/avatars", { prompt })
      );
      const results = await Promise.all(requests);
      const urls = results
        .map((r) => r.data?.data?.[0]?.url as string)
        .filter(Boolean);
      setPreviews(urls);
      setSelected(null);
      toast.success("Previews generated");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to generate previews");
    } finally {
      setGenerating(false);
    }
  }

  async function save(preferred?: boolean) {
    if (!selected) return;
    setSaving(true);
    try {
      await axiosInstance.post("/avatars/save", {
        prompt,
        imageUrl: selected,
        preferred,
      });
      toast.success("Avatar saved");
      window.location.href = "/avatars";
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to save avatar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Describe your avatar"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating}
            />
            <Button onClick={generate} disabled={generating}>
              {generating ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating
                </span>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {previews.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Click an image to select it, then press Save.
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {previews.map((previewUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelected(previewUrl)}
                className={`relative border rounded overflow-hidden p-0 cursor-pointer transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selected === previewUrl ? "ring-2 ring-blue-500" : ""
                }`}
                aria-pressed={selected === previewUrl}
                aria-label={`Select avatar ${index + 1}`}
              >
                <div className="relative w-full h-48">
                  <Image
                    src={previewUrl}
                    alt="avatar preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                {selected === previewUrl && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="flex gap-2">
          <Button onClick={() => save(false)} disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : (
              "Save Avatar"
            )}
          </Button>
          <a className="border px-4 py-2 rounded" href="/avatars">
            Skip
          </a>
          <a className="border px-4 py-2 rounded" href="/voices">
            Next
          </a>
        </div>
      )}
    </main>
  );
}
