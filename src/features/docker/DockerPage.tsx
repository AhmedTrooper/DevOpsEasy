import { Heading, Text, VStack } from "@astryxdesign/core";

export function DockerPage() {
  return (
    <VStack className="gap-4 p-6">
      <Heading level={1}>Docker Management</Heading>
      <Text type="body" color="secondary">
        Monitor containers, images, volumes, and Docker networks.
      </Text>
    </VStack>
  );
}

export default DockerPage;
