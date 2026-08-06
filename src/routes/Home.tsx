import { useImageStore } from "@/store/ImageStore";
import { useContainerStore } from "@/store/ContainerStore";
import { useVolumeStore } from "@/store/VolumeStore";
import { useNetworkStore } from "@/store/NetworkStore";
import { useComposeStore } from "@/store/ComposeStore";

import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";

import {
  Box,
  Container as ContainerIcon,
  Database,
  Network as NetworkIcon,
  Layers,
  Activity,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const fetchImages = useImageStore((state) => state.fetchImages);
  const images = useImageStore((state) => state.images);
  const imagesLoading = useImageStore((state) => state.loading);
  const imagesError = useImageStore((state) => state.error);

  const fetchContainers = useContainerStore((state) => state.fetchContainers);
  const containers = useContainerStore((state) => state.containers);
  const containersLoading = useContainerStore((state) => state.loading);
  const containersError = useContainerStore((state) => state.error);

  const fetchVolumes = useVolumeStore((state) => state.fetchVolumes);
  const volumes = useVolumeStore((state) => state.volumes);
  const volumesLoading = useVolumeStore((state) => state.loading);
  const volumesError = useVolumeStore((state) => state.error);

  const fetchNetworks = useNetworkStore((state) => state.fetchNetworks);
  const networks = useNetworkStore((state) => state.networks);
  const networksLoading = useNetworkStore((state) => state.loading);
  const networksError = useNetworkStore((state) => state.error);

  const fetchProjects = useComposeStore((state) => state.fetchProjects);
  const projects = useComposeStore((state) => state.projects);
  const projectsLoading = useComposeStore((state) => state.loading);
  const projectsError = useComposeStore((state) => state.error);

  useEffect(() => {
    fetchImages();
    fetchContainers();
    fetchVolumes();
    fetchNetworks();
    fetchProjects();
  }, [fetchImages, fetchContainers, fetchVolumes, fetchNetworks, fetchProjects]);

  return (
    <div className="p-8">
      <Grid columns={{ minWidth: 320 }} gap={6}>
        {/* Images Card */}
        <Card>
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-red-500/10 flex items-center gap-3">
            <Box className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-600">Images</span>
          </div>
          <div className="p-6 min-h-[100px] flex items-center">
            {imagesLoading && (
              <div className="flex items-center gap-3 font-medium">
                <Spinner />
                <span>Loading Docker images...</span>
              </div>
            )}
            {imagesError && (
              <span className="text-red-500 font-medium">Error: {imagesError}</span>
            )}
            {!imagesLoading && !imagesError && images && (
              <span className="font-semibold text-lg flex items-center gap-2">
                <Box className="w-5 h-5" />
                {images.length} docker images found
              </span>
            )}
          </div>
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Link to="/images">
              <Button label="View all images">View all images</Button>
            </Link>
          </div>
        </Card>

        {/* Containers Card */}
        <Card>
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-blue-500/10 flex items-center gap-3">
            <ContainerIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">Containers</span>
          </div>
          <div className="p-6 min-h-[100px] flex items-center">
            {containersLoading && (
              <div className="flex items-center gap-3 font-medium">
                <Spinner />
                <span>Loading Docker containers...</span>
              </div>
            )}
            {containersError && (
              <span className="text-red-500 font-medium">Error: {containersError}</span>
            )}
            {!containersLoading && !containersError && containers && (
              <span className="font-semibold text-lg flex items-center gap-2">
                <ContainerIcon className="w-5 h-5" />
                {containers.length} docker containers found
              </span>
            )}
          </div>
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Link to="/containers">
              <Button label="View all containers">View all containers</Button>
            </Link>
          </div>
        </Card>

        {/* Volumes Card */}
        <Card>
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-purple-500/10 flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">Volumes</span>
          </div>
          <div className="p-6 min-h-[100px] flex items-center">
            {volumesLoading && (
              <div className="flex items-center gap-3 font-medium">
                <Spinner />
                <span>Loading Docker volumes...</span>
              </div>
            )}
            {volumesError && (
              <span className="text-red-500 font-medium">Error: {volumesError}</span>
            )}
            {!volumesLoading && !volumesError && volumes && (
              <span className="font-semibold text-lg flex items-center gap-2">
                <Database className="w-5 h-5" />
                {volumes.length} docker volumes found
              </span>
            )}
          </div>
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Link to="/volumes">
              <Button label="View all volumes">View all volumes</Button>
            </Link>
          </div>
        </Card>

        {/* Networks Card */}
        <Card>
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-green-500/10 flex items-center gap-3">
            <NetworkIcon className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">Networks</span>
          </div>
          <div className="p-6 min-h-[100px] flex items-center">
            {networksLoading && (
              <div className="flex items-center gap-3 font-medium">
                <Spinner />
                <span>Loading Docker networks...</span>
              </div>
            )}
            {networksError && (
              <span className="text-red-500 font-medium">Error: {networksError}</span>
            )}
            {!networksLoading && !networksError && networks && (
              <span className="font-semibold text-lg flex items-center gap-2">
                <NetworkIcon className="w-5 h-5" />
                {networks.length} docker networks found
              </span>
            )}
          </div>
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Link to="/networks">
              <Button label="View all networks">View all networks</Button>
            </Link>
          </div>
        </Card>

        {/* Compose Projects Card */}
        <Card>
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-orange-500/10 flex items-center gap-3">
            <Layers className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">Compose</span>
          </div>
          <div className="p-6 min-h-[100px] flex items-center">
            {projectsLoading && (
              <div className="flex items-center gap-3 font-medium">
                <Spinner />
                <span>Loading Docker Compose projects...</span>
              </div>
            )}
            {projectsError && (
              <span className="text-red-500 font-medium">Error: {projectsError}</span>
            )}
            {!projectsLoading && !projectsError && projects && (
              <span className="font-semibold text-lg flex items-center gap-2">
                <Layers className="w-5 h-5" />
                {projects.length} docker compose projects found
              </span>
            )}
          </div>
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Link to="/compose">
              <Button label="View all projects">View all projects</Button>
            </Link>
          </div>
        </Card>

        {/* Container Stats Card */}
        <Card>
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-cyan-500/10 flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-600" />
            <span className="text-2xl font-bold text-cyan-600">Resource Monitoring</span>
          </div>
          <div className="p-6 min-h-[100px] flex items-center">
            <span className="font-semibold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time container resource monitoring
            </span>
          </div>
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <Link to="/stats">
              <Button label="View container stats">View container stats</Button>
            </Link>
          </div>
        </Card>
      </Grid>
    </div>
  );
}
