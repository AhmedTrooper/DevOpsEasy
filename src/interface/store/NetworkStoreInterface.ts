export interface DockerNetwork {
  id: string | null;
  name: string | null;
  driver: string | null;
  scope: string | null;
  createdAt: string | null;
}

export interface NetworkState {
  networks: DockerNetwork[];
  setNetworks: (networks: DockerNetwork[]) => void;
  fetchNetworks: () => Promise<void>;
  loading: boolean;
  setLoading: (status: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  deleteNetwork: (networkId: string) => Promise<void>;
  operationLoading: boolean;
  setOperationLoading: (status: boolean) => void;
}
