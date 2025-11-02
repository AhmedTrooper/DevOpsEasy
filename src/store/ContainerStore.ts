import { ContainerState } from "@/interface/store/ContainerStoreInterface";
import { Command } from "@tauri-apps/plugin-shell";
import { create } from "zustand";
import { addToast } from "@heroui/react";

export const useContainerStore = create<ContainerState>((set, get) => ({
  containers: [],
  setContainers: (containers) => set({ containers }),
  loading: false,
  setLoading: (status) => set({ loading: status }),
  error: null,
  setError: (error) => set({ error }),
  operationLoading: false,
  setOperationLoading: (status) => set({ operationLoading: status }),
  logs: "",
  setLogs: (logs) => set({ logs }),
  logsLoading: false,
  setLogsLoading: (status) => set({ logsLoading: status }),
  stats: [],
  setStats: (stats) => set({ stats }),
  statsLoading: false,
  setStatsLoading: (status) => set({ statsLoading: status }),
  inspectData: null,
  setInspectData: (data) => set({ inspectData: data }),
  inspectLoading: false,
  setInspectLoading: (status) => set({ inspectLoading: status }),
  terminalOutput: "",
  setTerminalOutput: (output) => set({ terminalOutput: output }),
  terminalLoading: false,
  setTerminalLoading: (status) => set({ terminalLoading: status }),
  appendTerminalOutput: (output) => set({ terminalOutput: get().terminalOutput + output }),
  clearTerminalOutput: () => set({ terminalOutput: "" }),
  topOutput: "",
  setTopOutput: (output) => set({ topOutput: output }),
  topLoading: false,
  setTopLoading: (status) => set({ topLoading: status }),
  fetchContainers: async () => {
    set({ loading: true, error: null });
    try {
      const cmd = Command.create("docker", [
        "ps",
        "-a",
        "--format",
        "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}|{{.Ports}}|{{.CreatedAt}}",
      ]);

      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch Docker containers");
      }

      const lines = (output.stdout || "").trim().split("\n");

      const containers = lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [id, name, image, status, state, ports, createdAt] =
            line.split("|");

          return {
            id,
            name,
            image,
            status,
            state,
            ports,
            createdAt,
          };
        });

      set({ containers, loading: false });
      addToast({
        title: "Success",
        description: `Loaded ${containers.length} Docker containers`,
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ error: errorMessage, loading: false, containers: [] });
      addToast({
        title: "Error fetching containers",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },
  startContainer: async (containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["start", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to start container");
      }

      addToast({
        title: "Container Started",
        description: `Container ${containerId.substring(0, 12)} started successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh container list
      await get().fetchContainers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error starting container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
  stopContainer: async (containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["stop", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to stop container");
      }

      addToast({
        title: "Container Stopped",
        description: `Container ${containerId.substring(0, 12)} stopped successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh container list
      await get().fetchContainers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error stopping container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
  restartContainer: async (containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["restart", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to restart container");
      }

      addToast({
        title: "Container Restarted",
        description: `Container ${containerId.substring(0, 12)} restarted successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh container list
      await get().fetchContainers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error restarting container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
  deleteContainer: async (containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["rm", "-f", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to delete container");
      }

      addToast({
        title: "Container Deleted",
        description: `Container ${containerId.substring(0, 12)} deleted successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh container list
      await get().fetchContainers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error deleting container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  pauseContainer: async (containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["pause", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to pause container");
      }

      addToast({
        title: "Container Paused",
        description: `Container ${containerId.substring(0, 12)} paused successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh container list
      await get().fetchContainers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error pausing container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  unpauseContainer: async (containerId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["unpause", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to unpause container");
      }

      addToast({
        title: "Container Unpaused",
        description: `Container ${containerId.substring(0, 12)} unpaused successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh container list
      await get().fetchContainers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error unpausing container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  renameContainer: async (containerId: string, newName: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["rename", containerId, newName]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to rename container");
      }

      addToast({
        title: "Container Renamed",
        description: `Container renamed to ${newName} successfully`,
        color: "success",
        timeout: 2000,
      });

      // Refresh container list
      await get().fetchContainers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error renaming container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  exportContainer: async (containerId: string, outputPath: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["export", "-o", outputPath, containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to export container");
      }

      addToast({
        title: "Container Exported",
        description: `Container exported to ${outputPath}`,
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error exporting container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  commitContainer: async (containerId: string, imageName: string, message?: string) => {
    set({ operationLoading: true });
    try {
      const args = ["commit"];
      if (message) {
        args.push("-m", message);
      }
      args.push(containerId, imageName);

      const cmd = Command.create("docker", args);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to commit container");
      }

      addToast({
        title: "Container Committed",
        description: `Created image ${imageName} from container`,
        color: "success",
        timeout: 2000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error committing container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  topContainer: async (containerId: string) => {
    set({ topLoading: true });
    try {
      const cmd = Command.create("docker", ["top", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to get container processes");
      }

      set({ topOutput: output.stdout || "No processes found", topLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ topOutput: `Error: ${errorMessage}`, topLoading: false });
      addToast({
        title: "Error fetching processes",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },

  fetchLogs: async (containerId: string, tail: number = 100) => {
    set({ logsLoading: true });
    try {
      const cmd = Command.create("docker", [
        "logs",
        "--tail",
        tail.toString(),
        "--timestamps",
        containerId,
      ]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch container logs");
      }

      set({ logs: output.stdout || "", logsLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ logs: `Error: ${errorMessage}`, logsLoading: false });
      addToast({
        title: "Error fetching logs",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },

  clearLogs: () => {
    set({ logs: "" });
  },

  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      const cmd = Command.create("docker", [
        "stats",
        "--no-stream",
        "--format",
        "{{.ID}}|{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.BlockIO}}|{{.PIDs}}",
      ]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch container stats");
      }

      const lines = (output.stdout || "").trim().split("\n");

      const stats = lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [id, name, cpuPerc, memUsage, memPerc, netIO, blockIO, pids] = line.split("|");

          return {
            id: id || "",
            name: name || "",
            cpuPerc: cpuPerc || "0%",
            memUsage: memUsage || "0B / 0B",
            memPerc: memPerc || "0%",
            netIO: netIO || "0B / 0B",
            blockIO: blockIO || "0B / 0B",
            pids: pids || "0",
          };
        });

      set({ stats, statsLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ stats: [], statsLoading: false });
      addToast({
        title: "Error fetching stats",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },

  inspectContainer: async (containerId: string) => {
    set({ inspectLoading: true, inspectData: null });
    try {
      const cmd = Command.create("docker", ["inspect", containerId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to inspect container");
      }

      const jsonData = JSON.parse(output.stdout || "[]");
      if (!jsonData || jsonData.length === 0) {
        throw new Error("No container data returned");
      }

      const data = jsonData[0];
      
      // Parse mounts
      const mounts = (data.Mounts || []).map((mount: any) => ({
        type: mount.Type || "N/A",
        source: mount.Source || "N/A",
        destination: mount.Destination || "N/A",
        mode: mount.Mode || "N/A",
      }));

      // Parse networks
      const networks = Object.entries(data.NetworkSettings?.Networks || {}).map(([name, netData]: [string, any]) => ({
        name,
        ipAddress: netData.IPAddress || "N/A",
        gateway: netData.Gateway || "N/A",
        macAddress: netData.MacAddress || "N/A",
      }));

      // Parse ports
      const ports = Object.keys(data.NetworkSettings?.Ports || {});

      const inspectData = {
        id: data.Id || "N/A",
        name: data.Name?.replace("/", "") || "N/A",
        image: data.Config?.Image || "N/A",
        status: data.State?.Status || "N/A",
        state: data.State?.Running ? "running" : "stopped",
        created: data.Created || "N/A",
        platform: data.Platform || "N/A",
        restartCount: String(data.RestartCount || 0),
        driver: data.Driver || "N/A",
        hostname: data.Config?.Hostname || "N/A",
        env: data.Config?.Env || [],
        cmd: data.Config?.Cmd || [],
        mounts,
        networks,
        ports,
      };

      set({ inspectData, inspectLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ inspectData: null, inspectLoading: false });
      addToast({
        title: "Error inspecting container",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },

  execCommand: async (containerId: string, command: string) => {
    set({ terminalLoading: true });
    try {
      const cmd = Command.create("docker", [
        "exec",
        containerId,
        "sh",
        "-c",
        command
      ]);
      
      const output = await cmd.execute();
      
      const timestamp = new Date().toLocaleTimeString();
      const commandLine = `\n[${timestamp}] $ ${command}\n`;
      
      if (output.code !== 0) {
        const errorOutput = output.stderr || "Command failed";
        set({ 
          terminalOutput: get().terminalOutput + commandLine + errorOutput + "\n",
          terminalLoading: false 
        });
      } else {
        const successOutput = output.stdout || "(no output)";
        set({ 
          terminalOutput: get().terminalOutput + commandLine + successOutput + "\n",
          terminalLoading: false 
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const timestamp = new Date().toLocaleTimeString();
      set({ 
        terminalOutput: get().terminalOutput + `\n[${timestamp}] Error: ${errorMessage}\n`,
        terminalLoading: false 
      });
      addToast({
        title: "Error executing command",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    }
  },
}));

