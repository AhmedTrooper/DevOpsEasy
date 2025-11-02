import { Switch, Card, CardBody, CardHeader, Select, SelectItem, Slider, Button } from "@heroui/react";
import { ArrowLeft, Settings as SettingsIcon, RefreshCw, Layout, Palette, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettingsStore } from "@/store/SettingsStore";
import { useEffect } from "react";
import { addToast } from "@heroui/react";

export default function Settings() {
  const autoRefreshEnabled = useSettingsStore((state) => state.autoRefreshEnabled);
  const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);
  const defaultView = useSettingsStore((state) => state.defaultView);
  const compactMode = useSettingsStore((state) => state.compactMode);
  
  const setAutoRefreshEnabled = useSettingsStore((state) => state.setAutoRefreshEnabled);
  const setAutoRefreshInterval = useSettingsStore((state) => state.setAutoRefreshInterval);
  const setDefaultView = useSettingsStore((state) => state.setDefaultView);
  const setCompactMode = useSettingsStore((state) => state.setCompactMode);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      resetSettings();
      addToast({
        title: "Settings Reset",
        description: "All settings have been reset to default values",
        color: "success",
        timeout: 2000,
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-3xl flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h1>
        <Link
          to={"/"}
          className="flex gap-2 font-bold items-center hover:text-blue-500"
        >
          <ArrowLeft />
          <p>Home</p>
        </Link>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Auto-Refresh Settings */}
        <Card>
          <CardHeader className="bg-blue-500 text-white font-bold text-xl flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Auto-Refresh Settings
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Enable Auto-Refresh</h3>
                <p className="text-sm text-gray-500">
                  Automatically refresh Docker resources at regular intervals
                </p>
              </div>
              <Switch
                isSelected={autoRefreshEnabled}
                onValueChange={setAutoRefreshEnabled}
              />
            </div>

            {autoRefreshEnabled && (
              <div>
                <label className="font-semibold mb-2 block">
                  Refresh Interval: {autoRefreshInterval} seconds
                </label>
                <Slider
                  size="sm"
                  step={5}
                  minValue={5}
                  maxValue={120}
                  value={autoRefreshInterval}
                  onChange={(value) => setAutoRefreshInterval(value as number)}
                  className="max-w-md"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Resources will refresh every {autoRefreshInterval} seconds
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* UI Preferences */}
        <Card>
          <CardHeader className="bg-purple-500 text-white font-bold text-xl flex items-center gap-2">
            <Layout className="w-5 h-5" />
            UI Preferences
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="font-semibold mb-2 block">Default View</label>
              <Select
                selectedKeys={[defaultView]}
                onChange={(e) => setDefaultView(e.target.value)}
                placeholder="Select default view"
                className="max-w-md"
              >
                <SelectItem key="/">Home</SelectItem>
                <SelectItem key="/containers">Containers</SelectItem>
                <SelectItem key="/images">Images</SelectItem>
                <SelectItem key="/volumes">Volumes</SelectItem>
                <SelectItem key="/networks">Networks</SelectItem>
                <SelectItem key="/compose">Compose</SelectItem>
                <SelectItem key="/stats">Stats</SelectItem>
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                The page that opens when you launch the app
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Compact Mode</h3>
                <p className="text-sm text-gray-500">
                  Show more items with reduced spacing
                </p>
              </div>
              <Switch
                isSelected={compactMode}
                onValueChange={setCompactMode}
              />
            </div>
          </CardBody>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="bg-green-500 text-white font-bold text-xl flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Theme</h3>
                <p className="text-sm text-gray-500">
                  Theme is controlled by your system settings
                </p>
              </div>
              <div className="text-sm text-gray-600">
                System Default
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Reset Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Reset All Settings</h3>
                <p className="text-sm text-gray-500">
                  Restore all settings to their default values
                </p>
              </div>
              <Button
                color="danger"
                variant="flat"
                onPress={handleReset}
                startContent={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
