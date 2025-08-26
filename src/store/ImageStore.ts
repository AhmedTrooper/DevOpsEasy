import { ImageState } from "@/interface/store/ImageStoreInterface";
import { Command } from "@tauri-apps/plugin-shell";
import { create } from "zustand";

export const useImageStore = create<ImageState>((set) => ({
  images: [],
  setImages: (images) => set({ images }),
  fetchImages: async () => {
    const cmd = Command.create("docker", [
      "images",
      "--format",
      "{{.ID}}|{{.Repository}}|{{.Tag}}|{{.Digest}}|{{.Size}}|{{.CreatedSince}}|{{.CreatedAt}}",
    ]);

    const output = await cmd.execute();
    const lines = (output.stdout || "").trim().split("\n");

    const images = lines.map((line) => {
      const [id, repository, tag, digest, size, createdSince, createdAt] =
        line.split("|");

      return {
        id,
        repository,
        tag,
        digest,
        size,
        createdSince,
        createdAt,
      };
    });

    // console.log(images);
    set({ images });
  },
}));
