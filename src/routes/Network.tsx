import { useNetworkStore } from "@/store/NetworkStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input } from "@heroui/react";
import { Network as NetworkIcon, Loader2, Trash2, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function Network() {
  const networks = useNetworkStore((state) => state.networks);
  const loading = useNetworkStore((state) => state.loading);
  const error = useNetworkStore((state) => state.error);
  const fetchNetworks = useNetworkStore((state) => state.fetchNetworks);
  const operationLoading = useNetworkStore((state) => state.operationLoading);
  const deleteNetwork = useNetworkStore((state) => state.deleteNetwork);

  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);

  const [searchQuery, setSearchQuery] = useState("");

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
        <Button
          color="default"
          variant="flat"
          onPress={() => fetchNetworks()}
          isDisabled={loading || operationLoading}
          startContent={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
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
              <CardFooter className="flex gap-2">
                <Button
                  color="danger"
                  onPress={() => deleteNetwork(network.id!)}
                  isDisabled={
                    operationLoading || isSystemNetwork(network.name || "")
                  }
                  className="flex gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isSystemNetwork(network.name || "")
                    ? "System Network"
                    : "Delete"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
