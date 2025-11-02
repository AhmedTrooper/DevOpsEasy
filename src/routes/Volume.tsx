import { useVolumeStore } from "@/store/VolumeStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Database, Loader2, Trash2, RefreshCw, Search, X, Plus, Info, Trash } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function Volume() {
  const volumes = useVolumeStore((state) => state.volumes);
  const loading = useVolumeStore((state) => state.loading);
  const error = useVolumeStore((state) => state.error);
  const fetchVolumes = useVolumeStore((state) => state.fetchVolumes);
  const operationLoading = useVolumeStore((state) => state.operationLoading);
  const deleteVolume = useVolumeStore((state) => state.deleteVolume);
  const createVolume = useVolumeStore((state) => state.createVolume);
  const inspectVolume = useVolumeStore((state) => state.inspectVolume);
  const inspectData = useVolumeStore((state) => state.inspectData);
  const inspectLoading = useVolumeStore((state) => state.inspectLoading);
  const pruneVolumes = useVolumeStore((state) => state.pruneVolumes);

  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);

  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [pruneConfirmModalOpen, setPruneConfirmModalOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);
  const [newVolumeName, setNewVolumeName] = useState("");
  const [volumeDriver, setVolumeDriver] = useState("local");

  const handleRefresh = () => {
    fetchVolumes();
  };

  const handleOpenCreate = () => {
    setNewVolumeName("");
    setVolumeDriver("local");
    setCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateModalOpen(false);
    setNewVolumeName("");
    setVolumeDriver("local");
  };

  const handleCreate = async () => {
    if (!newVolumeName.trim()) return;
    await createVolume(newVolumeName.trim(), volumeDriver);
    handleCloseCreate();
  };

  const handleOpenInspect = async (volumeName: string) => {
    setSelectedVolume(volumeName);
    setInspectModalOpen(true);
    await inspectVolume(volumeName);
  };

  const handleCloseInspect = () => {
    setInspectModalOpen(false);
    setSelectedVolume(null);
  };

  const handleOpenPrune = () => {
    setPruneConfirmModalOpen(true);
  };

  const handleClosePrune = () => {
    setPruneConfirmModalOpen(false);
  };

  const handlePrune = async () => {
    await pruneVolumes();
    handleClosePrune();
  };

  useEffect(() => {
    fetchVolumes();
  }, [fetchVolumes]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchVolumes();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, autoRefreshInterval, fetchVolumes]);

  // Filter volumes based on search query
  const filteredVolumes = useMemo(() => {
    if (!searchQuery.trim()) return volumes;
    
    const query = searchQuery.toLowerCase();
    return volumes.filter((volume) => {
      return (
        volume.name?.toLowerCase().includes(query) ||
        volume.driver?.toLowerCase().includes(query) ||
        volume.mountpoint?.toLowerCase().includes(query)
      );
    });
  }, [volumes, searchQuery]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading Docker volumes...</span>
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

  if (!volumes || volumes.length === 0) {
    return (
      <div className="p-8">
        <div className="text-xl font-semibold">No Docker volumes found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl p-2 font-bold gap-2 flex items-center">
          <Database />
          <span className="text-purple-500">Docker</span> Volumes
        </h1>
        <div className="flex gap-2">
          <Button
            color="primary"
            onPress={handleOpenCreate}
            isDisabled={operationLoading}
            startContent={<Plus className="w-4 h-4" />}
          >
            Create Volume
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
          placeholder="Search volumes by name, driver, or mountpoint..."
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
            Found {filteredVolumes.length} of {volumes.length} volumes
          </p>
        )}
      </div>

      {/* Volumes List */}
      {filteredVolumes.length === 0 ? (
        <div className="text-xl font-semibold text-gray-500">
          No volumes match your search criteria
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredVolumes.map((volume) => (
            <Card key={volume.name}>
              <CardHeader className="bg-purple-500 text-white font-bold text-2xl">
                {volume.name}
              </CardHeader>
              <CardBody>
                <p>Driver: {volume.driver}</p>
                <p>Mountpoint: {volume.mountpoint}</p>
                <p>Size: {volume.size}</p>
                {volume.createdAt && <p>Created: {volume.createdAt}</p>}
              </CardBody>
              <CardFooter className="flex gap-2">
                <Button
                  color="secondary"
                  onPress={() => handleOpenInspect(volume.name!)}
                  isDisabled={operationLoading}
                  startContent={<Info className="w-4 h-4" />}
                >
                  Inspect
                </Button>
                <Button
                  color="danger"
                  onPress={() => deleteVolume(volume.name!)}
                  isDisabled={operationLoading}
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Volume Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={handleCloseCreate}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Create New Volume</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                autoFocus
                label="Volume Name"
                placeholder="e.g., my-volume"
                value={newVolumeName}
                onChange={(e) => setNewVolumeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                description="Unique name for the volume"
              />
              <Input
                label="Driver"
                placeholder="local"
                value={volumeDriver}
                onChange={(e) => setVolumeDriver(e.target.value)}
                description="Volume driver (default: local)"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleCreate}
              isDisabled={!newVolumeName.trim()}
            >
              Create
            </Button>
            <Button color="default" onPress={handleCloseCreate}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Inspect Volume Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={handleCloseInspect}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Volume Details: {selectedVolume}</ModalHeader>
          <ModalBody>
            {inspectLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : inspectData ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="bg-purple-100 dark:bg-purple-900 font-bold">
                    Basic Information
                  </CardHeader>
                  <CardBody className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {inspectData.name}</div>
                    <div><strong>Driver:</strong> {inspectData.driver}</div>
                    <div><strong>Mountpoint:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">{inspectData.mountpoint}</code></div>
                    <div><strong>Created:</strong> {inspectData.createdAt}</div>
                    <div><strong>Scope:</strong> {inspectData.scope}</div>
                  </CardBody>
                </Card>

                {/* Options */}
                {inspectData.options && Object.keys(inspectData.options).length > 0 && (
                  <Card>
                    <CardHeader className="bg-blue-100 dark:bg-blue-900 font-bold">
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
                    <CardHeader className="bg-teal-100 dark:bg-teal-900 font-bold">
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

      {/* Prune Confirmation Modal */}
      <Modal
        isOpen={pruneConfirmModalOpen}
        onClose={handleClosePrune}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader>Confirm Prune Unused Volumes</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm">
                Are you sure you want to remove <strong>all unused volumes</strong>?
              </p>
              <p className="text-xs text-warning-600 dark:text-warning-400">
                ⚠️ This action cannot be undone. All volumes not currently in use by containers will be permanently deleted.
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
