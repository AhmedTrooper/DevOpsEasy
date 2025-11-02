export interface SystemInfo {
  serverVersion: string;
  os: string;
  osType: string;
  architecture: string;
  cpus: string;
  totalMemory: string;
  dockerRootDir: string;
  storageDriver: string;
  loggingDriver: string;
  cgroupDriver: string;
  kernelVersion: string;
  operatingSystem: string;
  osVersion: string;
  name: string;
}

export interface DiskUsageItem {
  type: string;
  total: number;
  active: number;
  size: string;
  reclaimable: string;
  reclaimablePercent: string;
}

export interface SystemDiskUsage {
  images: DiskUsageItem;
  containers: DiskUsageItem;
  volumes: DiskUsageItem;
  buildCache: DiskUsageItem;
}

export interface SystemState {
  systemInfo: SystemInfo | null;
  systemInfoLoading: boolean;
  diskUsage: SystemDiskUsage | null;
  diskUsageLoading: boolean;

  fetchSystemInfo: () => Promise<void>;
  fetchDiskUsage: () => Promise<void>;
  systemPrune: (pruneAll: boolean, pruneVolumes: boolean) => Promise<void>;
}
