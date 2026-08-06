import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@astryxdesign/core/Table";
import { Card } from "@astryxdesign/core/Card";
import { Badge } from "@astryxdesign/core/Badge";
import { Toolbar } from "@astryxdesign/core/Toolbar";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading } from "@astryxdesign/core/Text";
import { RefreshCw } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

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

  useEffect(() => {
    let unlisten: () => void;

    async function setupListener() {
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
            />
          </>
        }
      />
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">
          Loading containers...
        </div>
      ) : (
        <div ref={parentRef} className="flex-1 overflow-auto" style={{ maxHeight: '600px' }}>
          <Table density="spacious">
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '25%' }}>Name</TableHeaderCell>
                <TableHeaderCell style={{ width: '25%' }}>Image</TableHeaderCell>
                <TableHeaderCell style={{ width: '100px' }}>State</TableHeaderCell>
                <TableHeaderCell style={{ width: '25%' }}>Status</TableHeaderCell>
                <TableHeaderCell style={{ width: '25%' }}>Ports</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowVirtualizer.getVirtualItems().length > 0 && (
                <TableRow>
                  <TableCell colSpan={5} style={{ height: rowVirtualizer.getVirtualItems()[0].start, padding: 0 }} />
                </TableRow>
              )}
              
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const container = containers[virtualRow.index];
                return (
                  <TableRow key={container.ID} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                    <TableCell>{container.Names}</TableCell>
                    <TableCell>{container.Image}</TableCell>
                    <TableCell>
                      <Badge variant={getVariant(container.State)} label={container.State} />
                    </TableCell>
                    <TableCell>{container.Status}</TableCell>
                    <TableCell>{container.Ports}</TableCell>
                  </TableRow>
                );
              })}
              
              {rowVirtualizer.getVirtualItems().length > 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={5} 
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
