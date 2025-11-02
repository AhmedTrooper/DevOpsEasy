export interface DockerVolume {
  name: string | null;
  driver: string | null;
  mountpoint: string | null;
  createdAt: string | null;
  size: string | null;
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
}
