import { useImageStore } from "@/store/ImageStore";
import { useContainerStore } from "@/store/ContainerStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { List, Loader2, Trash2, Download, RefreshCw, Search, X, Info, Hammer, Tag, Upload, Save, FileUp, Trash, SearchIcon, FolderOpen, PlayCircle, Copy, Terminal } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { open } from '@tauri-apps/plugin-dialog';
import { save as saveDialog } from '@tauri-apps/plugin-dialog';
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { addToast } from "@heroui/react";

export default function Image() {
  const images = useImageStore((state) => state.images);
  const loading = useImageStore((state) => state.loading);
  const error = useImageStore((state) => state.error);
  const operationLoading = useImageStore((state) => state.operationLoading);
  const deleteImage = useImageStore((state) => state.deleteImage);
  const pullImage = useImageStore((state) => state.pullImage);
  const fetchImages = useImageStore((state) => state.fetchImages);
  const inspectImage = useImageStore((state) => state.inspectImage);
  const inspectData = useImageStore((state) => state.inspectData);
  const inspectLoading = useImageStore((state) => state.inspectLoading);
  const buildImage = useImageStore((state) => state.buildImage);
  const buildOutput = useImageStore((state) => state.buildOutput);
  const buildLoading = useImageStore((state) => state.buildLoading);
  const clearBuildOutput = useImageStore((state) => state.clearBuildOutput);
  const pullProgress = useImageStore((state) => state.pullProgress);
  const clearPullProgress = useImageStore((state) => state.clearPullProgress);
  const tagImage = useImageStore((state) => state.tagImage);
  const pushImage = useImageStore((state) => state.pushImage);
  const saveImage = useImageStore((state) => state.saveImage);
  const loadImage = useImageStore((state) => state.loadImage);
  const pruneImages = useImageStore((state) => state.pruneImages);
  const searchImages = useImageStore((state) => state.searchImages);
  const searchResults = useImageStore((state) => state.searchResults);
  const searchLoading = useImageStore((state) => state.searchLoading);

  const createContainer = useContainerStore((state) => state.createContainer);
  
  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);
  
  const [pullImageName, setPullImageName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [buildModalOpen, setBuildModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [pushConfirmModalOpen, setPushConfirmModalOpen] = useState(false);
  const [pruneConfirmModalOpen, setPruneConfirmModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [createContainerModalOpen, setCreateContainerModalOpen] = useState(false);
  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [generatedCommand, setGeneratedCommand] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ id: string; name: string} | null>(null);
  const [buildImageName, setBuildImageName] = useState("");
  const [dockerfilePath, setDockerfilePath] = useState("");
  const [contextPath, setContextPath] = useState("");
  const [newTag, setNewTag] = useState("");
  const [savePath, setSavePath] = useState("");
  const [loadPath, setLoadPath] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [containerName, setContainerName] = useState("");
  const [containerPorts, setContainerPorts] = useState("");
  const [containerEnv, setContainerEnv] = useState("");
  const [containerVolumes, setContainerVolumes] = useState("");
  const [containerCommand, setContainerCommand] = useState("");
  const buildEndRef = useRef<HTMLDivElement>(null);
  const pullEndRef = useRef<HTMLDivElement>(null);

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchImages();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, autoRefreshInterval, fetchImages]);

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    
    const query = searchQuery.toLowerCase();
    return images.filter((image) => {
      return (
        image.repository?.toLowerCase().includes(query) ||
        image.tag?.toLowerCase().includes(query) ||
        image.id?.toLowerCase().includes(query)
      );
    });
  }, [images, searchQuery]);

  const handleOpenDeleteConfirm = (imageId: string, imageName: string) => {
    setSelectedImage({ id: imageId, name: imageName });
    setDeleteConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedImage) return;
    await deleteImage(selectedImage.id);
    setDeleteConfirmModalOpen(false);
    setSelectedImage(null);
  };

  const handlePull = async () => {
    if (pullImageName.trim()) {
      await pullImage(pullImageName.trim());
      setPullImageName("");
      
      // Auto-scroll to bottom
      setTimeout(() => {
        pullEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleRefresh = () => {
    fetchImages();
  };

  const handleOpenInspect = async (imageId: string, imageName: string) => {
    setSelectedImage({ id: imageId, name: imageName });
    setInspectModalOpen(true);
    await inspectImage(imageId);
  };

  const handleCloseInspect = () => {
    setInspectModalOpen(false);
    setSelectedImage(null);
  };

  const handleOpenBuildModal = () => {
    setBuildModalOpen(true);
    clearBuildOutput();
  };

  const handleCloseBuildModal = () => {
    setBuildModalOpen(false);
    setBuildImageName("");
    setDockerfilePath("");
    setContextPath("");
    clearBuildOutput();
  };

  const handleSelectDockerfile = async () => {
    try {
      const selected = await open({
        title: 'Select Dockerfile',
        multiple: false,
        directory: false
      });
      
      if (selected && typeof selected === 'string') {
        setDockerfilePath(selected);
      }
    } catch (error) {
      console.error('Failed to select Dockerfile:', error);
    }
  };

  const handleSelectContextPath = async () => {
    try {
      const selected = await open({
        title: 'Select Build Context Directory',
        multiple: false,
        directory: true
      });
      
      if (selected && typeof selected === 'string') {
        setContextPath(selected);
      }
    } catch (error) {
      console.error('Failed to select context path:', error);
    }
  };

  const handleBuild = async () => {
    if (!buildImageName.trim() || !dockerfilePath.trim() || !contextPath.trim()) {
      return;
    }
    
    await buildImage(buildImageName.trim(), dockerfilePath.trim(), contextPath.trim());
    
    // Auto-scroll to bottom
    setTimeout(() => {
      buildEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleOpenTag = (imageId: string, imageName: string) => {
    setSelectedImage({ id: imageId, name: imageName });
    setNewTag(imageName);
    setTagModalOpen(true);
  };

  const handleCloseTag = () => {
    setTagModalOpen(false);
    setSelectedImage(null);
    setNewTag("");
  };

  const handleTag = async () => {
    if (!newTag.trim() || !selectedImage) return;
    await tagImage(selectedImage.id, newTag.trim());
    handleCloseTag();
  };

  const handleOpenPush = (imageId: string, imageName: string) => {
    setSelectedImage({ id: imageId, name: imageName });
    setPushConfirmModalOpen(true);
  };

  const handleClosePush = () => {
    setPushConfirmModalOpen(false);
    setSelectedImage(null);
  };

  const handlePush = async () => {
    if (!selectedImage) return;
    await pushImage(selectedImage.name);
    handleClosePush();
  };

  const handleOpenSave = async (imageId: string, imageName: string) => {
    try {
      const selected = await saveDialog({
        title: 'Save Image as TAR',
        defaultPath: `${imageName.replace(/:/g, '_')}.tar`,
        filters: [{
          name: 'TAR Files',
          extensions: ['tar']
        }]
      });
      
      if (selected) {
        setSelectedImage({ id: imageId, name: imageName });
        setSavePath(selected);
        // Directly save without opening modal
        await saveImage(imageName, selected);
      }
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const handleCloseSave = () => {
    setSaveModalOpen(false);
    setSelectedImage(null);
    setSavePath("");
  };

  const handleSave = async () => {
    if (!savePath.trim() || !selectedImage) return;
    await saveImage(selectedImage.name, savePath.trim());
    handleCloseSave();
  };

  const handleSelectLoadFile = async () => {
    try {
      const selected = await open({
        title: 'Select TAR file to load',
        multiple: false,
        directory: false,
        filters: [{
          name: 'TAR Files',
          extensions: ['tar']
        }]
      });
      
      if (selected && typeof selected === 'string') {
        setLoadPath(selected);
      }
    } catch (error) {
      console.error('Failed to select tar file:', error);
    }
  };

  const handleOpenLoad = () => {
    setLoadPath("");
    setLoadModalOpen(true);
  };

  const handleCloseLoad = () => {
    setLoadModalOpen(false);
    setLoadPath("");
  };

  const handleLoad = async () => {
    if (!loadPath.trim()) return;
    await loadImage(loadPath.trim());
    handleCloseLoad();
  };

  const handleOpenCreateContainer = (imageName: string) => {
    setSelectedImage({ id: "", name: imageName });
    setCreateContainerModalOpen(true);
  };

  const handleCreateContainerFromImage = async () => {
    if (!selectedImage) return;
    
    const ports = containerPorts.trim() ? containerPorts.split(',').map(p => p.trim()).filter(Boolean) : undefined;
    const env = containerEnv.trim() ? containerEnv.split(',').map(e => e.trim()).filter(Boolean) : undefined;
    const volumes = containerVolumes.trim() ? containerVolumes.split(',').map(v => v.trim()).filter(Boolean) : undefined;
    const name = containerName.trim() || undefined;
    const command = containerCommand.trim() || undefined;
    
    const dockerCommand = await createContainer(selectedImage.name, name, ports, env, volumes, command);
    
    if (dockerCommand) {
      setGeneratedCommand(dockerCommand);
      setCommandModalOpen(true);
    }
    
    // Close modal and reset
    setCreateContainerModalOpen(false);
    setContainerName("");
    setContainerPorts("");
    setContainerEnv("");
    setContainerVolumes("");
    setContainerCommand("");
    setSelectedImage(null);
  };

  const handleCopyCommand = async () => {
    try {
      await writeText(generatedCommand);
      addToast({
        title: "Copied to Clipboard",
        description: "Docker command copied successfully",
        color: "success",
        timeout: 1000,
      });
    } catch (error) {
      addToast({
        title: "Copy Failed",
        description: "Failed to copy command to clipboard",
        color: "danger",
        timeout: 1500,
      });
    }
  };

  const handleOpenPrune = () => {
    setPruneConfirmModalOpen(true);
  };

  const handleClosePrune = () => {
    setPruneConfirmModalOpen(false);
  };

  const handlePrune = async () => {
    await pruneImages();
    handleClosePrune();
  };

  const handleOpenSearch = () => {
    setSearchTerm("");
    setSearchModalOpen(true);
  };

  const handleCloseSearch = () => {
    setSearchModalOpen(false);
    setSearchTerm("");
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    await searchImages(searchTerm.trim());
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading Docker images...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 text-xl font-semibold">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl p-2 font-bold gap-2 flex items-center">
          <List />
          <span className="text-red-500">Docker</span> Images
        </h1>
        <Button
          color="default"
          variant="flat"
          onPress={handleRefresh}
          isDisabled={loading || operationLoading}
          startContent={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>
      
      {/* Pull Image Section */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Pull New Image</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter image name (e.g., nginx:latest)"
            value={pullImageName}
            onChange={(e) => setPullImageName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePull()}
            className="flex-1"
          />
          <Button
            color="primary"
            onPress={handlePull}
            isDisabled={!pullImageName.trim() || operationLoading}
            isLoading={operationLoading}
            startContent={!operationLoading && <Download className="w-4 h-4" />}
          >
            Pull Image
          </Button>
        </div>
        
        {/* Pull Progress Output */}
        {pullProgress && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Pull Progress:</h3>
              <Button
                size="sm"
                color="warning"
                variant="flat"
                onPress={clearPullProgress}
                isDisabled={operationLoading}
              >
                Clear
              </Button>
            </div>
            <div
              className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-y-auto"
              style={{ height: "300px" }}
            >
              <pre className="whitespace-pre-wrap">{pullProgress}</pre>
              <div ref={pullEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Build Image Section */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Build Image from Dockerfile</h2>
        <div className="flex gap-2">
          <Button
            color="secondary"
            onPress={handleOpenBuildModal}
            isDisabled={operationLoading}
            startContent={<Hammer className="w-4 h-4" />}
          >
            Build Image
          </Button>
        </div>
      </div>

      {/* Additional Image Actions */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Additional Actions</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            color="primary"
            onPress={handleOpenLoad}
            isDisabled={operationLoading}
            startContent={<FileUp className="w-4 h-4" />}
          >
            Load Image
          </Button>
          <Button
            color="secondary"
            onPress={handleOpenSearch}
            isDisabled={operationLoading}
            startContent={<SearchIcon className="w-4 h-4" />}
          >
            Search Registry
          </Button>
          <Button
            color="warning"
            onPress={handleOpenPrune}
            isDisabled={operationLoading}
            startContent={<Trash className="w-4 h-4" />}
          >
            Prune Unused
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Search images by repository, tag, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            endContent={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )
            }
            className="flex-1"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredImages.length} of {images.length} images
          </p>
        )}
      </div>

      {/* Images List */}
      {!images || images.length === 0 ? (
        <div className="text-xl font-semibold">No Docker images found</div>
      ) : filteredImages.length === 0 ? (
        <div className="text-xl font-semibold text-gray-500">
          No images match your search criteria
        </div>
      ) : (
        <div className="space-y-4">
          {filteredImages.map((image) => (
            <Card key={image.id}>
              <CardHeader className="bg-red-500 text-white font-bold text-2xl">
                {image.repository}:{image.tag}
              </CardHeader>
              <CardBody>
                <p><strong>ID:</strong> {image.id}</p>
                <p><strong>Size:</strong> {image.size}</p>
                <p><strong>Created:</strong> {image.createdSince}</p>
                <p><strong>Created At:</strong> {image.createdAt}</p>
              </CardBody>
              <CardFooter className="gap-2 flex-wrap">
                <Button
                  color="success"
                  onPress={() => handleOpenCreateContainer(`${image.repository}:${image.tag}`)}
                  isDisabled={operationLoading}
                  startContent={<PlayCircle className="w-4 h-4" />}
                >
                  Create Container
                </Button>
                <Button
                  color="secondary"
                  onPress={() => handleOpenInspect(image.id!, `${image.repository}:${image.tag}`)}
                  isDisabled={operationLoading}
                  startContent={<Info className="w-4 h-4" />}
                >
                  Inspect
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleOpenTag(image.id!, `${image.repository}:${image.tag}`)}
                  isDisabled={operationLoading}
                  startContent={<Tag className="w-4 h-4" />}
                >
                  Tag
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleOpenPush(image.id!, `${image.repository}:${image.tag}`)}
                  isDisabled={operationLoading}
                  startContent={<Upload className="w-4 h-4" />}
                >
                  Push
                </Button>
                <Button
                  color="secondary"
                  onPress={() => handleOpenSave(image.id!, `${image.repository}:${image.tag}`)}
                  isDisabled={operationLoading}
                  startContent={<Save className="w-4 h-4" />}
                >
                  Save
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleOpenDeleteConfirm(image.id!, `${image.repository}:${image.tag}`)}
                  isDisabled={operationLoading}
                  isLoading={operationLoading}
                  startContent={!operationLoading && <Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      <Modal 
        isOpen={inspectModalOpen} 
        onClose={handleCloseInspect}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="bg-red-500 text-white">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span>Image Inspect: {selectedImage?.name}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {inspectLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8" />
                <span className="ml-2">Loading image details...</span>
              </div>
            ) : inspectData ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <Card>
                  <CardHeader className="bg-red-100 dark:bg-red-900 font-bold">
                    Basic Information
                  </CardHeader>
                  <CardBody className="grid grid-cols-2 gap-3 text-sm">
                    <div><strong>ID:</strong> <span className="font-mono text-xs">{inspectData.id}</span></div>
                    <div><strong>Size:</strong> {inspectData.size}</div>
                    <div><strong>Created:</strong> {inspectData.created}</div>
                    <div><strong>Architecture:</strong> {inspectData.architecture}</div>
                    <div><strong>OS:</strong> {inspectData.os}</div>
                    <div><strong>Docker Version:</strong> {inspectData.dockerVersion}</div>
                    {inspectData.author && <div className="col-span-2"><strong>Author:</strong> {inspectData.author}</div>}
                  </CardBody>
                </Card>

                {/* Tags */}
                {inspectData.tags && inspectData.tags.length > 0 && (
                  <Card>
                    <CardHeader className="bg-blue-100 dark:bg-blue-900 font-bold">
                      Tags ({inspectData.tags.length})
                    </CardHeader>
                    <CardBody>
                      <div className="flex flex-wrap gap-2">
                        {inspectData.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Config - Command */}
                {inspectData.config.cmd && inspectData.config.cmd.length > 0 && (
                  <Card>
                    <CardHeader className="bg-purple-100 dark:bg-purple-900 font-bold">
                      Command
                    </CardHeader>
                    <CardBody>
                      <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded block font-mono text-sm">
                        {inspectData.config.cmd.join(" ")}
                      </code>
                    </CardBody>
                  </Card>
                )}

                {/* Config - Entrypoint */}
                {inspectData.config.entrypoint && inspectData.config.entrypoint.length > 0 && (
                  <Card>
                    <CardHeader className="bg-indigo-100 dark:bg-indigo-900 font-bold">
                      Entrypoint
                    </CardHeader>
                    <CardBody>
                      <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded block font-mono text-sm">
                        {inspectData.config.entrypoint.join(" ")}
                      </code>
                    </CardBody>
                  </Card>
                )}

                {/* Environment Variables */}
                {inspectData.config.env && inspectData.config.env.length > 0 && (
                  <Card>
                    <CardHeader className="bg-green-100 dark:bg-green-900 font-bold">
                      Environment Variables ({inspectData.config.env.length})
                    </CardHeader>
                    <CardBody>
                      <div className="max-h-60 overflow-y-auto">
                        {inspectData.config.env.map((envVar, index) => (
                          <div key={index} className="font-mono text-xs py-1 border-b last:border-b-0">
                            {envVar}
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Exposed Ports */}
                {inspectData.config.exposedPorts && inspectData.config.exposedPorts.length > 0 && (
                  <Card>
                    <CardHeader className="bg-pink-100 dark:bg-pink-900 font-bold">
                      Exposed Ports ({inspectData.config.exposedPorts.length})
                    </CardHeader>
                    <CardBody>
                      <div className="flex flex-wrap gap-2">
                        {inspectData.config.exposedPorts.map((port, index) => (
                          <span key={index} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-mono">
                            {port}
                          </span>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Working Directory & User */}
                {(inspectData.config.workingDir || inspectData.config.user) && (
                  <Card>
                    <CardHeader className="bg-yellow-100 dark:bg-yellow-900 font-bold">
                      Configuration
                    </CardHeader>
                    <CardBody className="space-y-2 text-sm">
                      {inspectData.config.workingDir && (
                        <div><strong>Working Directory:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">{inspectData.config.workingDir}</code></div>
                      )}
                      {inspectData.config.user && (
                        <div><strong>User:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">{inspectData.config.user}</code></div>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* Labels */}
                {inspectData.config.labels && Object.keys(inspectData.config.labels).length > 0 && (
                  <Card>
                    <CardHeader className="bg-teal-100 dark:bg-teal-900 font-bold">
                      Labels ({Object.keys(inspectData.config.labels).length})
                    </CardHeader>
                    <CardBody>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {Object.entries(inspectData.config.labels).map(([key, value]) => (
                          <div key={key} className="text-xs border-b last:border-b-0 py-1">
                            <strong className="font-mono">{key}:</strong> <span className="text-gray-600 dark:text-gray-400">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Layers */}
                {inspectData.layers && inspectData.layers.length > 0 && (
                  <Card>
                    <CardHeader className="bg-orange-100 dark:bg-orange-900 font-bold">
                      Layers ({inspectData.layers.length})
                    </CardHeader>
                    <CardBody>
                      <div className="max-h-60 overflow-y-auto">
                        {inspectData.layers.map((layer, index) => (
                          <div key={index} className="font-mono text-xs py-1 border-b last:border-b-0 break-all">
                            {layer}
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* History */}
                {inspectData.history && inspectData.history.length > 0 && (
                  <Card>
                    <CardHeader className="bg-cyan-100 dark:bg-cyan-900 font-bold">
                      History ({inspectData.history.length} steps)
                    </CardHeader>
                    <CardBody>
                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {inspectData.history.slice(0, 10).map((h, index) => (
                          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-500">{h.created}</span>
                              <span className="font-semibold">{h.size}</span>
                            </div>
                            <code className="text-xs break-all block">{h.createdBy}</code>
                          </div>
                        ))}
                        {inspectData.history.length > 10 && (
                          <div className="text-center text-sm text-gray-500">
                            ... and {inspectData.history.length - 10} more steps
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No inspect data available
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={handleCloseInspect}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Build Image Modal */}
      <Modal
        isOpen={buildModalOpen}
        onClose={handleCloseBuildModal}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Build Image from Dockerfile</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Image Name (with optional tag)"
                placeholder="e.g., myapp:latest"
                value={buildImageName}
                onChange={(e) => setBuildImageName(e.target.value)}
                isDisabled={buildLoading}
                description="Format: name:tag (tag defaults to 'latest')"
              />
              <div className="flex gap-2">
                <Input
                  label="Dockerfile Path"
                  placeholder="e.g., /path/to/Dockerfile"
                  value={dockerfilePath}
                  onChange={(e) => setDockerfilePath(e.target.value)}
                  isDisabled={buildLoading}
                  description="Absolute path to the Dockerfile"
                  className="flex-1"
                />
                <Button
                  color="default"
                  onPress={handleSelectDockerfile}
                  isDisabled={buildLoading}
                  className="mt-6"
                  startContent={<FolderOpen className="w-4 h-4" />}
                >
                  Browse
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  label="Build Context Path"
                  placeholder="e.g., /path/to/context"
                  value={contextPath}
                  onChange={(e) => setContextPath(e.target.value)}
                  isDisabled={buildLoading}
                  description="Absolute path to the build context directory"
                  className="flex-1"
                />
                <Button
                  color="default"
                  onPress={handleSelectContextPath}
                  isDisabled={buildLoading}
                  className="mt-6"
                  startContent={<FolderOpen className="w-4 h-4" />}
                >
                  Browse
                </Button>
              </div>

              {/* Build Output */}
              {buildOutput && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Build Output:</h3>
                  <div
                    className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-auto select-text"
                    style={{ maxHeight: "300px", userSelect: "text" }}
                  >
                    <pre className="whitespace-pre-wrap select-text" style={{ userSelect: "text" }}>{buildOutput}</pre>
                    <div ref={buildEndRef} />
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleBuild}
              isLoading={buildLoading}
              isDisabled={!buildImageName || !dockerfilePath || !contextPath}
            >
              Build
            </Button>
            <Button
              color="warning"
              onPress={clearBuildOutput}
              isDisabled={buildLoading || !buildOutput}
            >
              Clear Output
            </Button>
            <Button color="default" onPress={handleCloseBuildModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Tag Image Modal */}
      <Modal
        isOpen={tagModalOpen}
        onClose={handleCloseTag}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Tag Image</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current: {selectedImage?.name}
              </p>
              <Input
                autoFocus
                label="New Tag"
                placeholder="e.g., myrepo/myimage:v1.0"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTag()}
                description="Format: [registry/][repository]:tag"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleTag}
              isDisabled={!newTag.trim()}
            >
              Tag
            </Button>
            <Button color="default" onPress={handleCloseTag}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Save Image Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={handleCloseSave}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Save Image to TAR</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Image: {selectedImage?.name}
              </p>
              <Input
                autoFocus
                label="Output Path"
                placeholder="e.g., /tmp/myimage.tar"
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                description="Absolute path where the TAR file will be saved"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleSave}
              isDisabled={!savePath.trim()}
            >
              Save
            </Button>
            <Button color="default" onPress={handleCloseSave}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Load Image Modal */}
      <Modal
        isOpen={loadModalOpen}
        onClose={handleCloseLoad}
        placement="center"
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Load Image from TAR</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  autoFocus
                  label="TAR File Path"
                  placeholder="e.g., /tmp/myimage.tar"
                  value={loadPath}
                  onChange={(e) => setLoadPath(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLoad()}
                  description="Absolute path to the TAR file to load"
                  className="flex-1"
                />
                <Button
                  color="default"
                  onPress={handleSelectLoadFile}
                  className="mt-6"
                  startContent={<FolderOpen className="w-4 h-4" />}
                >
                  Browse
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handleLoad}
              isDisabled={!loadPath.trim()}
            >
              Load
            </Button>
            <Button color="default" onPress={handleCloseLoad}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Search Registry Modal */}
      <Modal
        isOpen={searchModalOpen}
        onClose={handleCloseSearch}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Search Docker Registry</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="Search for images (e.g., nginx)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button
                  color="primary"
                  onPress={handleSearch}
                  isDisabled={!searchTerm.trim()}
                  isLoading={searchLoading}
                >
                  Search
                </Button>
              </div>
              
              {/* Search Results */}
              {searchResults && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Search Results:</h3>
                  <div
                    className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-auto"
                    style={{ maxHeight: "400px" }}
                  >
                    <pre className="whitespace-pre-wrap">{searchResults}</pre>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={handleCloseSearch}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Push Confirmation Modal */}
      <Modal
        isOpen={pushConfirmModalOpen}
        onClose={handleClosePush}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader>Confirm Push to Registry</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm">
                Are you sure you want to push <strong>{selectedImage?.name}</strong> to the registry?
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Make sure you are logged in to the registry and have the necessary permissions.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={handlePush}
            >
              Push
            </Button>
            <Button color="default" onPress={handleClosePush}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModalOpen}
        onClose={() => setDeleteConfirmModalOpen(false)}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader className="text-danger">Confirm Delete Image</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete image <strong>{selectedImage?.name}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={handleDelete}
            >
              Delete
            </Button>
            <Button color="default" onPress={() => setDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Prune Confirmation Modal */}
      <Modal
        isOpen={pruneConfirmModalOpen}
        onClose={handleClosePrune}
        placement="center"
        size="md"
      >
        <ModalContent>
          <ModalHeader>Confirm Prune Unused Images</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm">
                Are you sure you want to remove <strong>all unused images</strong>?
              </p>
              <p className="text-xs text-warning-600 dark:text-warning-400">
                ⚠️ This action cannot be undone. All dangling and unreferenced images will be permanently deleted.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={handlePrune}
            >
              Prune All Unused
            </Button>
            <Button color="default" onPress={handleClosePrune}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Container from Image Modal */}
      <Modal
        isOpen={createContainerModalOpen}
        onClose={() => setCreateContainerModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Create Container from Image: {selectedImage?.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Container Name (optional)"
                placeholder="e.g., my-container"
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                description="Custom name for the container"
              />
              <Input
                label="Port Mappings (optional)"
                placeholder="e.g., 8080:80, 3000:3000"
                value={containerPorts}
                onChange={(e) => setContainerPorts(e.target.value)}
                description="Comma-separated port mappings (host:container)"
              />
              <Input
                label="Environment Variables (optional)"
                placeholder="e.g., NODE_ENV=production, API_KEY=abc123"
                value={containerEnv}
                onChange={(e) => setContainerEnv(e.target.value)}
                description="Comma-separated environment variables (KEY=value)"
              />
              <Input
                label="Volume Mounts (optional)"
                placeholder="e.g., /host/path:/container/path"
                value={containerVolumes}
                onChange={(e) => setContainerVolumes(e.target.value)}
                description="Comma-separated volume mounts (host:container)"
              />
              <Input
                label="Command (IMPORTANT - keeps container running)"
                placeholder="sleep infinity"
                value={containerCommand}
                onChange={(e) => setContainerCommand(e.target.value)}
                description="⚠️ Required for most images to prevent immediate exit. Use 'sleep infinity' for Alpine/Ubuntu."
                classNames={{
                  label: "font-semibold text-warning",
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="success"
              onPress={handleCreateContainerFromImage}
            >
              Create Container
            </Button>
            <Button color="default" onPress={() => setCreateContainerModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Generated Command Modal */}
      <Modal
        isOpen={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Docker Run Command
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-default-500">
                Copy and paste this command in your terminal to create the container:
              </p>
              <div className="bg-default-100 p-4 rounded-lg relative">
                <pre className="text-sm select-text overflow-x-auto" style={{ userSelect: "text" }}>
                  {generatedCommand}
                </pre>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              startContent={<Copy className="w-4 h-4" />}
              onPress={handleCopyCommand}
            >
              Copy Command
            </Button>
            <Button color="default" onPress={() => setCommandModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
