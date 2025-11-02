import { NetworkState } from "@/interface/store/NetworkStoreInterface";
import { Command } from "@tauri-apps/plugin-shell";
import { create } from "zustand";
import { addToast } from "@heroui/react";

export const useNetworkStore = create<NetworkState>((set, get) => ({
  networks: [],
  setNetworks: (networks) => set({ networks }),
  loading: false,
  setLoading: (status) => set({ loading: status }),
  error: null,
  setError: (error) => set({ error }),
  operationLoading: false,
  setOperationLoading: (status) => set({ operationLoading: status }),
  fetchNetworks: async () => {
    set({ loading: true, error: null });
    try {
      const cmd = Command.create("docker", [
        "network",
        "ls",
        "--format",
        "{{.ID}}|{{.Name}}|{{.Driver}}|{{.Scope}}|{{.CreatedAt}}",
      ]);

      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch Docker networks");
      }

      const lines = (output.stdout || "").trim().split("\n");

      const networks = lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [id, name, driver, scope, createdAt] = line.split("|");

          return {
            id,
            name,
            driver,
            scope,
            createdAt,
          };
        });

      set({ networks, loading: false });
      addToast({
        title: "Success",
        description: `Loaded ${networks.length} Docker networks`,
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ error: errorMessage, loading: false, networks: [] });
      addToast({
        title: "Error fetching networks",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },
  deleteNetwork: async (networkId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["network", "rm", networkId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to delete network");
      }

      addToast({
        title: "Network Deleted",
        description: `Network ${networkId.substring(0, 12)} deleted successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh network list
      await get().fetchNetworks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error deleting network",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
}));
