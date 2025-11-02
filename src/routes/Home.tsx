import { useImageStore } from "@/store/ImageStore";
import { useContainerStore } from "@/store/ContainerStore";
import { useVolumeStore } from "@/store/VolumeStore";
import { useNetworkStore } from "@/store/NetworkStore";
import { useComposeStore } from "@/store/ComposeStore";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";

import {
  Box,
  Loader2,
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
    <div className="p-8 grid gap-6">
      {/* Images Card */}
      <Card>
        <CardHeader className="bg-red-500 text-white font-bold text-2xl">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Box />
            <span>Images</span>
          </h1>
        </CardHeader>
        <CardBody>
          {imagesLoading && (
            <div className="flex items-center gap-2 text-[18px] font-semibold">
              <Loader2 className="animate-spin" />
              <span>Loading Docker images...</span>
            </div>
          )}
          {imagesError && (
            <div className="text-red-500 text-[18px] font-semibold">
              <span>Error: {imagesError}</span>
            </div>
          )}
          {!imagesLoading && !imagesError && images && (
            <h1 className="flex items-center gap-2 text-[18px] font-semibold">
              <Box />
              <span>{images.length} docker images found</span>
            </h1>
          )}
        </CardBody>
        <CardFooter>
          <Link
            to="/images"
            className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
          >
            View all images
          </Link>
        </CardFooter>
      </Card>

      {/* Containers Card */}
      <Card>
        <CardHeader className="bg-blue-500 text-white font-bold text-2xl">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <ContainerIcon />
            <span>Containers</span>
          </h1>
        </CardHeader>
        <CardBody>
          {containersLoading && (
            <div className="flex items-center gap-2 text-[18px] font-semibold">
              <Loader2 className="animate-spin" />
              <span>Loading Docker containers...</span>
            </div>
          )}
          {containersError && (
            <div className="text-red-500 text-[18px] font-semibold">
              <span>Error: {containersError}</span>
            </div>
          )}
          {!containersLoading && !containersError && containers && (
            <h1 className="flex items-center gap-2 text-[18px] font-semibold">
              <ContainerIcon />
              <span>{containers.length} docker containers found</span>
            </h1>
          )}
        </CardBody>
        <CardFooter>
          <Link
            to="/containers"
            className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
          >
            View all containers
          </Link>
        </CardFooter>
      </Card>

      {/* Volumes Card */}
      <Card>
        <CardHeader className="bg-purple-500 text-white font-bold text-2xl">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Database />
            <span>Volumes</span>
          </h1>
        </CardHeader>
        <CardBody>
          {volumesLoading && (
            <div className="flex items-center gap-2 text-[18px] font-semibold">
              <Loader2 className="animate-spin" />
              <span>Loading Docker volumes...</span>
            </div>
          )}
          {volumesError && (
            <div className="text-red-500 text-[18px] font-semibold">
              <span>Error: {volumesError}</span>
            </div>
          )}
          {!volumesLoading && !volumesError && volumes && (
            <h1 className="flex items-center gap-2 text-[18px] font-semibold">
              <Database />
              <span>{volumes.length} docker volumes found</span>
            </h1>
          )}
        </CardBody>
        <CardFooter>
          <Link
            to="/volumes"
            className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
          >
            View all volumes
          </Link>
        </CardFooter>
      </Card>

      {/* Networks Card */}
      <Card>
        <CardHeader className="bg-green-500 text-white font-bold text-2xl">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <NetworkIcon />
            <span>Networks</span>
          </h1>
        </CardHeader>
        <CardBody>
          {networksLoading && (
            <div className="flex items-center gap-2 text-[18px] font-semibold">
              <Loader2 className="animate-spin" />
              <span>Loading Docker networks...</span>
            </div>
          )}
          {networksError && (
            <div className="text-red-500 text-[18px] font-semibold">
              <span>Error: {networksError}</span>
            </div>
          )}
          {!networksLoading && !networksError && networks && (
            <h1 className="flex items-center gap-2 text-[18px] font-semibold">
              <NetworkIcon />
              <span>{networks.length} docker networks found</span>
            </h1>
          )}
        </CardBody>
        <CardFooter>
          <Link
            to="/networks"
            className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
          >
            View all networks
          </Link>
        </CardFooter>
      </Card>

      {/* Compose Projects Card */}
      <Card>
        <CardHeader className="bg-orange-500 text-white font-bold text-2xl">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Layers />
            <span>Compose</span>
          </h1>
        </CardHeader>
        <CardBody>
          {projectsLoading && (
            <div className="flex items-center gap-2 text-[18px] font-semibold">
              <Loader2 className="animate-spin" />
              <span>Loading Docker Compose projects...</span>
            </div>
          )}
          {projectsError && (
            <div className="text-red-500 text-[18px] font-semibold">
              <span>Error: {projectsError}</span>
            </div>
          )}
          {!projectsLoading && !projectsError && projects && (
            <h1 className="flex items-center gap-2 text-[18px] font-semibold">
              <Layers />
              <span>{projects.length} docker compose projects found</span>
            </h1>
          )}
        </CardBody>
        <CardFooter>
          <Link
            to="/compose"
            className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
          >
            View all projects
          </Link>
        </CardFooter>
      </Card>

      {/* Container Stats Card */}
      <Card>
        <CardHeader className="bg-cyan-500 text-white font-bold text-2xl">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Activity />
            <span>Resource Monitoring</span>
          </h1>
        </CardHeader>
        <CardBody>
          <h1 className="flex items-center gap-2 text-[18px] font-semibold">
            <Activity />
            <span>Real-time container resource monitoring</span>
          </h1>
        </CardBody>
        <CardFooter>
          <Link
            to="/stats"
            className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
          >
            View container stats
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
