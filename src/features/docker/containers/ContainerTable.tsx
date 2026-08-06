import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@astryxdesign/core/Table";
import { Card } from "@astryxdesign/core/Card";
import { Badge } from "@astryxdesign/core/Badge";
import { Toolbar } from "@astryxdesign/core/Toolbar";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading } from "@astryxdesign/core/Text";
import { RefreshCw, Play, Square, RotateCw, Trash2, MoreVertical } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";

// Match the JSON structure from `docker ps --format '{{json .}}'`
interface DockerContainer extends Record<string, unknown> {
  ID: string;
  Names: string;
  Image: string;
  State: string;
  Status: string;
  Ports: string;
}

export function ContainerTable() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: containers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // estimated row height
    overscan: 5,
  });

  const fetchState = async () => {
    try {
      setIsLoading(true);
      const initialState = await invoke<{ docker: { containers: DockerContainer[] } }>("get_global_state");
      setContainers(initialState.docker.containers);
    } catch (e) {
      console.error("Failed to fetch initial state", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let unlisten: () => void;

    async function setupListener() {
      // 1. Fetch initial state
      await fetchState();

      // 2. Listen for updates
      unlisten = await listen<{ state: { docker: { containers: DockerContainer[] } } }>(
        "global-state-updated",
        (event) => {
          setContainers(event.payload.state.docker.containers);
          setIsLoading(false);
        }
      );
    }

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const getVariant = (state: string): "success" | "warning" | "error" | "info" => {
    const s = state.toLowerCase();
    if (s === "running") return "success";
    if (s === "exited") return "error";
    if (s === "paused") return "warning";
    return "info";
  };

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === "start") {
        await invoke("docker_start_container", { id });
      } else if (action === "stop") {
        await invoke("docker_stop_container", { id });
      } else if (action === "restart") {
        await invoke("docker_restart_container", { id });
      } else if (action === "remove") {
        await invoke("docker_remove_container", { id, force: true });
      }
      // Force refresh state after action
      // In a real app we'd trigger a backend refresh, but for now we'll just wait for the loop or fetch manually.
      // A proper solution would be sending a command to backend to force refresh.
    } catch (e) {
      console.error(`Failed to ${action} container ${id}:`, e);
      // TODO: show toast error
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <Toolbar
        label="Container actions"
        size="md"
        dividers={["bottom"]}
        startContent={<Heading level={3}>Live Containers</Heading>}
        endContent={
          <>
            <Button
              label="Refresh"
              variant="secondary"
              icon={<Icon icon={RefreshCw} />}
              onClick={fetchState}
            />
          </>
        }
      />
      {isLoading && containers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Loading containers...
        </div>
      ) : (
        <div ref={parentRef} className="flex-1 overflow-auto" style={{ maxHeight: '600px' }}>
          <Table density="spacious">
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '20%' }}>Name</TableHeaderCell>
                <TableHeaderCell style={{ width: '20%' }}>Image</TableHeaderCell>
                <TableHeaderCell style={{ width: '100px' }}>State</TableHeaderCell>
                <TableHeaderCell style={{ width: '20%' }}>Status</TableHeaderCell>
                <TableHeaderCell style={{ width: '20%' }}>Ports</TableHeaderCell>
                <TableHeaderCell style={{ width: '80px', textAlign: 'right' }}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowVirtualizer.getVirtualItems().length > 0 && (
                <TableRow>
                  <TableCell colSpan={6} style={{ height: rowVirtualizer.getVirtualItems()[0].start, padding: 0 }} />
                </TableRow>
              )}
              
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const container = containers[virtualRow.index];
                const isRunning = container.State.toLowerCase() === "running";
                return (
                  <TableRow key={container.ID} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                    <TableCell>{container.Names}</TableCell>
                    <TableCell>{container.Image}</TableCell>
                    <TableCell>
                      <Badge variant={getVariant(container.State)} label={container.State} />
                    </TableCell>
                    <TableCell>{container.Status}</TableCell>
                    <TableCell>{container.Ports}</TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <DropdownMenu
                        button={{
                          label: "Actions",
                          icon: <Icon icon={MoreVertical} />,
                          variant: "ghost",
                        }}
                        hasChevron={false}
                        items={[
                          {
                            label: "Start",
                            icon: <Icon icon={Play} />,
                            isDisabled: isRunning,
                            onClick: () => handleAction("start", container.ID)
                          },
                          {
                            label: "Stop",
                            icon: <Icon icon={Square} />,
                            isDisabled: !isRunning,
                            onClick: () => handleAction("stop", container.ID)
                          },
                          {
                            label: "Restart",
                            icon: <Icon icon={RotateCw} />,
                            isDisabled: !isRunning,
                            onClick: () => handleAction("restart", container.ID)
                          },
                          { type: "divider" },
                          {
                            label: "Remove",
                            icon: <Icon icon={Trash2} className="text-red-500" />,
                            onClick: () => handleAction("remove", container.ID)
                          }
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {rowVirtualizer.getVirtualItems().length > 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={6} 
                    style={{ 
                      height: rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end, 
                      padding: 0 
                    }} 
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
