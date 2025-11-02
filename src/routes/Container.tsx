import { useContainerStore } from "@/store/ContainerStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { List, Loader2, Play, Square, RotateCw, Trash2, RefreshCw, Search, X, FileText, Download, Copy, Info, Terminal, Pause, PlayCircle, Edit, Save, GitCommit, Activity } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import clsx from "clsx";
import { addToast } from "@heroui/react";

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
  const logs = useContainerStore((state) => state.logs);
  const logsLoading = useContainerStore((state) => state.logsLoading);
  const clearLogs = useContainerStore((state) => state.clearLogs);
  const inspectContainer = useContainerStore((state) => state.inspectContainer);
  const inspectData = useContainerStore((state) => state.inspectData);
  const inspectLoading = useContainerStore((state) => state.inspectLoading);
  const execCommand = useContainerStore((state) => state.execCommand);
  const terminalOutput = useContainerStore((state) => state.terminalOutput);
  const terminalLoading = useContainerStore((state) => state.terminalLoading);
  const clearTerminalOutput = useContainerStore((state) => state.clearTerminalOutput);

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
  const [selectedContainer, setSelectedContainer] = useState<{ id: string; name: string } | null>(null);
  const [logLines, setLogLines] = useState(100);
  const [commandInput, setCommandInput] = useState("");
  const [newContainerName, setNewContainerName] = useState("");
  const [commitImageName, setCommitImageName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [exportPath, setExportPath] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const handleOpenLogs = async (containerId: string, containerName: string) => {
    setSelectedContainer({ id: containerId, name: containerName });
    setLogsModalOpen(true);
    await fetchLogs(containerId, logLines);
  };

  const handleCloseLogs = () => {
    setLogsModalOpen(false);
    setSelectedContainer(null);
    clearLogs();
  };

  const handleRefreshLogs = async () => {
    if (selectedContainer) {
      await fetchLogs(selectedContainer.id, logLines);
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
                  onPress={() => stopContainer(container.id!)}
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
                  onPress={() => restartContainer(container.id!)}
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
                  onPress={() => deleteContainer(container.id!)}
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
                      if (selectedContainer) {
                        fetchLogs(selectedContainer.id, Number(e.target.value));
                      }
                    }}
                    className="w-32"
                    size="sm"
                  >
                    <SelectItem key="50">50</SelectItem>
                    <SelectItem key="100">100</SelectItem>
                    <SelectItem key="200">200</SelectItem>
                    <SelectItem key="500">500</SelectItem>
                    <SelectItem key="1000">1000</SelectItem>
                  </Select>
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
                      Exposed Ports ({inspectData.ports.length})
                    </CardHeader>
                    <CardBody>
                      <div className="flex flex-wrap gap-2">
                        {inspectData.ports.map((port, index) => (
                          <span key={index} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-mono">
                            {port}
                          </span>
                        ))}
                      </div>
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
              <div className="mb-2 text-gray-500">
                # Container Terminal - Execute commands in the container
              </div>
              <pre className="whitespace-pre-wrap break-words">
                {terminalOutput || "Ready to execute commands..."}
                <div ref={terminalEndRef} />
              </pre>
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter command (e.g., ls -la, cat /etc/hosts, ps aux)"
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
                Press Enter or click Execute to run the command
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
    </div>
  );
}
