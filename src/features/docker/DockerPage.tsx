import React from "react";
import { Heading, Text, VStack } from "@astryxdesign/core";

export function DockerPage() {
  return (
    <VStack spacing={4} className="p-6">
      <Heading level={1}>Docker Management</Heading>
      <Text size="md" color="secondary">
        Monitor containers, images, volumes, and Docker networks.
      </Text>
    </VStack>
  );
}

export default DockerPage;
