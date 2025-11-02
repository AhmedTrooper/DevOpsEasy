export interface DockerNetwork {
  id: string | null;
  name: string | null;
  driver: string | null;
  scope: string | null;
  createdAt: string | null;
}

export interface NetworkInspect {
  name: string;
  id: string;
  created: string;
  scope: string;
  driver: string;
  enableIPv6: boolean;
  ipam: {
    driver: string;
    config: Array<{
      subnet: string;
      gateway: string;
    }>;
  };
  internal: boolean;
  attachable: boolean;
  ingress: boolean;
  containers: Record<string, {
    name: string;
    endpointID: string;
    macAddress: string;
    ipv4Address: string;
    ipv6Address: string;
  }>;
  options: Record<string, string>;
  labels: Record<string, string>;
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
  
  // New methods
  createNetwork: (name: string, driver?: string, subnet?: string, gateway?: string) => Promise<void>;
  inspectNetwork: (networkId: string) => Promise<void>;
  inspectData: NetworkInspect | null;
  setInspectData: (data: NetworkInspect | null) => void;
  inspectLoading: boolean;
  setInspectLoading: (status: boolean) => void;
  connectContainer: (networkId: string, containerId: string) => Promise<void>;
  disconnectContainer: (networkId: string, containerId: string) => Promise<void>;
  pruneNetworks: () => Promise<void>;
}
