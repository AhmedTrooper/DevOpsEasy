export interface DockerVolume {
  name: string | null;
  driver: string | null;
  mountpoint: string | null;
  createdAt: string | null;
  size: string | null;
}

export interface VolumeInspect {
  name: string;
  driver: string;
  mountpoint: string;
  createdAt: string;
  scope: string;
  options: Record<string, string>;
  labels: Record<string, string>;
}

export interface VolumeState {
  volumes: DockerVolume[];
  setVolumes: (volumes: DockerVolume[]) => void;
  fetchVolumes: () => Promise<void>;
  loading: boolean;
  setLoading: (status: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  deleteVolume: (volumeName: string) => Promise<void>;
  operationLoading: boolean;
  setOperationLoading: (status: boolean) => void;
  
  // New methods
  createVolume: (name: string, driver?: string, options?: Record<string, string>) => Promise<void>;
  inspectVolume: (volumeName: string) => Promise<void>;
  inspectData: VolumeInspect | null;
  setInspectData: (data: VolumeInspect | null) => void;
  inspectLoading: boolean;
  setInspectLoading: (status: boolean) => void;
  pruneVolumes: () => Promise<void>;
}
