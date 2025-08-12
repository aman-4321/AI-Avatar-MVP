"use client";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function StudioPage() {
  type AvatarItem = { id: string; imageUrl: string; prompt: string };
  type VoiceAsset = { id: string; audioUrl: string; audioKey: string };
  type VideoJob = { id: string; outputUrl: string | null; createdAt: string };
  type ListAvatarsResponse = { avatars: AvatarItem[] };
  type ListVoicesResponse = { voices: VoiceAsset[] };
  type ListVideosResponse = { jobs: VideoJob[] };

  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [jobs, setJobs] = useState<VideoJob[]>([]);

  const loadAll = async () => {
    const [avatarsResponse, voicesResponse, videosResponse] = await Promise.all(
      [
        axiosInstance
          .get<ListAvatarsResponse>("/avatars")
          .catch(() => ({ data: { avatars: [] } as ListAvatarsResponse })),
        axiosInstance
          .get<ListVoicesResponse>("/voice")
          .catch(() => ({ data: { voices: [] } as ListVoicesResponse })),
        axiosInstance
          .get<ListVideosResponse>("/videos")
          .catch(() => ({ data: { jobs: [] } as ListVideosResponse })),
      ]
    );
    setAvatars(avatarsResponse.data.avatars || []);
    setVoices(voicesResponse.data.voices || []);
    setJobs(videosResponse.data.jobs || []);
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Welcome to AI Studio</h1>
        <p className="text-gray-600">
          Create avatars, synthesize voices and render videos. Use the top
          navigation to work in focused pages. Quick actions below.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <a href="/avatars/create">Create Avatar</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/voices">Generate Voice</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/videos/create">Create Video</a>
          </Button>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Avatars</h2>
        {avatars.length === 0 ? (
          <div className="text-sm text-gray-600">
            No avatars yet. Click &quot;Create Avatar&quot; to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {avatars.slice(0, 4).map((avatarItem) => (
              <Card key={avatarItem.id}>
                <CardContent className="p-2 space-y-2">
                  <div className="relative w-full aspect-square rounded overflow-hidden">
                    <Image
                      src={avatarItem.imageUrl}
                      alt="avatar"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <Button asChild>
                    <a href={`/videos/create?avatarId=${avatarItem.id}`}>
                      Use for Video
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div>
          <a className="text-sm underline" href="/avatars">
            View all avatars
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Voices</h2>
        {voices.length === 0 ? (
          <div className="text-sm text-gray-600">
            No voices yet. Visit the Voices page to generate one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voices.slice(0, 4).map((voiceItem) => (
              <Card key={voiceItem.id}>
                <CardContent className="p-2 space-y-2">
                  <audio controls src={voiceItem.audioUrl} className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div>
          <a className="text-sm underline" href="/voices">
            Go to Voices
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Videos</h2>
        {jobs.length === 0 ? (
          <div className="text-sm text-gray-600">
            No videos yet. Create one from an avatar and voice.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 2).map((videoJob) => (
              <Card key={videoJob.id}>
                <CardContent className="p-2 space-y-2">
                  {videoJob.outputUrl ? (
                    <video
                      controls
                      src={videoJob.outputUrl}
                      className="block w-full aspect-video bg-black rounded"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center border rounded">
                      Queued/Processing...
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div>
          <a className="text-sm underline" href="/videos">
            View all videos
          </a>
        </div>
      </section>
    </main>
  );
}
