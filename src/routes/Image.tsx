import { useImageStore } from "@/store/ImageStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { Card, CardBody, CardFooter, CardHeader, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { List, Loader2, Trash2, Download, RefreshCw, Search, X, Info, Hammer, Tag, Upload, Save, FileUp, Trash, SearchIcon } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";

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
  const [selectedImage, setSelectedImage] = useState<{ id: string; name: string} | null>(null);
  const [buildImageName, setBuildImageName] = useState("");
  const [dockerfilePath, setDockerfilePath] = useState("");
  const [contextPath, setContextPath] = useState("");
  const [newTag, setNewTag] = useState("");
  const [savePath, setSavePath] = useState("");
  const [loadPath, setLoadPath] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleDelete = async (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      await deleteImage(imageId);
    }
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

  const handleOpenSave = (imageId: string, imageName: string) => {
    setSelectedImage({ id: imageId, name: imageName });
    setSavePath(`/tmp/${imageName.replace(/:/g, '_')}.tar`);
    setSaveModalOpen(true);
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
                  onPress={() => handleDelete(image.id!)}
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
              <Input
                label="Dockerfile Path"
                placeholder="e.g., /path/to/Dockerfile"
                value={dockerfilePath}
                onChange={(e) => setDockerfilePath(e.target.value)}
                isDisabled={buildLoading}
                description="Absolute path to the Dockerfile"
              />
              <Input
                label="Build Context Path"
                placeholder="e.g., /path/to/context"
                value={contextPath}
                onChange={(e) => setContextPath(e.target.value)}
                isDisabled={buildLoading}
                description="Absolute path to the build context directory"
              />

              {/* Build Output */}
              {buildOutput && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Build Output:</h3>
                  <div
                    className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-auto"
                    style={{ maxHeight: "300px" }}
                  >
                    <pre className="whitespace-pre-wrap">{buildOutput}</pre>
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
              <Input
                autoFocus
                label="TAR File Path"
                placeholder="e.g., /tmp/myimage.tar"
                value={loadPath}
                onChange={(e) => setLoadPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoad()}
                description="Absolute path to the TAR file to load"
              />
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
    </div>
  );
}
