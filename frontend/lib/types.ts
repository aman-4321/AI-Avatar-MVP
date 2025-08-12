export interface Avatar {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  preferred?: boolean;
}

export interface VideoJob {
  id: string;
  outputUrl: string | null;
  createdAt: string;
}
