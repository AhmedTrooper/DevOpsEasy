import { create } from "zustand";
import { Command } from "@tauri-apps/plugin-shell";
import { ComposeState } from "@/interface/store/ComposeStoreInterface";
import { addToast } from "@heroui/react";

export const useComposeStore = create<ComposeState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  operationLoading: false,

  setProjects: (projects) => set({ projects }),
  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error }),
  setOperationLoading: (status) => set({ operationLoading: status }),

  fetchProjects: async () => {
    if (get().loading) return;

    set({ loading: true, error: null });
    try {
      const cmd = Command.create("docker", ["compose", "ls", "--all"]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(
          output.stderr || "Failed to fetch Docker Compose projects"
        );
      }

      const lines = (output.stdout || "").trim().split("\n");

      // Skip header line and parse the table output
      const projects = lines
        .slice(1) // Skip header
        .filter((line) => line.trim() !== "")
        .map((line) => {
          // Docker compose ls outputs: NAME  STATUS  CONFIG FILES
          const parts = line.trim().split(/\s{2,}/); // Split by 2+ spaces

          return {
            name: parts[0] || "",
            status: parts[1] || "",
            configFiles: parts[2] || "",
          };
        });

      set({ projects, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ error: errorMessage, loading: false, projects: [] });
      addToast({
        title: "Error fetching compose projects",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },

  upProject: async (filePath: string, projectName?: string) => {
    set({ operationLoading: true });
    try {
      const args = ["compose", "-f", filePath];

      if (projectName) {
        args.push("-p", projectName);
      }

      args.push("up", "-d");

      const cmd = Command.create("docker", args);
      const output = await cmd.execute();

      console.log("Docker compose command:", "docker", args.join(" "));
      console.log("Exit code:", output.code);
      console.log("Stdout:", output.stdout);
      console.log("Stderr:", output.stderr);

      if (output.code !== 0) {
        const errorMsg = output.stderr || output.stdout || "Failed to start compose project";
        throw new Error(errorMsg);
      }

      const outputText = output.stdout || output.stderr || "";
      
      addToast({
        title: "Compose Started",
        description: outputText.split('\n').slice(0, 3).join(' ') || "Check console for details",
        color: "success",
        timeout: 2000,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await get().fetchProjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error starting compose project",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  startProject: async (projectName: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", [
        "compose",
        "-p",
        projectName,
        "up",
        "-d",
      ]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to start project");
      }

      addToast({
        title: "Project Started",
        description: `Project ${projectName} started successfully`,
        color: "success",
        timeout: 1000,
      });

      await get().fetchProjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error starting project",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  stopProject: async (projectName: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", [
        "compose",
        "-p",
        projectName,
        "stop",
      ]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to stop project");
      }

      addToast({
        title: "Project Stopped",
        description: `Project ${projectName} stopped successfully`,
        color: "success",
        timeout: 1000,
      });

      await get().fetchProjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error stopping project",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  restartProject: async (projectName: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", [
        "compose",
        "-p",
        projectName,
        "restart",
      ]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to restart project");
      }

      addToast({
        title: "Project Restarted",
        description: `Project ${projectName} restarted successfully`,
        color: "success",
        timeout: 1000,
      });

      await get().fetchProjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error restarting project",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  downProject: async (projectName: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", [
        "compose",
        "-p",
        projectName,
        "down",
      ]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to remove project");
      }

      addToast({
        title: "Project Removed",
        description: `Project ${projectName} removed successfully`,
        color: "success",
        timeout: 1000,
      });

      await get().fetchProjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error removing project",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },
}));
