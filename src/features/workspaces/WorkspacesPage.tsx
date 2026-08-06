import React from "react";
import { Heading, Text, VStack } from "@astryxdesign/core";

export function WorkspacesPage() {
  return (
    <VStack spacing={4} className="p-6">
      <Heading level={1}>Workspaces</Heading>
      <Text size="md" color="secondary">
        Manage workspace environments, projects, and active developer setups.
      </Text>
    </VStack>
  );
}

export default WorkspacesPage;
