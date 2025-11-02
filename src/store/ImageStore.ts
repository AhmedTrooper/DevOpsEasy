import { ImageState } from "@/interface/store/ImageStoreInterface";
import { Command } from "@tauri-apps/plugin-shell";
import { create } from "zustand";
import { addToast } from "@heroui/react";

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  setImages: (images) => set({ images }),
  loading: false,
  setLoading: (status) => set({ loading: status }),
  error: null,
  setError: (error) => set({ error }),
  operationLoading: false,
  setOperationLoading: (status) => set({ operationLoading: status }),
  pullProgress: "",
  setPullProgress: (progress) => set({ pullProgress: progress }),
  appendPullProgress: (progress) => set({ pullProgress: get().pullProgress + progress }),
  clearPullProgress: () => set({ pullProgress: "" }),
  searchResults: "",
  setSearchResults: (results) => set({ searchResults: results }),
  searchLoading: false,
  setSearchLoading: (status) => set({ searchLoading: status }),
  inspectData: null,
  setInspectData: (data) => set({ inspectData: data }),
  inspectLoading: false,
  setInspectLoading: (status) => set({ inspectLoading: status }),
  buildOutput: "",
  setBuildOutput: (output) => set({ buildOutput: output }),
  buildLoading: false,
  setBuildLoading: (status) => set({ buildLoading: status }),
  appendBuildOutput: (output) => set({ buildOutput: get().buildOutput + output }),
  clearBuildOutput: () => set({ buildOutput: "" }),
  
  fetchImages: async () => {
    if (get().loading) return;
    
    set({ loading: true, error: null });
    try {
      const cmd = Command.create("docker", [
        "images",
        "--format",
        "{{.ID}}|{{.Repository}}|{{.Tag}}|{{.Digest}}|{{.Size}}|{{.CreatedSince}}|{{.CreatedAt}}",
      ]);

      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to fetch Docker images");
      }

      const lines = (output.stdout || "").trim().split("\n");

      const images = lines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [id, repository, tag, digest, size, createdSince, createdAt] =
            line.split("|");

          return {
            id,
            repository,
            tag,
            digest,
            size,
            createdSince,
            createdAt,
          };
        });

      set({ images, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ error: errorMessage, loading: false, images: [] });
      addToast({
        title: "Error fetching images",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },
  
  deleteImage: async (imageId: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["rmi", imageId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to delete image");
      }

      addToast({
        title: "Success",
        description: "Image deleted successfully",
        color: "success",
        timeout: 1000,
      });
      
      await get().fetchImages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error deleting image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  pullImage: async (imageName: string) => {
    set({ operationLoading: true, pullProgress: "" });
    try {
      const timestamp = new Date().toLocaleTimeString();
      get().appendPullProgress(`[${timestamp}] Starting pull for ${imageName}...\n`);

      addToast({
        title: "Pulling image",
        description: `Pulling ${imageName}...`,
        color: "primary",
        timeout: 1000,
      });

      const cmd = Command.create("docker", ["pull", imageName]);
      
      // Setup real-time output streaming
      cmd.stdout.on('data', (line) => {
        const timestamp = new Date().toLocaleTimeString();
        get().appendPullProgress(`[${timestamp}] ${line}\n`);
      });

      cmd.stderr.on('data', (line) => {
        const timestamp = new Date().toLocaleTimeString();
        get().appendPullProgress(`[${timestamp}] ${line}\n`);
      });

      // Spawn process and wait for completion
      await cmd.spawn();
      
      // Wait for process to complete using status check
      await new Promise<void>((resolve, reject) => {
        cmd.on('close', (data) => {
          if (data.code === 0) {
            resolve();
          } else {
            reject(new Error(`Failed to pull image. Exit code: ${data.code}`));
          }
        });
        
        cmd.on('error', (error) => {
          reject(new Error(`Process error: ${error}`));
        });
      });

      const successTime = new Date().toLocaleTimeString();
      get().appendPullProgress(`[${successTime}] ✅ Successfully pulled ${imageName}\n`);

      addToast({
        title: "Success",
        description: `Image ${imageName} pulled successfully`,
        color: "success",
        timeout: 1000,
      });
      
      await get().fetchImages();
    } catch (error) {
      const errorTime = new Date().toLocaleTimeString();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      get().appendPullProgress(`[${errorTime}] ❌ Error: ${errorMessage}\n`);
      
      addToast({
        title: "Error pulling image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  tagImage: async (imageId: string, newTag: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["tag", imageId, newTag]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to tag image");
      }

      addToast({
        title: "Success",
        description: `Image tagged as ${newTag}`,
        color: "success",
        timeout: 1000,
      });
      
      await get().fetchImages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error tagging image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  pushImage: async (imageName: string) => {
    set({ operationLoading: true });
    try {
      addToast({
        title: "Pushing image",
        description: `Pushing ${imageName} to registry...`,
        color: "primary",
        timeout: 1000,
      });

      const cmd = Command.create("docker", ["push", imageName]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to push image");
      }

      addToast({
        title: "Success",
        description: `Image ${imageName} pushed successfully`,
        color: "success",
        timeout: 1000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error pushing image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  saveImage: async (imageName: string, outputPath: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["save", "-o", outputPath, imageName]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to save image");
      }

      addToast({
        title: "Success",
        description: `Image saved to ${outputPath}`,
        color: "success",
        timeout: 1000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error saving image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  loadImage: async (tarPath: string) => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["load", "-i", tarPath]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to load image");
      }

      addToast({
        title: "Success",
        description: "Image loaded successfully",
        color: "success",
        timeout: 1000,
      });
      
      await get().fetchImages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error loading image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  pruneImages: async () => {
    set({ operationLoading: true });
    try {
      const cmd = Command.create("docker", ["image", "prune", "-a", "-f"]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to prune images");
      }

      addToast({
        title: "Success",
        description: "Unused images removed successfully",
        color: "success",
        timeout: 1000,
      });
      
      await get().fetchImages();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addToast({
        title: "Error pruning images",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    } finally {
      set({ operationLoading: false });
    }
  },

  searchImages: async (query: string) => {
    set({ searchLoading: true, searchResults: "" });
    try {
      const cmd = Command.create("docker", ["search", "--limit", "25", query]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to search images");
      }

      set({ searchResults: output.stdout || "No results found", searchLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ searchResults: `Error: ${errorMessage}`, searchLoading: false });
      addToast({
        title: "Error searching images",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },

  inspectImage: async (imageId: string) => {
    set({ inspectLoading: true, inspectData: null });
    try {
      const cmd = Command.create("docker", ["inspect", imageId]);
      const output = await cmd.execute();

      if (output.code !== 0) {
        throw new Error(output.stderr || "Failed to inspect image");
      }

      const jsonData = JSON.parse(output.stdout || "[]");
      if (!jsonData || jsonData.length === 0) {
        throw new Error("No image data returned");
      }

      const data = jsonData[0];

      // Parse layers
      const layers = data.RootFS?.Layers || [];

      // Parse history
      const history = (data.History || []).map((h: any) => ({
        created: h.created || "N/A",
        createdBy: h.created_by || "N/A",
        size: h.size ? `${(h.size / 1024 / 1024).toFixed(2)} MB` : "0 MB",
      }));

      // Parse config
      const config = {
        env: data.Config?.Env || [],
        cmd: data.Config?.Cmd || [],
        entrypoint: data.Config?.Entrypoint || [],
        exposedPorts: Object.keys(data.Config?.ExposedPorts || {}),
        workingDir: data.Config?.WorkingDir || "",
        user: data.Config?.User || "",
        labels: data.Config?.Labels || {},
      };

      const inspectData = {
        id: data.Id || "N/A",
        tags: data.RepoTags || [],
        created: data.Created || "N/A",
        size: data.Size ? `${(data.Size / 1024 / 1024).toFixed(2)} MB` : "N/A",
        architecture: data.Architecture || "N/A",
        os: data.Os || "N/A",
        author: data.Author || "N/A",
        dockerVersion: data.DockerVersion || "N/A",
        config,
        layers,
        history,
      };

      set({ inspectData, inspectLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      set({ inspectData: null, inspectLoading: false });
      addToast({
        title: "Error inspecting image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },

  buildImage: async (imageName: string, dockerfilePath: string, contextPath: string) => {
    set({ buildLoading: true, buildOutput: "" });
    
    const timestamp = new Date().toLocaleTimeString();
    set({ buildOutput: `[${timestamp}] Building image: ${imageName}\n` });
    set({ buildOutput: get().buildOutput + `[${timestamp}] Dockerfile: ${dockerfilePath}\n` });
    set({ buildOutput: get().buildOutput + `[${timestamp}] Context: ${contextPath}\n\n` });

    try {
      const cmd = Command.create("docker", [
        "build",
        "-t",
        imageName,
        "-f",
        dockerfilePath,
        contextPath
      ]);

      const output = await cmd.execute();
      
      const buildTimestamp = new Date().toLocaleTimeString();
      
      if (output.code !== 0) {
        const errorOutput = output.stderr || "Build failed";
        set({ 
          buildOutput: get().buildOutput + errorOutput + `\n\n[${buildTimestamp}] ❌ Build failed!\n`,
          buildLoading: false 
        });
        addToast({
          title: "Build failed",
          description: "Check the build output for details",
          color: "danger",
          timeout: 1000,
        });
      } else {
        const successOutput = output.stdout || "";
        set({ 
          buildOutput: get().buildOutput + successOutput + `\n\n[${buildTimestamp}] ✅ Build completed successfully!\n`,
          buildLoading: false 
        });
        addToast({
          title: "Build successful",
          description: `Image ${imageName} built successfully`,
          color: "success",
          timeout: 1500,
        });
        
        await get().fetchImages();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const errorTimestamp = new Date().toLocaleTimeString();
      set({ 
        buildOutput: get().buildOutput + `\n[${errorTimestamp}] ❌ Error: ${errorMessage}\n`,
        buildLoading: false 
      });
      addToast({
        title: "Error building image",
        description: errorMessage,
        color: "danger",
        timeout: 1500,
      });
    }
  },
}));

