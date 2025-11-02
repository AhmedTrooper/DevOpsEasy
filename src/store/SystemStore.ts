import { create } from "zustand";
import { SystemState } from "@/interface/store/SystemStoreInterface";
import { Command } from "@tauri-apps/plugin-shell";
import { addToast } from "@heroui/react";

export const useSystemStore = create<SystemState>((set) => ({
  systemInfo: null,
  systemInfoLoading: false,
  diskUsage: null,
  diskUsageLoading: false,

  fetchSystemInfo: async () => {
    set({ systemInfoLoading: true });
    try {
      const cmd = Command.create("docker", ["system", "info", "--format", "json"]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch system info");
      }

      const data = JSON.parse(output.stdout || "{}");

      const systemInfo = {
        serverVersion: data.ServerVersion || "N/A",
        os: data.OSType || "N/A",
        osType: data.OSType || "N/A",
        architecture: data.Architecture || "N/A",
        cpus: String(data.NCPU || "N/A"),
        totalMemory: formatBytes(data.MemTotal || 0),
        dockerRootDir: data.DockerRootDir || "N/A",
        storageDriver: data.Driver || "N/A",
        loggingDriver: data.LoggingDriver || "N/A",
        cgroupDriver: data.CgroupDriver || "N/A",
        kernelVersion: data.KernelVersion || "N/A",
        operatingSystem: data.OperatingSystem || "N/A",
        osVersion: data.OSVersion || "N/A",
        name: data.Name || "N/A",
      };

      set({ systemInfo, systemInfoLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      set({ systemInfo: null, systemInfoLoading: false });
      addToast({
        title: "Error fetching system info",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },

  fetchDiskUsage: async () => {
    set({ diskUsageLoading: true });
    try {
      const cmd = Command.create("docker", ["system", "df", "--format", "json"]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch disk usage");
      }

      const data = JSON.parse(output.stdout || "{}");

      // Parse images data
      const imagesData = data.Images?.[0] || {};
      const images = {
        type: "Images",
        total: imagesData.TotalCount || 0,
        active: imagesData.Active || 0,
        size: formatBytes(imagesData.Size || 0),
        reclaimable: formatBytes(imagesData.Reclaimable || 0),
        reclaimablePercent: imagesData.TotalCount > 0 
          ? `${((imagesData.Reclaimable / (imagesData.Size || 1)) * 100).toFixed(1)}%` 
          : "0%",
      };

      // Parse containers data
      const containersData = data.Containers?.[0] || {};
      const containers = {
        type: "Containers",
        total: containersData.TotalCount || 0,
        active: containersData.Active || 0,
        size: formatBytes(containersData.Size || 0),
        reclaimable: formatBytes(containersData.Reclaimable || 0),
        reclaimablePercent: containersData.TotalCount > 0
          ? `${((containersData.Reclaimable / (containersData.Size || 1)) * 100).toFixed(1)}%`
          : "0%",
      };

      // Parse volumes data
      const volumesData = data.Volumes?.[0] || {};
      const volumes = {
        type: "Volumes",
        total: volumesData.TotalCount || 0,
        active: volumesData.Active || 0,
        size: formatBytes(volumesData.Size || 0),
        reclaimable: formatBytes(volumesData.Reclaimable || 0),
        reclaimablePercent: volumesData.TotalCount > 0
          ? `${((volumesData.Reclaimable / (volumesData.Size || 1)) * 100).toFixed(1)}%`
          : "0%",
      };

      // Parse build cache data
      const buildCacheData = data.BuildCache?.[0] || {};
      const buildCache = {
        type: "Build Cache",
        total: buildCacheData.TotalCount || 0,
        active: buildCacheData.Active || 0,
        size: formatBytes(buildCacheData.Size || 0),
        reclaimable: formatBytes(buildCacheData.Reclaimable || 0),
        reclaimablePercent: buildCacheData.TotalCount > 0
          ? `${((buildCacheData.Reclaimable / (buildCacheData.Size || 1)) * 100).toFixed(1)}%`
          : "0%",
      };

      const diskUsage = { images, containers, volumes, buildCache };

      set({ diskUsage, diskUsageLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      set({ diskUsage: null, diskUsageLoading: false });
      addToast({
        title: "Error fetching disk usage",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },

  systemPrune: async (pruneAll: boolean, pruneVolumes: boolean) => {
    try {
      const args = ["system", "prune", "--force"];
      
      if (pruneAll) {
        args.push("--all");
      }
      
      if (pruneVolumes) {
        args.push("--volumes");
      }

      const cmd = Command.create("docker", args);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to prune system");
      }

      addToast({
        title: "System Pruned Successfully",
        description: "Docker system has been cleaned",
        color: "success",
        timeout: 1500,
      });

      // Refresh disk usage after pruning
      setTimeout(() => {
        useSystemStore.getState().fetchDiskUsage();
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error pruning system",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },
}));

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
