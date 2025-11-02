export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  createdAt: string;
}

export interface ContainerStats {
  id: string;
  name: string;
  cpuPerc: string;
  memUsage: string;
  memPerc: string;
  netIO: string;
  blockIO: string;
  pids: string;
}

export interface ContainerInspect {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: string;
  platform: string;
  restartCount: string;
  driver: string;
  hostname: string;
  env: string[];
  cmd: string[];
  mounts: Array<{
    type: string;
    source: string;
    destination: string;
    mode: string;
  }>;
  networks: Array<{
    name: string;
    ipAddress: string;
    gateway: string;
    macAddress: string;
  }>;
  ports: string[];
}

export interface ContainerState {
  containers: DockerContainer[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
  logs: string;
  logsLoading: boolean;
  stats: ContainerStats[];
  statsLoading: boolean;
  inspectData: ContainerInspect | null;
  inspectLoading: boolean;
  terminalOutput: string;
  terminalLoading: boolean;

  setContainers: (containers: DockerContainer[]) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  setOperationLoading: (status: boolean) => void;
  setLogs: (logs: string) => void;
  setLogsLoading: (status: boolean) => void;
  setStats: (stats: ContainerStats[]) => void;
  setStatsLoading: (status: boolean) => void;
  setInspectData: (data: ContainerInspect | null) => void;
  setInspectLoading: (status: boolean) => void;
  setTerminalOutput: (output: string) => void;
  setTerminalLoading: (status: boolean) => void;
  appendTerminalOutput: (output: string) => void;
  clearTerminalOutput: () => void;

  fetchContainers: () => Promise<void>;
  startContainer: (containerId: string) => Promise<void>;
  stopContainer: (containerId: string) => Promise<void>;
  restartContainer: (containerId: string) => Promise<void>;
  deleteContainer: (containerId: string) => Promise<void>;
  pauseContainer: (containerId: string) => Promise<void>;
  unpauseContainer: (containerId: string) => Promise<void>;
  renameContainer: (containerId: string, newName: string) => Promise<void>;
  exportContainer: (containerId: string, outputPath: string) => Promise<void>;
  commitContainer: (containerId: string, imageName: string, message?: string) => Promise<void>;
  topContainer: (containerId: string) => Promise<void>;
  topOutput: string;
  setTopOutput: (output: string) => void;
  topLoading: boolean;
  setTopLoading: (status: boolean) => void;
  fetchLogs: (containerId: string, tail?: number) => Promise<void>;
  clearLogs: () => void;
  fetchStats: () => Promise<void>;
  inspectContainer: (containerId: string) => Promise<void>;
  execCommand: (containerId: string, command: string) => Promise<void>;
}
