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
  inspectData: null,
  setInspectData: (data) => set({ inspectData: data }),
  inspectLoading: false,
  setInspectLoading: (status) => set({ inspectLoading: status }),
  
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
        timeout: 1000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ error: errorMessage, loading: false, volumes: [] });
      addToast({
        title: "Error fetching volumes",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
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
        timeout: 1000,
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
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  createVolume: async (name: string, driver?: string, options?: Record<string, string>) => {
    set({ operationLoading: true });
    try {
      const args = ["volume", "create"];
      
      if (driver) {
        args.push("--driver", driver);
      }
      
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          args.push("--opt", `${key}=${value}`);
        });
      }
      
      args.push(name);
      
      const cmd = Command.create("docker", args);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to create volume");
      }

      addToast({
        title: "Volume Created",
        description: `Volume ${name} created successfully`,
        color: "success",
        timeout: 1000,
      });

      // Refresh volume list
      await get().fetchVolumes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error creating volume",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  inspectVolume: async (volumeName: string) => {
    set({ inspectLoading: true, inspectData: null });
    try {
      const cmd = Command.create("docker", ["volume", "inspect", volumeName]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to inspect volume");
      }

      const jsonData = JSON.parse(output.stdout || "[]");
      if (!jsonData || jsonData.length === 0) {
        throw new Error("No volume data returned");
      }

      const data = jsonData[0];

      const inspectData = {
        name: data.Name || "N/A",
        driver: data.Driver || "N/A",
        mountpoint: data.Mountpoint || "N/A",
        createdAt: data.CreatedAt || "N/A",
        scope: data.Scope || "N/A",
        options: data.Options || {},
        labels: data.Labels || {},
      };

      set({ inspectData, inspectLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ inspectData: null, inspectLoading: false });
      addToast({
        title: "Error inspecting volume",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },

  pruneVolumes: async () => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["volume", "prune", "-f"]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to prune volumes");
      }

      addToast({
        title: "Success",
        description: "Unused volumes removed successfully",
        color: "success",
        timeout: 1000,
      });

      // Refresh volume list
      await get().fetchVolumes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error pruning volumes",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
}));
