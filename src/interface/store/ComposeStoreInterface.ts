export interface ComposeProject {
  name: string;
  status: string;
  configFiles: string;
}

export interface ComposeState {
  projects: ComposeProject[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;

  setProjects: (projects: ComposeProject[]) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  setOperationLoading: (status: boolean) => void;

  fetchProjects: () => Promise<void>;
  upProject: (filePath: string, projectName?: string) => Promise<void>;
  startProject: (projectName: string) => Promise<void>;
  stopProject: (projectName: string) => Promise<void>;
  restartProject: (projectName: string) => Promise<void>;
  downProject: (projectName: string) => Promise<void>;
}
