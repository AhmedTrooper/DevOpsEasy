import { Heading, Text, VStack } from "@astryxdesign/core";
import { ContainerTable } from "./containers/ContainerTable";

export function DockerPage() {
  return (
    <VStack className="gap-4 p-6 w-full">
      <Heading level={1}>Docker Management</Heading>
      <Text type="body" color="secondary">
        Monitor containers, images, volumes, and Docker networks.
      </Text>
      
      <ContainerTable />
    </VStack>
  );
}

export default DockerPage;
