import { useVolumeStore } from "@/store/VolumeStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input } from "@heroui/react";
import { Database, Loader2, Trash2, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function Volume() {
  const volumes = useVolumeStore((state) => state.volumes);
  const loading = useVolumeStore((state) => state.loading);
  const error = useVolumeStore((state) => state.error);
  const fetchVolumes = useVolumeStore((state) => state.fetchVolumes);
  const operationLoading = useVolumeStore((state) => state.operationLoading);
  const deleteVolume = useVolumeStore((state) => state.deleteVolume);

  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);

  const [searchQuery, setSearchQuery] = useState("");

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
        <Button
          color="default"
          variant="flat"
          onPress={() => fetchVolumes()}
          isDisabled={loading || operationLoading}
          startContent={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
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
                  color="danger"
                  onPress={() => deleteVolume(volume.name!)}
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
    </div>
  );
}
