import { useNetworkStore } from "@/store/NetworkStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { useContainerStore } from "@/store/ContainerStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from "@heroui/react";
import { Network as NetworkIcon, Loader2, Trash2, RefreshCw, Search, X, Plus, Info, Trash, Link as LinkIcon, Unlink } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function Network() {
  const networks = useNetworkStore((state) => state.networks);
  const loading = useNetworkStore((state) => state.loading);
  const error = useNetworkStore((state) => state.error);
  const fetchNetworks = useNetworkStore((state) => state.fetchNetworks);
  const operationLoading = useNetworkStore((state) => state.operationLoading);
  const deleteNetwork = useNetworkStore((state) => state.deleteNetwork);
  const createNetwork = useNetworkStore((state) => state.createNetwork);
  const inspectNetwork = useNetworkStore((state) => state.inspectNetwork);
  const inspectData = useNetworkStore((state) => state.inspectData);
  const inspectLoading = useNetworkStore((state) => state.inspectLoading);
  const connectContainer = useNetworkStore((state) => state.connectContainer);
  const disconnectContainer = useNetworkStore((state) => state.disconnectContainer);
  const pruneNetworks = useNetworkStore((state) => state.pruneNetworks);
  
  const containers = useContainerStore((state) => state.containers);
  const fetchContainers = useContainerStore((state) => state.fetchContainers);

  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);

  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [pruneConfirmModalOpen, setPruneConfirmModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<{ id: string; name: string } | null>(null);
  const [newNetworkName, setNewNetworkName] = useState("");
  const [networkDriver, setNetworkDriver] = useState("bridge");
  const [networkSubnet, setNetworkSubnet] = useState("");
  const [networkGateway, setNetworkGateway] = useState("");
  const [selectedContainer, setSelectedContainer] = useState("");

  const handleRefresh = () => {
    fetchNetworks();
  };

  const handleOpenCreate = () => {
    setNewNetworkName("");
    setNetworkDriver("bridge");
    setNetworkSubnet("");
    setNetworkGateway("");
    setCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateModalOpen(false);
    setNewNetworkName("");
    setNetworkDriver("bridge");
    setNetworkSubnet("");
    setNetworkGateway("");
  };

  const handleCreate = async () => {
    if (!newNetworkName.trim()) return;
    await createNetwork(
      newNetworkName.trim(),
      networkDriver,
      networkSubnet.trim() || undefined,
      networkGateway.trim() || undefined
    );
    handleCloseCreate();
  };

  const handleOpenInspect = async (networkId: string, networkName: string) => {
    setSelectedNetwork({ id: networkId, name: networkName });
    setInspectModalOpen(true);
    await inspectNetwork(networkId);
  };

  const handleCloseInspect = () => {
    setInspectModalOpen(false);
    setSelectedNetwork(null);
  };

  const handleOpenConnect = async (networkId: string, networkName: string) => {
    setSelectedNetwork({ id: networkId, name: networkName });
    setSelectedContainer("");
    setConnectModalOpen(true);
    await fetchContainers();
  };

  const handleCloseConnect = () => {
    setConnectModalOpen(false);
    setSelectedNetwork(null);
    setSelectedContainer("");
  };

  const handleConnect = async () => {
    if (!selectedNetwork || !selectedContainer) return;
    await connectContainer(selectedNetwork.id, selectedContainer);
    handleCloseConnect();
  };

  const handleDisconnect = async (networkId: string, containerId: string) => {
    await disconnectContainer(networkId, containerId);
  };

  const handleOpenPrune = () => {
    setPruneConfirmModalOpen(true);
  };

  const handleClosePrune = () => {
    setPruneConfirmModalOpen(false);
  };

  const handlePrune = async () => {
    await pruneNetworks();
    handleClosePrune();
  };

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchNetworks();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, autoRefreshInterval, fetchNetworks]);

  // Filter networks based on search query
  const filteredNetworks = useMemo(() => {
    if (!searchQuery.trim()) return networks;
    
    const query = searchQuery.toLowerCase();
    return networks.filter((network) => {
      return (
        network.name?.toLowerCase().includes(query) ||
        network.id?.toLowerCase().includes(query) ||
        network.driver?.toLowerCase().includes(query) ||
        network.scope?.toLowerCase().includes(query)
      );
    });
  }, [networks, searchQuery]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading Docker networks...</span>
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

  if (!networks || networks.length === 0) {
    return (
      <div className="p-8">
        <div className="text-xl font-semibold">No Docker networks found</div>
      </div>
    );
  }

  const isSystemNetwork = (name: string) => {
    return ["bridge", "host", "none"].includes(name);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl p-2 font-bold gap-2 flex items-center">
          <NetworkIcon />
          <span className="text-green-500">Docker</span> Networks
        </h1>
        <div className="flex gap-2">
          <Button
            color="primary"
            onPress={handleOpenCreate}
            isDisabled={operationLoading}
            startContent={<Plus className="w-4 h-4" />}
          >
            Create Network
          </Button>
          <Button
            color="warning"
            onPress={handleOpenPrune}
            isDisabled={operationLoading}
            startContent={<Trash className="w-4 h-4" />}
          >
            Prune Unused
          </Button>
          <Button
            color="default"
            variant="flat"
            onPress={handleRefresh}
            isDisabled={loading || operationLoading}
            startContent={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <Input
          placeholder="Search networks by name, ID, driver, or scope..."
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
            Found {filteredNetworks.length} of {networks.length} networks
          </p>
        )}
      </div>

      {/* Networks List */}
      {filteredNetworks.length === 0 ? (
        <div className="text-xl font-semibold text-gray-500">
          No networks match your search criteria
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNetworks.map((network) => (
            <Card key={network.id}>
              <CardHeader className="bg-green-500 text-white font-bold text-2xl">
                {network.name}
              </CardHeader>
              <CardBody>
                <p>ID: {network.id}</p>
                <p>Driver: {network.driver}</p>
                <p>Scope: {network.scope}</p>
                {network.createdAt && <p>Created: {network.createdAt}</p>}
              </CardBody>
              <CardFooter className="flex gap-2 flex-wrap">
                <Button
                  color="secondary"
                  onPress={() => handleOpenInspect(network.id!, network.name!)}
                  isDisabled={operationLoading}
                  startContent={<Info className="w-4 h-4" />}
                >
                  Inspect
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleOpenConnect(network.id!, network.name!)}
                  isDisabled={operationLoading || isSystemNetwork(network.name || "")}
                  startContent={<LinkIcon className="w-4 h-4" />}
                >
                  Connect Container
                </Button>
                <Button
                  color="danger"
                  onPress={() => deleteNetwork(network.id!)}
                  isDisabled={
                    operationLoading || isSystemNetwork(network.name || "")
                  }
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  {isSystemNetwork(network.name || "")
                    ? "System Network"
                    : "Delete"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Network Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={handleCloseCreate}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Create New Network</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                autoFocus
                label="Network Name"
                placeholder="e.g., my-network"
                value={newNetworkName}
                onChange={(e) => setNewNetworkName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                description="Unique name for the network"
              />
              <Select
                label="Driver"
                selectedKeys={[networkDriver]}
                onChange={(e) => setNetworkDriver(e.target.value)}
                description="Network driver type"
              >
                <SelectItem key="bridge">Bridge</SelectItem>
                <SelectItem key="host">Host</SelectItem>
                <SelectItem key="overlay">Overlay</SelectItem>
                <SelectItem key="macvlan">Macvlan</SelectItem>
                <SelectItem key="none">None</SelectItem>
              </Select>
              <Input
                label="Subnet (Optional)"
                placeholder="e.g., 172.20.0.0/16"
                value={networkSubnet}
                onChange={(e) => setNetworkSubnet(e.target.value)}
                description="CIDR format subnet for the network"
              />
              <Input
                label="Gateway (Optional)"
                placeholder="e.g., 172.20.0.1"
                value={networkGateway}
                onChange={(e) => setNetworkGateway(e.target.value)}
                description="Gateway IP address (requires subnet)"
                isDisabled={!networkSubnet.trim()}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleCreate}
              isDisabled={!newNetworkName.trim()}
            >
              Create
            </Button>
            <Button color="default" onPress={handleCloseCreate}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Inspect Network Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={handleCloseInspect}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Network Details: {selectedNetwork?.name}</ModalHeader>
          <ModalBody>
            {inspectLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : inspectData ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="bg-green-100 dark:bg-green-900 font-bold">
                    Basic Information
                  </CardHeader>
                  <CardBody className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {inspectData.name}</div>
                    <div><strong>ID:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">{inspectData.id}</code></div>
                    <div><strong>Driver:</strong> {inspectData.driver}</div>
                    <div><strong>Scope:</strong> {inspectData.scope}</div>
                    <div><strong>Created:</strong> {inspectData.created}</div>
                    <div><strong>IPv6:</strong> {inspectData.enableIPv6 ? "Enabled" : "Disabled"}</div>
                    <div><strong>Internal:</strong> {inspectData.internal ? "Yes" : "No"}</div>
                    <div><strong>Attachable:</strong> {inspectData.attachable ? "Yes" : "No"}</div>
                  </CardBody>
                </Card>

                {/* IPAM */}
                {inspectData.ipam && inspectData.ipam.config.length > 0 && (
                  <Card>
                    <CardHeader className="bg-blue-100 dark:bg-blue-900 font-bold">
                      IP Address Management (IPAM)
                    </CardHeader>
                    <CardBody className="space-y-2 text-sm">
                      <div><strong>Driver:</strong> {inspectData.ipam.driver}</div>
                      {inspectData.ipam.config.map((config, index) => (
                        <div key={index} className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <div><strong>Subnet:</strong> <code className="font-mono text-xs">{config.subnet}</code></div>
                          <div><strong>Gateway:</strong> <code className="font-mono text-xs">{config.gateway}</code></div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}

                {/* Connected Containers */}
                {inspectData.containers && Object.keys(inspectData.containers).length > 0 && (
                  <Card>
                    <CardHeader className="bg-purple-100 dark:bg-purple-900 font-bold">
                      Connected Containers ({Object.keys(inspectData.containers).length})
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {Object.entries(inspectData.containers).map(([id, container]) => (
                          <div key={id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">{container.name}</div>
                            <div className="text-xs mt-1 space-y-1">
                              <div><strong>IPv4:</strong> <code className="font-mono">{container.ipv4Address}</code></div>
                              <div><strong>MAC:</strong> <code className="font-mono">{container.macAddress}</code></div>
                              <Button
                                size="sm"
                                color="warning"
                                variant="flat"
                                onPress={() => {
                                  handleDisconnect(selectedNetwork!.id, id);
                                  handleCloseInspect();
                                }}
                                startContent={<Unlink className="w-3 h-3" />}
                                className="mt-2"
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Options */}
                {inspectData.options && Object.keys(inspectData.options).length > 0 && (
                  <Card>
                    <CardHeader className="bg-teal-100 dark:bg-teal-900 font-bold">
                      Options ({Object.keys(inspectData.options).length})
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-1 text-sm">
                        {Object.entries(inspectData.options).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-semibold">{key}:</span>
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">{value}</code>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Labels */}
                {inspectData.labels && Object.keys(inspectData.labels).length > 0 && (
                  <Card>
                    <CardHeader className="bg-orange-100 dark:bg-orange-900 font-bold">
                      Labels ({Object.keys(inspectData.labels).length})
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-1 text-sm">
                        {Object.entries(inspectData.labels).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-semibold">{key}:</span>
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">{value}</code>
                          </div>
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

      {/* Connect Container Modal */}
      <Modal
        isOpen={connectModalOpen}
        onClose={handleCloseConnect}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Connect Container to {selectedNetwork?.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Select Container"
                placeholder="Choose a container"
                selectedKeys={selectedContainer ? [selectedContainer] : []}
                onChange={(e) => setSelectedContainer(e.target.value)}
                description="Select a container to connect to this network"
              >
                {containers.map((container) => (
                  <SelectItem key={container.id!}>
                    {container.name} ({container.id?.substring(0, 12)})
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleConnect}
              isDisabled={!selectedContainer}
            >
              Connect
            </Button>
            <Button color="default" onPress={handleCloseConnect}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Prune Confirmation Modal */}
      <Modal
        isOpen={pruneConfirmModalOpen}
        onClose={handleClosePrune}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader>Confirm Prune Unused Networks</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm">
                Are you sure you want to remove <strong>all unused networks</strong>?
              </p>
              <p className="text-xs text-warning-600 dark:text-warning-400">
                ⚠️ This action cannot be undone. All networks not currently in use by containers will be permanently deleted.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={handlePrune}
            >
              Prune All Unused
            </Button>
            <Button color="default" onPress={handleClosePrune}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
