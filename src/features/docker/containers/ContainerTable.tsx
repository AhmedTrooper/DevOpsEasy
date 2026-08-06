import { useEffect, useState, useRef, memo } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Table, TableHeader, TableHeaderCell } from "@astryxdesign/core/Table";
import { Card } from "@astryxdesign/core/Card";
import { Badge } from "@astryxdesign/core/Badge";
import { Toolbar } from "@astryxdesign/core/Toolbar";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading } from "@astryxdesign/core/Text";
import { RefreshCw, Play, Square, RotateCw, Trash2, MoreVertical, ShieldAlert } from "lucide-react";
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

const GRID_COLUMNS = "20% 20% 100px 20% 20% 80px";

const getVariant = (state: string): "success" | "warning" | "error" | "info" => {
  const s = state.toLowerCase();
  if (s === "running") return "success";
  if (s === "exited") return "error";
  if (s === "paused") return "warning";
  return "info";
};

interface ContainerRowProps {
  container: DockerContainer;
  onAction: (action: string, id: string) => void;
}

const ContainerRow = memo(({ container, onAction }: ContainerRowProps) => {
  const isRunning = container.State.toLowerCase() === "running";

  return (
    <div
      className="grid items-center border-b border-default text-sm"
      style={{ gridTemplateColumns: GRID_COLUMNS, height: "100%", width: "100%" }}
    >
      <div className="truncate px-3">{container.Names}</div>
      <div className="truncate px-3">{container.Image}</div>
      <div className="px-3">
        <Badge variant={getVariant(container.State)} label={container.State} />
      </div>
      <div className="truncate px-3">{container.Status}</div>
      <div className="truncate px-3">{container.Ports}</div>
      <div className="px-3" style={{ textAlign: "right" }}>
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
              onClick: () => onAction("start", container.ID),
            },
            {
              label: "Stop",
              icon: <Icon icon={Square} />,
              isDisabled: !isRunning,
              onClick: () => onAction("stop", container.ID),
            },
            {
              label: "Restart",
              icon: <Icon icon={RotateCw} />,
              isDisabled: !isRunning,
              onClick: () => onAction("restart", container.ID),
            },
            { type: "divider" },
            {
              label: "Remove",
              icon: <Icon icon={Trash2} />,
              isDisabled: isRunning, // Cannot remove running without force
              onClick: () => onAction("remove", container.ID),
            },
            {
              label: "Force Remove",
              icon: <Icon icon={ShieldAlert} className="text-red-500" />,
              onClick: () => onAction("force_remove", container.ID),
            },
          ]}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the container's critical state changes (React.memo optimization)
  return (
    prevProps.container.State === nextProps.container.State &&
    prevProps.container.Status === nextProps.container.Status
  );
});

ContainerRow.displayName = "ContainerRow";

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
      const initialState = await invoke<{ docker: { containers: DockerContainer[] } }>(
        "get_global_state"
      );
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

  // Re-measure the virtualizer whenever the scroll container resizes (window
  // resize, sidebar collapse, dock position toggle, etc.). Without this the
  // virtualizer may keep a stale measurement and render zero rows.
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      rowVirtualizer.measure();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [rowVirtualizer]);

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === "start") {
        await invoke("docker_start_container", { id });
      } else if (action === "stop") {
        await invoke("docker_stop_container", { id });
      } else if (action === "restart") {
        await invoke("docker_restart_container", { id });
      } else if (action === "remove") {
        await invoke("docker_remove_container", { id, force: false });
      } else if (action === "force_remove") {
        await invoke("docker_remove_container", { id, force: true });
      }
      // Trigger a refresh after a small delay to allow docker to process the state change
      setTimeout(fetchState, 500);
    } catch (e) {
      console.error(`Failed to ${action} container ${id}:`, e);
      // TODO: show toast error
    }
  };

  return (
    <Card className="w-full h-full min-h-0 flex flex-col">
      <Toolbar
        label="Container actions"
        size="md"
        dividers={["bottom"]}
        startContent={<Heading level={3}>Live Containers</Heading>}
        endContent={
          <Button
            label="Refresh"
            variant="secondary"
            icon={<Icon icon={RefreshCw} />}
            onClick={fetchState}
          />
        }
      />
      {isLoading && containers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Loading containers...</div>
      ) : (
        <>
          {/* Header lives OUTSIDE the scroll container so it stays pinned to the top of the Card. */}
          <Table density="spacious" className="shrink-0">
            <TableHeader>
              <TableHeaderCell style={{ width: "20%" }}>Name</TableHeaderCell>
              <TableHeaderCell style={{ width: "20%" }}>Image</TableHeaderCell>
              <TableHeaderCell style={{ width: "100px" }}>State</TableHeaderCell>
              <TableHeaderCell style={{ width: "20%" }}>Status</TableHeaderCell>
              <TableHeaderCell style={{ width: "20%" }}>Ports</TableHeaderCell>
              <TableHeaderCell style={{ width: "80px", textAlign: "right" }}>
                Actions
              </TableHeaderCell>
            </TableHeader>
          </Table>

          {/* Virtualized body — div-based with absolutely-positioned rows so the
              scroll region reliably fills remaining Card height on both small
              and big screens. */}
          <div ref={parentRef} className="flex-1 min-h-0 overflow-auto">
            <div
              style={{
                height: rowVirtualizer.getTotalSize(),
                position: "relative",
                width: "100%",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const container = containers[virtualRow.index];
                return (
                  <div
                    key={container.ID}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <ContainerRow container={container} onAction={handleAction} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
