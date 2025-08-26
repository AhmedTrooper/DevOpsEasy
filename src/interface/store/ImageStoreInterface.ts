export interface DockerImage {
  id: string | null;
  repository: string | null;
  tag: string | null;
  digest: string | null;
  size: string | null;
  createdSince: string | null;
  createdAt: string | null;
}
export interface ImageState {
  images: DockerImage[];
  setImages: (images: DockerImage[]) => void;
  fetchImages: () => Promise<void>;
}

