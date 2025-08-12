"use client";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { Card, CardContent } from "@/components/ui/card";

type VideoJob = { id: string; outputUrl: string | null; createdAt: string };

export default function VideosPage() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await axiosInstance.get<{ jobs: VideoJob[] }>("/videos");
        setJobs(r.data.jobs || []);
      } catch {
        setJobs([]);
      }
    };
    load();
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Videos</h1>
        <a
          className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50"
          href="/videos/create"
        >
          Create Video
        </a>
      </div>
      {jobs.length === 0 ? (
        <div className="text-sm text-gray-600">
          No videos have been generated yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((videoJob) => (
            <Card key={videoJob.id}>
              <CardContent className="p-2 space-y-2">
                {videoJob.outputUrl ? (
                  <video
                    controls
                    src={videoJob.outputUrl}
                    className="block w-full aspect-video bg-black rounded"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center border rounded">
                    Queued/Processing...
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {new Date(videoJob.createdAt).toLocaleString()}
                </div>
                {videoJob.outputUrl && (
                  <div>
                    <a
                      href={videoJob.outputUrl}
                      download
                      className="inline-block text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50"
                    >
                      Download
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
