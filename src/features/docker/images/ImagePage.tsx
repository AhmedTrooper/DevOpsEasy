import { Heading, Text, VStack } from "@astryxdesign/core";
import { HStack } from "@astryxdesign/core/Stack";
import { ImageTable } from "./ImageTable";
import { ActiveOpsPanel } from "./ActiveOpsPanel";

export function ImagePage() {
  return (
    <VStack gap={4} className="p-6 w-full h-full">
      <VStack gap={1} className="w-full">
        <Heading level={1}>Docker Images</Heading>
        <Text type="body" color="secondary">
          Browse local images, pull new ones, and watch long operations stream
          their progress here.
        </Text>
      </VStack>

      {/* Main column = ImageTable (flex-1); right rail = ActiveOpsPanel.
          Both are flex children of an h-full container so they share the
          remaining viewport height under the page title. */}
      <HStack gap={4} align="stretch" className="w-full h-full min-h-0 flex-1">
        <div className="flex-1 min-h-0 min-w-0">
          <ImageTable />
        </div>
        {/* Hidden on small screens so the table isn't squeezed. The flex
            container naturally stacks at the lg breakpoint via the panel's
            own responsive CSS. */}
        <div className="w-[340px] min-h-0">
          <ActiveOpsPanel />
        </div>
      </HStack>
    </VStack>
  );
}

export default ImagePage;
