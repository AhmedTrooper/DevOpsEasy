import { useSystemStore } from "@/store/SystemStore";
import { Card, CardBody, CardHeader, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox } from "@heroui/react";
import { Info, Loader2, RefreshCw, Server, HardDrive, Cpu, Database, PieChart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function System() {
  const systemInfo = useSystemStore((state) => state.systemInfo);
  const systemInfoLoading = useSystemStore((state) => state.systemInfoLoading);
  const fetchSystemInfo = useSystemStore((state) => state.fetchSystemInfo);
  const diskUsage = useSystemStore((state) => state.diskUsage);
  const diskUsageLoading = useSystemStore((state) => state.diskUsageLoading);
  const fetchDiskUsage = useSystemStore((state) => state.fetchDiskUsage);
  const systemPrune = useSystemStore((state) => state.systemPrune);

  const [pruneModalOpen, setPruneModalOpen] = useState(false);
  const [pruneAll, setPruneAll] = useState(false);
  const [pruneVolumes, setPruneVolumes] = useState(false);
  const [pruning, setPruning] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
    fetchDiskUsage();
  }, [fetchSystemInfo, fetchDiskUsage]);

  const handleOpenPruneModal = () => {
    setPruneModalOpen(true);
    setPruneAll(false);
    setPruneVolumes(false);
  };

  const handleClosePruneModal = () => {
    setPruneModalOpen(false);
    setPruneAll(false);
    setPruneVolumes(false);
  };

  const handlePrune = async () => {
    setPruning(true);
    await systemPrune(pruneAll, pruneVolumes);
    setPruning(false);
    handleClosePruneModal();
  };

  if (systemInfoLoading && !systemInfo) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading system information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl p-2 font-bold gap-2 flex items-center">
          <Server />
          <span className="text-blue-500">Docker</span> System Info
        </h1>
        <div className="flex gap-2">
          <Button
            color="danger"
            variant="flat"
            onPress={handleOpenPruneModal}
            startContent={<Trash2 className="w-4 h-4" />}
          >
            System Prune
          </Button>
          <Button
            color="default"
            variant="flat"
            onPress={() => {
              fetchSystemInfo();
              fetchDiskUsage();
            }}
            isDisabled={systemInfoLoading || diskUsageLoading}
            startContent={<RefreshCw className={`w-4 h-4 ${(systemInfoLoading || diskUsageLoading) ? 'animate-spin' : ''}`} />}
          >
            Refresh All
          </Button>
        </div>
      </div>

      {!systemInfo ? (
        <div className="text-center py-8 text-gray-500">
          No system information available
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Docker Info */}
          <Card>
            <CardHeader className="bg-blue-100 dark:bg-blue-900">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Info className="w-5 h-5" />
                Docker Information
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Server Version:</div>
                <div className="font-mono">{systemInfo.serverVersion}</div>
                
                <div className="font-semibold">Name:</div>
                <div className="font-mono">{systemInfo.name}</div>
                
                <div className="font-semibold">Root Directory:</div>
                <div className="font-mono text-xs break-all">{systemInfo.dockerRootDir}</div>
              </div>
            </CardBody>
          </Card>

          {/* Storage Drivers */}
          <Card>
            <CardHeader className="bg-purple-100 dark:bg-purple-900">
              <div className="flex items-center gap-2 font-bold text-lg">
                <HardDrive className="w-5 h-5" />
                Drivers
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Storage Driver:</div>
                <div className="font-mono">{systemInfo.storageDriver}</div>
                
                <div className="font-semibold">Logging Driver:</div>
                <div className="font-mono">{systemInfo.loggingDriver}</div>
                
                <div className="font-semibold">Cgroup Driver:</div>
                <div className="font-mono">{systemInfo.cgroupDriver}</div>
              </div>
            </CardBody>
          </Card>

          {/* System Resources */}
          <Card>
            <CardHeader className="bg-green-100 dark:bg-green-900">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Cpu className="w-5 h-5" />
                System Resources
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">CPUs:</div>
                <div className="font-mono">{systemInfo.cpus}</div>
                
                <div className="font-semibold">Total Memory:</div>
                <div className="font-mono">{systemInfo.totalMemory}</div>
                
                <div className="font-semibold">Architecture:</div>
                <div className="font-mono">{systemInfo.architecture}</div>
              </div>
            </CardBody>
          </Card>

          {/* Operating System */}
          <Card>
            <CardHeader className="bg-orange-100 dark:bg-orange-900">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Database className="w-5 h-5" />
                Operating System
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Operating System:</div>
                <div className="font-mono text-xs break-all">{systemInfo.operatingSystem}</div>
                
                <div className="font-semibold">OS Type:</div>
                <div className="font-mono">{systemInfo.osType}</div>
                
                <div className="font-semibold">OS Version:</div>
                <div className="font-mono">{systemInfo.osVersion}</div>
                
                <div className="font-semibold">Kernel Version:</div>
                <div className="font-mono text-xs break-all">{systemInfo.kernelVersion}</div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Disk Usage Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <PieChart className="w-6 h-6" />
          Disk Usage
        </h2>

        {diskUsageLoading && !diskUsage ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin w-6 h-6 mr-2" />
            <span>Loading disk usage...</span>
          </div>
        ) : !diskUsage ? (
          <div className="text-center py-8 text-gray-500">
            No disk usage data available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Images Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                <div className="font-bold text-lg">{diskUsage.images.type}</div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total:</span>
                  <span>{diskUsage.images.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Active:</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">{diskUsage.images.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Size:</span>
                  <span className="font-mono">{diskUsage.images.size}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Reclaimable:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{diskUsage.images.reclaimablePercent}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono text-right">
                    {diskUsage.images.reclaimable}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Containers Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-400 to-green-600 text-white">
                <div className="font-bold text-lg">{diskUsage.containers.type}</div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total:</span>
                  <span>{diskUsage.containers.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Active:</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">{diskUsage.containers.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Size:</span>
                  <span className="font-mono">{diskUsage.containers.size}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Reclaimable:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{diskUsage.containers.reclaimablePercent}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono text-right">
                    {diskUsage.containers.reclaimable}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Volumes Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                <div className="font-bold text-lg">{diskUsage.volumes.type}</div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total:</span>
                  <span>{diskUsage.volumes.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Active:</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">{diskUsage.volumes.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Size:</span>
                  <span className="font-mono">{diskUsage.volumes.size}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Reclaimable:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{diskUsage.volumes.reclaimablePercent}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono text-right">
                    {diskUsage.volumes.reclaimable}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Build Cache Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                <div className="font-bold text-lg">{diskUsage.buildCache.type}</div>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total:</span>
                  <span>{diskUsage.buildCache.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Active:</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">{diskUsage.buildCache.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Size:</span>
                  <span className="font-mono">{diskUsage.buildCache.size}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Reclaimable:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{diskUsage.buildCache.reclaimablePercent}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono text-right">
                    {diskUsage.buildCache.reclaimable}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* System Prune Modal */}
      <Modal isOpen={pruneModalOpen} onClose={handleClosePruneModal}>
        <ModalContent>
          <ModalHeader className="bg-red-500 text-white">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              System Prune Confirmation
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm">
                This will remove:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>All stopped containers</li>
                <li>All networks not used by at least one container</li>
                <li>All dangling images</li>
                <li>All dangling build cache</li>
              </ul>

              <div className="space-y-3 mt-4">
                <Checkbox
                  isSelected={pruneAll}
                  onValueChange={setPruneAll}
                >
                  <span className="text-sm">
                    <strong>Prune All:</strong> Remove all unused images, not just dangling ones
                  </span>
                </Checkbox>

                <Checkbox
                  isSelected={pruneVolumes}
                  onValueChange={setPruneVolumes}
                >
                  <span className="text-sm">
                    <strong className="text-red-600 dark:text-red-400">Prune Volumes:</strong> Remove all unused volumes (CAUTION: This may delete important data!)
                  </span>
                </Checkbox>
              </div>

              {diskUsage && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                  <p className="text-sm font-semibold mb-2">Estimated Reclaimable Space:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Images:</div>
                    <div className="font-mono">{diskUsage.images.reclaimable}</div>
                    <div>Containers:</div>
                    <div className="font-mono">{diskUsage.containers.reclaimable}</div>
                    {pruneVolumes && (
                      <>
                        <div>Volumes:</div>
                        <div className="font-mono">{diskUsage.volumes.reclaimable}</div>
                      </>
                    )}
                    <div>Build Cache:</div>
                    <div className="font-mono">{diskUsage.buildCache.reclaimable}</div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                  ⚠️ Warning: This action cannot be undone!
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={handleClosePruneModal}>
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handlePrune}
              isDisabled={pruning}
              isLoading={pruning}
            >
              {pruning ? "Pruning..." : "Prune System"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
