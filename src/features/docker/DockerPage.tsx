import { Heading, Text, VStack } from "@astryxdesign/core";
import { ContainerTable } from "./containers/ContainerTable";

export function DockerPage() {
  return (
    <VStack gap={4} className="p-6 w-full">
      <Heading level={1}>Docker Management</Heading>
      <Text type="body" color="secondary">
        Monitor containers, images, volumes, and Docker networks.
      </Text>
      
      <ContainerTable />
    </VStack>
  );
}

export default DockerPage;
