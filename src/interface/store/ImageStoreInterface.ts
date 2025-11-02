export interface DockerImage {
  id: string | null;
  repository: string | null;
  tag: string | null;
  digest: string | null;
  size: string | null;
  createdSince: string | null;
  createdAt: string | null;
}

export interface ImageInspect {
  id: string;
  tags: string[];
  created: string;
  size: string;
  architecture: string;
  os: string;
  author: string;
  dockerVersion: string;
  config: {
    env: string[];
    cmd: string[];
    entrypoint: string[];
    exposedPorts: string[];
    workingDir: string;
    user: string;
    labels: Record<string, string>;
  };
  layers: string[];
  history: Array<{
    created: string;
    createdBy: string;
    size: string;
  }>;
}

export interface ImageState {
  images: DockerImage[];
  setImages: (images: DockerImage[]) => void;
  fetchImages: () => Promise<void>;
  loading: boolean;
  setLoading: (status: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  deleteImage: (imageId: string) => Promise<void>;
  pullImage: (imageName: string) => Promise<void>;
  tagImage: (imageId: string, newTag: string) => Promise<void>;
  pushImage: (imageName: string) => Promise<void>;
  saveImage: (imageName: string, outputPath: string) => Promise<void>;
  loadImage: (tarPath: string) => Promise<void>;
  pruneImages: () => Promise<void>;
  searchImages: (query: string) => Promise<void>;
  searchResults: string;
  setSearchResults: (results: string) => void;
  searchLoading: boolean;
  setSearchLoading: (status: boolean) => void;
  operationLoading: boolean;
  setOperationLoading: (status: boolean) => void;
  pullProgress: string;
  setPullProgress: (progress: string) => void;
  appendPullProgress: (progress: string) => void;
  clearPullProgress: () => void;
  inspectData: ImageInspect | null;
  inspectLoading: boolean;
  setInspectData: (data: ImageInspect | null) => void;
  setInspectLoading: (status: boolean) => void;
  inspectImage: (imageId: string) => Promise<void>;
  buildImage: (imageName: string, dockerfilePath: string, contextPath: string) => Promise<void>;
  buildOutput: string;
  buildLoading: boolean;
  setBuildOutput: (output: string) => void;
  setBuildLoading: (status: boolean) => void;
  appendBuildOutput: (output: string) => void;
  clearBuildOutput: () => void;
}

