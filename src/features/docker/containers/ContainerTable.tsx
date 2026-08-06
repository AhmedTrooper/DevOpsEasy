import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Table, proportional, pixel, TableColumn } from "@astryxdesign/core/Table";
import { Card } from "@astryxdesign/core/Card";
import { Badge } from "@astryxdesign/core/Badge";

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

  useEffect(() => {
    let unlisten: () => void;

    async function setupListener() {
      // Listen to the event emitted by Rust
      unlisten = await listen<{ containers: Record<string, DockerContainer> }>(
        "docker-containers-updated",
        (event) => {
          // Convert the HashMap from Rust back into an array
          const updatedContainers = Object.values(event.payload.containers);
          setContainers(updatedContainers);
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
      <Table 
        data={containers} 
        columns={columns} 
        idKey="ID" 
        hasHover 
      />
    </Card>
  );
}
