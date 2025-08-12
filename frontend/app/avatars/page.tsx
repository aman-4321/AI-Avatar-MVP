"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Avatar } from "../../lib/types";
import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await axiosInstance.get<{ avatars: Avatar[] }>("/avatars");
        setAvatars(r.data.avatars);
      } catch {
        setAvatars([]);
      }
    };
    load();
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Avatars</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <a href="/avatars/create">Create Avatar</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/voices">Next</a>
          </Button>
        </div>
      </div>
      {avatars.length === 0 ? (
        <div className="text-sm text-gray-600">
          You have no saved avatars yet. Click &quot;Create Avatar&quot; to
          generate one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {avatars.map((avatarItem: Avatar & { preferred?: boolean }) => (
            <Card
              key={avatarItem.id}
              className="rounded-xl shadow-sm hover:shadow-md transition"
            >
              <CardContent className="p-3 space-y-3">
                <div className="relative w-full aspect-square rounded-md overflow-hidden">
                  <Image
                    src={avatarItem.imageUrl}
                    alt="avatar"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="text-sm text-gray-600 line-clamp-2 min-h-10">
                  {avatarItem.prompt}
                </div>
                {Boolean(avatarItem.preferred) && (
                  <div className="text-xs text-green-600">Preferred</div>
                )}
              </CardContent>
              <CardFooter className="px-3 pb-3 pt-0 grid grid-cols-2 gap-2">
                <Button asChild className="w-full">
                  <a href={`/videos/create?avatarId=${avatarItem.id}`}>
                    Use for Video
                  </a>
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await axiosInstance.post("/avatars/delete", {
                        avatarId: avatarItem.id,
                      });
                      toast.success("Avatar deleted");
                      window.location.reload();
                    } catch (error: unknown) {
                      const message = axios.isAxiosError(error)
                        ? error.response?.data?.message
                        : undefined;
                      toast.error(message || "Failed to delete avatar");
                    }
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
