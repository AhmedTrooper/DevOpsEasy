import { useContainerStore } from "@/store/ContainerStore";
import { useImageStore } from "@/store/ImageStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Autocomplete, AutocompleteItem } from "@heroui/react";
import { List, Loader2, Play, Square, RotateCw, Trash2, RefreshCw, Search, X, FileText, Download, Copy, Info, Terminal, Pause, PlayCircle, Edit, Save, GitCommit, Activity, PlusCircle } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import clsx from "clsx";
import { addToast } from "@heroui/react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export default function Container() {
  const containers = useContainerStore((state) => state.containers);
  const loading = useContainerStore((state) => state.loading);
  const error = useContainerStore((state) => state.error);
  const fetchContainers = useContainerStore((state) => state.fetchContainers);
  const operationLoading = useContainerStore((state) => state.operationLoading);
  const startContainer = useContainerStore((state) => state.startContainer);
  const stopContainer = useContainerStore((state) => state.stopContainer);
  const restartContainer = useContainerStore((state) => state.restartContainer);
  const deleteContainer = useContainerStore((state) => state.deleteContainer);
  const pauseContainer = useContainerStore((state) => state.pauseContainer);
  const unpauseContainer = useContainerStore((state) => state.unpauseContainer);
  const renameContainer = useContainerStore((state) => state.renameContainer);
  const exportContainer = useContainerStore((state) => state.exportContainer);
  const commitContainer = useContainerStore((state) => state.commitContainer);
  const topContainer = useContainerStore((state) => state.topContainer);
  const topOutput = useContainerStore((state) => state.topOutput);
  const topLoading = useContainerStore((state) => state.topLoading);
  const fetchLogs = useContainerStore((state) => state.fetchLogs);
  const streamLogs = useContainerStore((state) => state.streamLogs);
  const logs = useContainerStore((state) => state.logs);
  const logsLoading = useContainerStore((state) => state.logsLoading);
  const clearLogs = useContainerStore((state) => state.clearLogs);
  const stats = useContainerStore((state) => state.stats);
  const statsLoading = useContainerStore((state) => state.statsLoading);
  const fetchStats = useContainerStore((state) => state.fetchStats);
  const streamStats = useContainerStore((state) => state.streamStats);
  const inspectContainer = useContainerStore((state) => state.inspectContainer);
  const inspectData = useContainerStore((state) => state.inspectData);
  const inspectLoading = useContainerStore((state) => state.inspectLoading);
  const execCommand = useContainerStore((state) => state.execCommand);
  const terminalOutput = useContainerStore((state) => state.terminalOutput);
  const createContainer = useContainerStore((state) => state.createContainer);
  const terminalLoading = useContainerStore((state) => state.terminalLoading);
  const clearTerminalOutput = useContainerStore((state) => state.clearTerminalOutput);

  const images = useImageStore((state) => state.images);
  const fetchImages = useImageStore((state) => state.fetchImages);

  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [terminalModalOpen, setTerminalModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [commitModalOpen, setCommitModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [topModalOpen, setTopModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [generatedCommand, setGeneratedCommand] = useState("");
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [stopConfirmModalOpen, setStopConfirmModalOpen] = useState(false);
  const [restartConfirmModalOpen, setRestartConfirmModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<{ id: string; name: string } | null>(null);
  const [logLines, setLogLines] = useState(100);
  const [followLogs, setFollowLogs] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [streamingStats, setStreamingStats] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [newContainerName, setNewContainerName] = useState("");
  const [commitImageName, setCommitImageName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [exportPath, setExportPath] = useState("");
  const [createImage, setCreateImage] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPorts, setCreatePorts] = useState("");
  const [createEnv, setCreateEnv] = useState("");
  const [createVolumes, setCreateVolumes] = useState("");
  const [createCommand, setCreateCommand] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const handleOpenLogs = async (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setLogsModalOpen(true);
    // Start with static logs by default
    setFollowLogs(false);
    await fetchLogs(containerId, logLines);
  };

  const handleCloseLogs = () => {
    setLogsModalOpen(false);
    setSelectedContainer(null);
    setFollowLogs(false);
    clearLogs();
  };

  const handleRefreshLogs = async () => {
    if (selectedContainer) {
      if (followLogs) {
        // Restart streaming
        await streamLogs(selectedContainer.id, true);
      } else {
        // Fetch static logs
        await fetchLogs(selectedContainer.id, logLines);
      }
    }
  };

  const handleToggleFollowLogs = async () => {
    if (selectedContainer) {
      const newFollowState = !followLogs;
      setFollowLogs(newFollowState);
      
      if (newFollowState) {
        // Switch to streaming mode
        await streamLogs(selectedContainer.id, true);
      } else {
        // Switch to static mode
        await fetchLogs(selectedContainer.id, logLines);
      }
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    addToast({
      title: "Copied",
      description: "Logs copied to clipboard",
      color: "success",
      timeout: 2000,
    });
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedContainer?.name}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenInspect = async (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setInspectModalOpen(true);
    await inspectContainer(containerId);
  };

  const handleCloseInspect = () => {
    setInspectModalOpen(false);
    setSelectedContainer(null);
  };

  const handleOpenTerminal = (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setTerminalModalOpen(true);
    clearTerminalOutput();
  };

  const handleCloseTerminal = () => {
    setTerminalModalOpen(false);
    setSelectedContainer(null);
    setCommandInput("");
    clearTerminalOutput();
  };

  const handleExecuteCommand = async () => {
    if (!commandInput.trim() || !selectedContainer) return;
    
    await execCommand(selectedContainer.id, commandInput.trim());
    setCommandInput("");
    
    // Auto-scroll to bottom
    setTimeout(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleOpenRename = (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setNewContainerName(containerName);
    setRenameModalOpen(true);
  };

  const handleCloseRename = () => {
    setRenameModalOpen(false);
    setSelectedContainer(null);
    setNewContainerName("");
  };

  const handleRename = async () => {
    if (!newContainerName.trim() || !selectedContainer) return;
    
    await renameContainer(selectedContainer.id, newContainerName.trim());
    handleCloseRename();
  };

  const handleOpenExport = (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setExportPath(`/tmp/${containerName}.tar`);
    setExportModalOpen(true);
  };

  const handleCloseExport = () => {
    setExportModalOpen(false);
    setSelectedContainer(null);
    setExportPath("");
  };

  const handleExport = async () => {
    if (!exportPath.trim() || !selectedContainer) return;
    
    await exportContainer(selectedContainer.id, exportPath.trim());
    handleCloseExport();
  };

  const handleOpenCommit = (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setCommitImageName(`${containerName}:latest`);
    setCommitMessage("");
    setCommitModalOpen(true);
  };

  const handleCloseCommit = () => {
    setCommitModalOpen(false);
    setSelectedContainer(null);
    setCommitImageName("");
    setCommitMessage("");
  };

  const handleCommit = async () => {
    if (!commitImageName.trim() || !selectedContainer) return;
    
    await commitContainer(selectedContainer.id, commitImageName.trim(), commitMessage.trim() || undefined);
    handleCloseCommit();
  };

  const handleOpenTop = async (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setTopModalOpen(true);
    await topContainer(containerId);
  };

  const handleCloseTop = () => {
    setTopModalOpen(false);
    setSelectedContainer(null);
  };

  const handleToggleStats = async () => {
    if (!showStats) {
      // Show stats and start with static fetch
      setShowStats(true);
      setStreamingStats(false);
      await fetchStats();
    } else {
      // Hide stats
      setShowStats(false);
      setStreamingStats(false);
    }
  };

  const handleToggleStatsStreaming = async () => {
    if (!streamingStats) {
      // Start streaming
      setStreamingStats(true);
      await streamStats();
    } else {
      // Stop streaming and fetch static
      setStreamingStats(false);
      await fetchStats();
    }
  };

  const handleCreateContainer = async () => {
    if (!createImage.trim()) return;
    
    const ports = createPorts.trim() ? createPorts.split(',').map(p => p.trim()).filter(Boolean) : undefined;
    const env = createEnv.trim() ? createEnv.split(',').map(e => e.trim()).filter(Boolean) : undefined;
    const volumes = createVolumes.trim() ? createVolumes.split(',').map(v => v.trim()).filter(Boolean) : undefined;
    const name = createName.trim() || undefined;
    const command = createCommand.trim() || undefined;
    
    const dockerCommand = await createContainer(createImage, name, ports, env, volumes, command);
    
    if (dockerCommand) {
      setGeneratedCommand(dockerCommand);
      setCommandModalOpen(true);
    }
    
    // Close create modal and reset
    setCreateModalOpen(false);
    setCreateImage("");
    setCreateName("");
    setCreatePorts("");
    setCreateEnv("");
    setCreateVolumes("");
    setCreateCommand("");
  };

  const handleCopyCommand = async () => {
    try {
      await writeText(generatedCommand);
      addToast({
        title: "Copied to Clipboard",
        description: "Docker command copied successfully",
        color: "success",
        timeout: 1000,
      });
    } catch (error) {
      addToast({
        title: "Copy Failed",
        description: "Failed to copy command to clipboard",
        color: "danger",
        timeout: 1500,
      });
    }
  };

  const handleOpenDeleteConfirm = (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContainer) return;
    await deleteContainer(selectedContainer.id);
    setDeleteConfirmModalOpen(false);
    setSelectedContainer(null);
  };

  const handleOpenStopConfirm = (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setStopConfirmModalOpen(true);
  };

  const handleConfirmStop = async () => {
    if (!selectedContainer) return;
    await stopContainer(selectedContainer.id);
    setStopConfirmModalOpen(false);
    setSelectedContainer(null);
  };

  const handleOpenRestartConfirm = (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setRestartConfirmModalOpen(true);
  };

  const handleConfirmRestart = async () => {
    if (!selectedContainer) return;
    await restartContainer(selectedContainer.id);
    setRestartConfirmModalOpen(false);
    setSelectedContainer(null);
  };

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchContainers();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, autoRefreshInterval, fetchContainers]);

  // Auto-scroll logs when in follow mode
  useEffect(() => {
    if (followLogs && logsModalOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, followLogs, logsModalOpen]);

  // Filter containers based on search query and status
  const filteredContainers = useMemo(() => {
    let filtered = containers;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((container) => container.state === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((container) => {
        return (
          container.name?.toLowerCase().includes(query) ||
          container.id?.toLowerCase().includes(query) ||
          container.image?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [containers, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading Docker containers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 text-xl font-semibold">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!containers || containers.length === 0) {
    return (
      <div className="p-8">
        <div className="text-xl font-semibold">No Docker containers found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl p-2 font-bold gap-2 flex items-center">
          <List />
          <span className="text-blue-500">Docker</span> Containers
        </h1>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="solid"
            onPress={() => {
              fetchImages();
              setCreateModalOpen(true);
            }}
            startContent={<PlusCircle className="w-4 h-4" />}
          >
            Create Container
          </Button>
          <Button
            color={showStats ? "success" : "default"}
            variant={showStats ? "solid" : "flat"}
            onPress={handleToggleStats}
            startContent={<Activity className="w-4 h-4" />}
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </Button>
          <Button
            color="default"
            variant="flat"
            onPress={() => fetchContainers()}
            isDisabled={loading || operationLoading}
            startContent={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex gap-3">
        <Input
          placeholder="Search containers by name, ID, or image..."
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
          className="flex-1"
        />
        <Select
          label="Status"
          placeholder="Filter by status"
          selectedKeys={[statusFilter]}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <SelectItem key="all">All</SelectItem>
          <SelectItem key="running">Running</SelectItem>
          <SelectItem key="exited">Stopped</SelectItem>
          <SelectItem key="paused">Paused</SelectItem>
        </Select>
      </div>

      {(searchQuery || statusFilter !== "all") && (
        <p className="text-sm text-gray-500 mb-4">
          Found {filteredContainers.length} of {containers.length} containers
        </p>
      )}

      {/* Real-time Stats Section */}
      {showStats && (
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <span className="font-bold text-lg">Container Statistics</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color={streamingStats ? "success" : "default"}
                  onPress={handleToggleStatsStreaming}
                  startContent={streamingStats ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {streamingStats ? "Stop Stream" : "Start Stream"}
                </Button>
                <Button
                  size="sm"
                  color="default"
                  onPress={fetchStats}
                  isDisabled={streamingStats}
                  startContent={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {statsLoading && stats.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin w-6 h-6 mr-2" />
                <span>Loading stats...</span>
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No running containers to show stats
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-2">Container</th>
                      <th className="text-left p-2">CPU %</th>
                      <th className="text-left p-2">Memory Usage</th>
                      <th className="text-left p-2">Memory %</th>
                      <th className="text-left p-2">Net I/O</th>
                      <th className="text-left p-2">Block I/O</th>
                      <th className="text-left p-2">PIDs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <tr key={stat.id} className="border-b dark:border-gray-700">
                        <td className="p-2 font-mono text-xs">{stat.name}</td>
                        <td className="p-2 font-bold text-blue-600 dark:text-blue-400">{stat.cpuPerc}</td>
                        <td className="p-2 font-mono text-xs">{stat.memUsage}</td>
                        <td className="p-2 font-bold text-purple-600 dark:text-purple-400">{stat.memPerc}</td>
                        <td className="p-2 font-mono text-xs">{stat.netIO}</td>
                        <td className="p-2 font-mono text-xs">{stat.blockIO}</td>
                        <td className="p-2">{stat.pids}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Containers List */}
      {filteredContainers.length === 0 ? (
        <div className="text-xl font-semibold text-gray-500">
          No containers match your search criteria
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContainers.map((container) => (
            <Card key={container.id}>
              <CardHeader className="bg-blue-500 text-white font-bold text-2xl">
                {container.name}
              </CardHeader>
              <CardBody>
                <p>ID: {container.id}</p>
                <p>Image: {container.image}</p>
                <p>
                  Status:{" "}
                  <span
                    className={clsx("font-bold", {
                      "text-green-500": container.state === "running",
                      "text-red-500": container.state === "exited",
                      "text-yellow-500": container.state === "paused",
                    })}
                  >
                    {container.status}
                  </span>
                </p>
                <p>Ports: {container.ports || "None"}</p>
                <p>Created: {container.createdAt}</p>
              </CardBody>
              <CardFooter className="flex gap-2 flex-wrap">
                <Button
                  color="success"
                  onPress={() => startContainer(container.id!)}
                  isDisabled={
                    operationLoading || container.state === "running"
                  }
                  className="flex gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </Button>
                <Button
                  color="warning"
                  onPress={() => handleOpenStopConfirm(container.id!, container.name!)}
                  isDisabled={
                    operationLoading || container.state !== "running"
                  }
                  className="flex gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleOpenRestartConfirm(container.id!, container.name!)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Restart
                </Button>
                <Button
                  color="warning"
                  variant="flat"
                  onPress={() => pauseContainer(container.id!)}
                  isDisabled={
                    operationLoading || container.state !== "running" || container.status?.toLowerCase().includes("paused")
                  }
                  className="flex gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  onPress={() => unpauseContainer(container.id!)}
                  isDisabled={
                    operationLoading || !container.status?.toLowerCase().includes("paused")
                  }
                  className="flex gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Unpause
                </Button>
                <Button
                  color="default"
                  onPress={() => handleOpenLogs(container.id!, container.name!)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Logs
                </Button>
                <Button
                  color="secondary"
                  onPress={() => handleOpenInspect(container.id!, container.name!)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <Info className="w-4 h-4" />
                  Inspect
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => handleOpenTerminal(container.id!, container.name!)}
                  isDisabled={operationLoading || container.state !== "running"}
                  className="flex gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  Terminal
                </Button>
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={() => handleOpenRename(container.id!, container.name!)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Rename
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  onPress={() => handleOpenCommit(container.id!, container.name!)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <GitCommit className="w-4 h-4" />
                  Commit
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => handleOpenExport(container.id!, container.name!)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <Save className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  color="default"
                  variant="flat"
                  onPress={() => handleOpenTop(container.id!, container.name!)}
                  isDisabled={operationLoading || container.state !== "running"}
                  className="flex gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Processes
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleOpenDeleteConfirm(container.id!, container.name!)}
                  isDisabled={operationLoading}
                  className="flex gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Logs Modal */}
      <Modal 
        isOpen={logsModalOpen} 
        onClose={handleCloseLogs}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Container Logs: {selectedContainer?.name}
          </ModalHeader>
          <ModalBody>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8" />
                <span className="ml-2">Loading logs...</span>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-2 mb-3">
                  <Select
                    label="Lines"
                    selectedKeys={[logLines.toString()]}
                    onChange={(e) => {
                      setLogLines(Number(e.target.value));
                      if (selectedContainer && !followLogs) {
                        fetchLogs(selectedContainer.id, Number(e.target.value));
                      }
                    }}
                    className="w-32"
                    size="sm"
                    isDisabled={followLogs}
                  >
                    <SelectItem key="50">50</SelectItem>
                    <SelectItem key="100">100</SelectItem>
                    <SelectItem key="200">200</SelectItem>
                    <SelectItem key="500">500</SelectItem>
                    <SelectItem key="1000">1000</SelectItem>
                  </Select>
                  <Button
                    size="sm"
                    color={followLogs ? "success" : "default"}
                    onPress={handleToggleFollowLogs}
                    startContent={followLogs ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  >
                    {followLogs ? "Stop" : "Follow"}
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onPress={handleRefreshLogs}
                    startContent={<RefreshCw className="w-4 h-4" />}
                  >
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    color="default"
                    onPress={handleCopyLogs}
                    startContent={<Copy className="w-4 h-4" />}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    color="default"
                    onPress={handleDownloadLogs}
                    startContent={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
                </div>
                <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm max-h-[500px] overflow-y-auto">
                  {logs || "No logs available"}
                  <div ref={logsEndRef} />
                </pre>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={handleCloseLogs}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Inspect Modal */}
      <Modal 
        isOpen={inspectModalOpen} 
        onClose={handleCloseInspect}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="bg-blue-500 text-white">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span>Container Inspect: {selectedContainer?.name}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {inspectLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8" />
                <span className="ml-2">Loading container details...</span>
              </div>
            ) : inspectData ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <Card>
                  <CardHeader className="bg-blue-100 dark:bg-blue-900 font-bold">
                    Basic Information
                  </CardHeader>
                  <CardBody className="grid grid-cols-2 gap-3 text-sm">
                    <div><strong>ID:</strong> <span className="font-mono text-xs">{inspectData.id}</span></div>
                    <div><strong>Name:</strong> {inspectData.name}</div>
                    <div><strong>Image:</strong> {inspectData.image}</div>
                    <div><strong>Status:</strong> <span className={clsx("font-bold", { "text-green-500": inspectData.state === "running", "text-gray-500": inspectData.state !== "running" })}>{inspectData.status}</span></div>
                    <div><strong>Created:</strong> {inspectData.created}</div>
                    <div><strong>Platform:</strong> {inspectData.platform}</div>
                    <div><strong>Hostname:</strong> {inspectData.hostname}</div>
                    <div><strong>Driver:</strong> {inspectData.driver}</div>
                    <div><strong>Restart Count:</strong> {inspectData.restartCount}</div>
                  </CardBody>
                </Card>

                {/* Command */}
                {inspectData.cmd && inspectData.cmd.length > 0 && (
                  <Card>
                    <CardHeader className="bg-purple-100 dark:bg-purple-900 font-bold">
                      Command
                    </CardHeader>
                    <CardBody>
                      <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded block font-mono text-sm">
                        {inspectData.cmd.join(" ")}
                      </code>
                    </CardBody>
                  </Card>
                )}

                {/* Environment Variables */}
                {inspectData.env && inspectData.env.length > 0 && (
                  <Card>
                    <CardHeader className="bg-green-100 dark:bg-green-900 font-bold">
                      Environment Variables ({inspectData.env.length})
                    </CardHeader>
                    <CardBody>
                      <div className="max-h-60 overflow-y-auto">
                        {inspectData.env.map((envVar, index) => (
                          <div key={index} className="font-mono text-xs py-1 border-b last:border-b-0">
                            {envVar}
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Mounts */}
                {inspectData.mounts && inspectData.mounts.length > 0 && (
                  <Card>
                    <CardHeader className="bg-orange-100 dark:bg-orange-900 font-bold">
                      Mounts ({inspectData.mounts.length})
                    </CardHeader>
                    <CardBody className="space-y-2">
                      {inspectData.mounts.map((mount, index) => (
                        <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div><strong>Type:</strong> {mount.type}</div>
                          <div className="font-mono text-xs"><strong>Source:</strong> {mount.source}</div>
                          <div className="font-mono text-xs"><strong>Destination:</strong> {mount.destination}</div>
                          <div><strong>Mode:</strong> {mount.mode}</div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}

                {/* Networks */}
                {inspectData.networks && inspectData.networks.length > 0 && (
                  <Card>
                    <CardHeader className="bg-cyan-100 dark:bg-cyan-900 font-bold">
                      Networks ({inspectData.networks.length})
                    </CardHeader>
                    <CardBody className="space-y-2">
                      {inspectData.networks.map((network, index) => (
                        <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div><strong>Network:</strong> {network.name}</div>
                          <div><strong>IP Address:</strong> {network.ipAddress}</div>
                          <div><strong>Gateway:</strong> {network.gateway}</div>
                          <div className="font-mono text-xs"><strong>MAC Address:</strong> {network.macAddress}</div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}

                {/* Ports */}
                {inspectData.ports && inspectData.ports.length > 0 && (
                  <Card>
                    <CardHeader className="bg-pink-100 dark:bg-pink-900 font-bold">
                      Port Mappings ({inspectData.ports.length})
                    </CardHeader>
                    <CardBody className="space-y-2">
                      {inspectData.ports.map((port, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                              {port.containerPort}
                            </span>
                            <span className="text-gray-500">→</span>
                            <span className="font-mono">
                              {port.hostPort === "Not Published" ? (
                                <span className="text-orange-500 italic">{port.hostPort}</span>
                              ) : (
                                <>
                                  <span className="text-gray-600 dark:text-gray-400">{port.hostIp}</span>
                                  <span className="text-gray-500">:</span>
                                  <span className="font-bold text-green-600 dark:text-green-400">{port.hostPort}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No inspect data available
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={handleCloseInspect}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Terminal Modal */}
      <Modal 
        isOpen={terminalModalOpen} 
        onClose={handleCloseTerminal}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="bg-gray-900 text-green-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              <span>Terminal: {selectedContainer?.name}</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-0">
            <div className="bg-black text-green-400 p-4 font-mono text-sm min-h-[400px] max-h-[500px] overflow-y-auto">
              <div className="mb-2 text-yellow-500 text-xs">
                ⚠️ Note: Each command runs in a new shell session. Directory changes (cd) don't persist.
                <br />💡 Tip: Use combined commands like: <span className="text-blue-400">cd /app && ls -la</span>
              </div>
              <pre className="whitespace-pre-wrap break-words">
                {terminalOutput || "Ready to execute commands..."}
                <div ref={terminalEndRef} />
              </pre>
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter command (e.g., ls -la, pwd, cd /app && ls)"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExecuteCommand()}
                  className="flex-1 font-mono"
                  classNames={{
                    input: "bg-gray-800 text-green-400",
                    inputWrapper: "bg-gray-800 border-gray-700"
                  }}
                  startContent={<span className="text-green-400">$</span>}
                  isDisabled={terminalLoading}
                />
                <Button
                  color="success"
                  onPress={handleExecuteCommand}
                  isDisabled={!commandInput.trim() || terminalLoading}
                  isLoading={terminalLoading}
                >
                  Execute
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Press Enter or click Execute. Use && to chain commands (e.g., cd /home && ls)
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="bg-gray-900">
            <Button 
              color="default" 
              variant="flat"
              onPress={() => clearTerminalOutput()}
              className="mr-auto"
            >
              Clear
            </Button>
            <Button color="default" onPress={handleCloseTerminal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={handleCloseRename}
        size="md"
      >
        <ModalContent>
          <ModalHeader>Rename Container: {selectedContainer?.name}</ModalHeader>
          <ModalBody>
            <Input
              label="New Container Name"
              placeholder="Enter new name"
              value={newContainerName}
              onChange={(e) => setNewContainerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleRename}
              isDisabled={!newContainerName.trim() || newContainerName === selectedContainer?.name}
            >
              Rename
            </Button>
            <Button color="default" onPress={handleCloseRename}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={handleCloseExport}
        size="md"
      >
        <ModalContent>
          <ModalHeader>Export Container: {selectedContainer?.name}</ModalHeader>
          <ModalBody>
            <Input
              label="Export Path"
              placeholder="Enter file path (e.g., /tmp/container.tar)"
              value={exportPath}
              onChange={(e) => setExportPath(e.target.value)}
              description="Full path where the container filesystem will be saved as a tar file"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleExport}
              isDisabled={!exportPath.trim()}
            >
              Export
            </Button>
            <Button color="default" onPress={handleCloseExport}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Commit Modal */}
      <Modal
        isOpen={commitModalOpen}
        onClose={handleCloseCommit}
        size="md"
      >
        <ModalContent>
          <ModalHeader>Commit Container to Image: {selectedContainer?.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Image Name"
                placeholder="e.g., myimage:latest"
                value={commitImageName}
                onChange={(e) => setCommitImageName(e.target.value)}
                description="Name and tag for the new image"
                autoFocus
              />
              <Input
                label="Commit Message (Optional)"
                placeholder="Describe the changes..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                description="Optional message describing the commit"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleCommit}
              isDisabled={!commitImageName.trim()}
            >
              Commit
            </Button>
            <Button color="default" onPress={handleCloseCommit}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Top/Processes Modal */}
      <Modal
        isOpen={topModalOpen}
        onClose={handleCloseTop}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Running Processes: {selectedContainer?.name}</ModalHeader>
          <ModalBody>
            {topLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : (
              <div
                className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-auto"
                style={{ minHeight: "300px" }}
              >
                <pre className="whitespace-pre-wrap">{topOutput}</pre>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={handleCloseTop}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Container Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Create New Container</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  💡 <strong>Tip:</strong> For containers that keep running, use commands like:
                </p>
                <ul className="text-xs mt-2 ml-4 list-disc text-blue-600 dark:text-blue-400">
                  <li>Alpine/Ubuntu: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">sleep infinity</code></li>
                  <li>Bash shell: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/bin/bash -c "while true; do sleep 1000; done"</code></li>
                  <li>Interactive: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/bin/sh</code> (but won't stay running in detached mode)</li>
                </ul>
                <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
                  Without a long-running command, containers exit immediately after the command completes.
                </p>
              </div>
              <Autocomplete
                label="Image Name (required)"
                placeholder="Select an image or type custom (e.g., nginx:latest)"
                value={createImage}
                onInputChange={(value) => setCreateImage(value)}
                onSelectionChange={(key) => setCreateImage(key as string)}
                description="Select from local images or type a custom image name"
                isRequired
                allowsCustomValue
              >
                {images.map((image) => {
                  const imageName = `${image.repository}:${image.tag}`;
                  return (
                    <AutocompleteItem key={imageName}>
                      {imageName}
                    </AutocompleteItem>
                  );
                })}
              </Autocomplete>
              <Input
                label="Container Name (optional)"
                placeholder="e.g., my-nginx"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                description="Custom name for the container"
              />
              <Input
                label="Port Mappings (optional)"
                placeholder="e.g., 8080:80, 3000:3000"
                value={createPorts}
                onChange={(e) => setCreatePorts(e.target.value)}
                description="Comma-separated port mappings (host:container)"
              />
              <Input
                label="Environment Variables (optional)"
                placeholder="e.g., NODE_ENV=production, API_KEY=abc123"
                value={createEnv}
                onChange={(e) => setCreateEnv(e.target.value)}
                description="Comma-separated environment variables (KEY=value)"
              />
              <Input
                label="Volume Mounts (optional)"
                placeholder="e.g., /host/path:/container/path, /data:/app/data"
                value={createVolumes}
                onChange={(e) => setCreateVolumes(e.target.value)}
                description="Comma-separated volume mounts (host:container)"
              />
              <Input
                label="Command (IMPORTANT - keeps container running)"
                placeholder="sleep infinity"
                value={createCommand}
                onChange={(e) => setCreateCommand(e.target.value)}
                description="⚠️ Required for most images to prevent immediate exit. Use 'sleep infinity' for Alpine/Ubuntu."
                classNames={{
                  label: "font-semibold text-warning",
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleCreateContainer}
              isDisabled={!createImage.trim()}
            >
              Create Container
            </Button>
            <Button color="default" onPress={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModalOpen}
        onClose={() => setDeleteConfirmModalOpen(false)}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader className="text-danger">Confirm Delete Container</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete container <strong>{selectedContainer?.name}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
            >
              Delete
            </Button>
            <Button color="default" onPress={() => setDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Stop Confirmation Modal */}
      <Modal
        isOpen={stopConfirmModalOpen}
        onClose={() => setStopConfirmModalOpen(false)}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader className="text-warning">Confirm Stop Container</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to stop container <strong>{selectedContainer?.name}</strong>?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="warning"
              onPress={handleConfirmStop}
            >
              Stop
            </Button>
            <Button color="default" onPress={() => setStopConfirmModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Restart Confirmation Modal */}
      <Modal
        isOpen={restartConfirmModalOpen}
        onClose={() => setRestartConfirmModalOpen(false)}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader className="text-primary">Confirm Restart Container</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to restart container <strong>{selectedContainer?.name}</strong>?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleConfirmRestart}
            >
              Restart
            </Button>
            <Button color="default" onPress={() => setRestartConfirmModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Generated Command Modal */}
      <Modal
        isOpen={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Docker Run Command
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-default-500">
                Copy and paste this command in your terminal to create the container:
              </p>
              <div className="bg-default-100 p-4 rounded-lg relative">
                <pre className="text-sm select-text overflow-x-auto" style={{ userSelect: "text" }}>
                  {generatedCommand}
                </pre>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              startContent={<Copy className="w-4 h-4" />}
              onPress={handleCopyCommand}
            >
              Copy Command
            </Button>
            <Button color="default" onPress={() => setCommandModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
