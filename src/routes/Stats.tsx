import { useContainerStore } from "@/store/ContainerStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardHeader, Progress, Button } from "@heroui/react";
import { Activity, Loader2, RefreshCw, Cpu, MemoryStick, Network, HardDrive } from "lucide-react";
import { useEffect } from "react";

export default function Stats() {
  const stats = useContainerStore((state) => state.stats);
  const statsLoading = useContainerStore((state) => state.statsLoading);
  const fetchStats = useContainerStore((state) => state.fetchStats);

  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchStats();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, autoRefreshInterval, fetchStats]);

  const parsePercentage = (percStr: string): number => {
    const num = parseFloat(percStr.replace("%", ""));
    return isNaN(num) ? 0 : num;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "success";
    if (percentage < 80) return "warning";
    return "danger";
  };

  if (statsLoading && stats.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading container stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl p-2 font-bold gap-2 flex items-center">
          <Activity />
          <span className="text-cyan-500">Container</span> Stats
        </h1>
        <Button
          color="default"
          variant="flat"
          onPress={() => fetchStats()}
          isDisabled={statsLoading}
          startContent={<RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {!stats || stats.length === 0 ? (
        <div className="text-xl font-semibold">
          No running containers found
        </div>
      ) : (
        <div className="grid gap-4">
          {stats.map((stat) => {
            const cpuPerc = parsePercentage(stat.cpuPerc);
            const memPerc = parsePercentage(stat.memPerc);

            return (
              <Card key={stat.id}>
                <CardHeader className="bg-cyan-500 text-white font-bold text-2xl">
                  {stat.name}
                </CardHeader>
                <CardBody className="space-y-4">
                  {/* CPU Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <Cpu className="w-5 h-5" />
                        <span>CPU Usage</span>
                      </div>
                      <span className="text-sm font-mono">{stat.cpuPerc}</span>
                    </div>
                    <Progress
                      value={cpuPerc}
                      color={getProgressColor(cpuPerc)}
                      className="w-full"
                    />
                  </div>

                  {/* Memory Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <MemoryStick className="w-5 h-5" />
                        <span>Memory Usage</span>
                      </div>
                      <span className="text-sm font-mono">{stat.memUsage} ({stat.memPerc})</span>
                    </div>
                    <Progress
                      value={memPerc}
                      color={getProgressColor(memPerc)}
                      className="w-full"
                    />
                  </div>

                  {/* Network I/O */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-xs text-gray-500">Network I/O</div>
                        <div className="font-mono text-sm">{stat.netIO}</div>
                      </div>
                    </div>

                    {/* Block I/O */}
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-xs text-gray-500">Block I/O</div>
                        <div className="font-mono text-sm">{stat.blockIO}</div>
                      </div>
                    </div>
                  </div>

                  {/* PIDs */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Process IDs</span>
                    <span className="font-mono font-semibold">{stat.pids}</span>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
