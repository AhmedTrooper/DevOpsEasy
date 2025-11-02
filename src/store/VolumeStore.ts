import { VolumeState } from "@/interface/store/VolumeStoreInterface";
import { Command } from "@tauri-apps/plugin-shell";
import { create } from "zustand";
import { addToast } from "@heroui/react";

export const useVolumeStore = create<VolumeState>((set, get) => ({
  volumes: [],
  setVolumes: (volumes) => set({ volumes }),
  loading: false,
  setLoading: (status) => set({ loading: status }),
  error: null,
  setError: (error) => set({ error }),
  operationLoading: false,
  setOperationLoading: (status) => set({ operationLoading: status }),
  fetchVolumes: async () => {
    set({ loading: true, error: null });
    try {
      const cmd = Command.create("docker", [
        "volume",
        "ls",
        "--format",
        "{{.Name}}|{{.Driver}}|{{.Mountpoint}}",
      ]);

      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch Docker volumes");
      }

      const lines = (output.stdout || "").trim().split("\n");

      const volumes = lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [name, driver, mountpoint] = line.split("|");

          return {
            name,
            driver,
            mountpoint,
            createdAt: "N/A",
            size: "N/A",
          };
        });

      set({ volumes, loading: false });
      addToast({
        title: "Success",
        description: `Loaded ${volumes.length} Docker volumes`,
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ error: errorMessage, loading: false, volumes: [] });
      addToast({
        title: "Error fetching volumes",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },
  deleteVolume: async (volumeName: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["volume", "rm", volumeName]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to delete volume");
      }

      addToast({
        title: "Volume Deleted",
        description: `Volume ${volumeName} deleted successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh volume list
      await get().fetchVolumes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error deleting volume",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
}));
