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
  inspectData: null,
  setInspectData: (data) => set({ inspectData: data }),
  inspectLoading: false,
  setInspectLoading: (status) => set({ inspectLoading: status }),
  
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
        timeout: 1000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ error: errorMessage, loading: false, networks: [] });
      addToast({
        title: "Error fetching networks",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
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
        timeout: 1000,
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
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  createNetwork: async (name: string, driver?: string, subnet?: string, gateway?: string) => {
    set({ operationLoading: true });
    try {
      const args = ["network", "create"];
      
      if (driver) {
        args.push("--driver", driver);
      }
      
      if (subnet) {
        args.push("--subnet", subnet);
        if (gateway) {
          args.push("--gateway", gateway);
        }
      }
      
      args.push(name);
      
      const cmd = Command.create("docker", args);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to create network");
      }

      addToast({
        title: "Network Created",
        description: `Network ${name} created successfully`,
        color: "success",
        timeout: 1000,
      });

      // Refresh network list
      await get().fetchNetworks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error creating network",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  inspectNetwork: async (networkId: string) => {
    set({ inspectLoading: true, inspectData: null });
    try {
      const cmd = Command.create("docker", ["network", "inspect", networkId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to inspect network");
      }

      const jsonData = JSON.parse(output.stdout || "[]");
      if (!jsonData || jsonData.length === 0) {
        throw new Error("No network data returned");
      }

      const data = jsonData[0];

      const inspectData = {
        name: data.Name || "N/A",
        id: data.Id || "N/A",
        created: data.Created || "N/A",
        scope: data.Scope || "N/A",
        driver: data.Driver || "N/A",
        enableIPv6: data.EnableIPv6 || false,
        ipam: {
          driver: data.IPAM?.Driver || "N/A",
          config: data.IPAM?.Config?.map((c: any) => ({
            subnet: c.Subnet || "N/A",
            gateway: c.Gateway || "N/A",
          })) || [],
        },
        internal: data.Internal || false,
        attachable: data.Attachable || false,
        ingress: data.Ingress || false,
        containers: data.Containers || {},
        options: data.Options || {},
        labels: data.Labels || {},
      };

      set({ inspectData, inspectLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ inspectData: null, inspectLoading: false });
      addToast({
        title: "Error inspecting network",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },

  connectContainer: async (networkId: string, containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["network", "connect", networkId, containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to connect container to network");
      }

      addToast({
        title: "Container Connected",
        description: `Container connected to network successfully`,
        color: "success",
        timeout: 1000,
      });

      // Refresh network list
      await get().fetchNetworks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error connecting container",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  disconnectContainer: async (networkId: string, containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["network", "disconnect", networkId, containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to disconnect container from network");
      }

      addToast({
        title: "Container Disconnected",
        description: `Container disconnected from network successfully`,
        color: "success",
        timeout: 1000,
      });

      // Refresh network list
      await get().fetchNetworks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error disconnecting container",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  pruneNetworks: async () => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["network", "prune", "-f"]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to prune networks");
      }

      addToast({
        title: "Success",
        description: "Unused networks removed successfully",
        color: "success",
        timeout: 1000,
      });

      // Refresh network list
      await get().fetchNetworks();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error pruning networks",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
}));
