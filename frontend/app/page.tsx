"use client";

import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function submit() {
    if (mode === "signup") {
      await axiosInstance.post("/user/signup", { email, username, password });
    } else {
      await axiosInstance.post("/user/signin", { email, password });
    }
    window.location.href = "/avatars";
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {mode === "signup" && (
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup"
                ? "Have an account? Sign in"
                : "Create account"}
            </Button>
            <Button onClick={submit}>
              {mode === "signup" ? "Continue" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-gray-600 mt-4">
        After signing in, you&apos;ll be redirected to your studio.
      </div>
    </main>
  );
}
