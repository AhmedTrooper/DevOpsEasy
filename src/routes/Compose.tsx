import { useComposeStore } from "@/store/ComposeStore";
import { useSettingsStore } from "@/store/SettingsStore";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  Layers,
  Loader2,
  Play,
  Square,
  RotateCw,
  Trash2,
  RefreshCw,
  Search,
  X,
  Upload,
  FolderOpen,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import { open } from "@tauri-apps/plugin-dialog";

export default function Compose() {
  const projects = useComposeStore((state) => state.projects);
  const loading = useComposeStore((state) => state.loading);
  const error = useComposeStore((state) => state.error);
  const fetchProjects = useComposeStore((state) => state.fetchProjects);
  const operationLoading = useComposeStore((state) => state.operationLoading);
  const upProject = useComposeStore((state) => state.upProject);
  const startProject = useComposeStore((state) => state.startProject);
  const stopProject = useComposeStore((state) => state.stopProject);
  const restartProject = useComposeStore((state) => state.restartProject);
  const downProject = useComposeStore((state) => state.downProject);

  const autoRefreshEnabled = useSettingsStore(
    (state) => state.autoRefreshEnabled
  );
  const autoRefreshInterval = useSettingsStore(
    (state) => state.autoRefreshInterval
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [upModalOpen, setUpModalOpen] = useState(false);
  const [composePath, setComposePath] = useState("");
  const [projectName, setProjectName] = useState("");

  const handleSelectComposeFile = async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Docker Compose",
          extensions: ["yml", "yaml"],
        },
      ],
    });

    if (selected) {
      setComposePath(selected as string);
    }
  };

  const handleUpProject = async () => {
    if (!composePath) return;

    await upProject(composePath, projectName || undefined);
    setUpModalOpen(false);
    setComposePath("");
    setProjectName("");
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchProjects();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, autoRefreshInterval, fetchProjects]);

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter((project) => {
      return (
        project.name?.toLowerCase().includes(query) ||
        project.status?.toLowerCase().includes(query) ||
        project.configFiles?.toLowerCase().includes(query)
      );
    });
  }, [projects, searchQuery]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading Docker Compose projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 text-xl font-semibold">Error: {error}</div>
      </div>
    );
  }

  const isRunning = (status: string) => {
    return status.toLowerCase().includes("running");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl p-2 font-bold gap-2 flex items-center">
          <Layers />
          <span className="text-orange-500">Docker</span> Compose
        </h1>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="solid"
            onPress={() => setUpModalOpen(true)}
            startContent={<Upload className="w-4 h-4" />}
          >
            Start from File
          </Button>
          <Button
            color="default"
            variant="flat"
            onPress={() => fetchProjects()}
            isDisabled={loading || operationLoading}
            startContent={
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <Input
          placeholder="Search compose projects by name or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          endContent={
            searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
        />
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredProjects.length} of {projects.length} projects
          </p>
        )}
      </div>

      {/* Projects List */}
      {!projects || projects.length === 0 ? (
        <div className="text-xl font-semibold">
          No Docker Compose projects found
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-xl font-semibold text-gray-500">
          No projects match your search criteria
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.name}>
              <CardHeader className="bg-orange-500 text-white font-bold text-2xl">
                {project.name}
              </CardHeader>
              <CardBody>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={clsx("font-bold", {
                      "text-green-500": isRunning(project.status),
                      "text-gray-500": !isRunning(project.status),
                    })}
                  >
                    {project.status}
                  </span>
                </p>
                <p>
                  <strong>Config Files:</strong> {project.configFiles}
                </p>
              </CardBody>
              <CardFooter className="flex gap-2 flex-wrap">
                <Button
                  color="success"
                  onPress={() => startProject(project.name)}
                  isDisabled={operationLoading || isRunning(project.status)}
                  className="flex gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </Button>
                <Button
                  color="warning"
                  onPress={() => stopProject(project.name)}
                  isDisabled={operationLoading || !isRunning(project.status)}
                  className="flex gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
                <Button
                  color="primary"
                  onPress={() => restartProject(project.name)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Restart
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    if (
                      confirm(
                        `Are you sure you want to remove project "${project.name}"? This will stop and remove all containers.`
                      )
                    ) {
                      downProject(project.name);
                    }
                  }}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Down
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Start from File Modal */}
      <Modal
        isOpen={upModalOpen}
        onClose={() => setUpModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Start Docker Compose from File</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <div className="flex gap-2 mb-2">
                  <Input
                    label="Compose File Path"
                    placeholder="Select docker-compose.yml file"
                    value={composePath}
                    onChange={(e) => setComposePath(e.target.value)}
                    description="Path to docker-compose.yml or docker-compose.yaml"
                    isRequired
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={handleSelectComposeFile}
                    className="mt-6"
                    startContent={<FolderOpen className="w-4 h-4" />}
                  >
                    Browse
                  </Button>
                </div>
              </div>
              <Input
                label="Project Name (optional)"
                placeholder="e.g., my-app"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                description="Custom project name (uses directory name if not specified)"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleUpProject}
              isDisabled={!composePath.trim()}
            >
              Start Project
            </Button>
            <Button color="default" onPress={() => setUpModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
