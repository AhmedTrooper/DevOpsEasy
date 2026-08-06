import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Table, proportional, pixel, TableColumn } from "@astryxdesign/core/Table";
import { Card } from "@astryxdesign/core/Card";
import { Badge } from "@astryxdesign/core/Badge";
import { Toolbar } from "@astryxdesign/core/Toolbar";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading } from "@astryxdesign/core/Text";
import { RefreshCw } from "lucide-react";

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

  const columns: TableColumn<DockerContainer>[] = [
    {
      key: "Names",
      header: "Name",
      width: proportional(1.5),
    },
    {
      key: "Image",
      header: "Image",
      width: proportional(1.5),
    },
    {
      key: "State",
      header: "State",
      width: pixel(100),
      renderCell: (container) => {
        const stateLower = container.State.toLowerCase();
        let variant: "success" | "warning" | "error" | "info" = "info";
        if (stateLower === "running") variant = "success";
        else if (stateLower === "exited") variant = "error";
        else if (stateLower === "paused") variant = "warning";

        return <Badge variant={variant} label={container.State} />;
      },
    },
    {
      key: "Status",
      header: "Status",
      width: proportional(2),
    },
    {
      key: "Ports",
      header: "Ports",
      width: proportional(1.5),
    },
  ];

  return (
    <Card className="w-full">
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
        <Table 
          data={containers} 
          columns={columns} 
          idKey="ID" 
          hasHover 
          density="spacious"
        />
      )}
    </Card>
  );
}
