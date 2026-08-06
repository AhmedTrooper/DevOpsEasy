import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripHorizontal, Menu, Maximize, Minimize, GripVertical } from "lucide-react";
import { Heading } from "@astryxdesign/core";
import { Switch } from "@astryxdesign/core/Switch";
import { MobileNavToggle } from "@astryxdesign/core/MobileNav";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useUIStore } from "../store/uiStore";

const appWindow = getCurrentWindow();

type DockPosition = "top" | "right" | "bottom";

export default function DraggableTitlebar() {
  const { toggleSidebar } = useUIStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWidgetDraggable, setIsWidgetDraggable] = useState(true);
  const [dockPos, setDockPos] = useState<DockPosition>("top");

  useEffect(() => {
    appWindow.isFullscreen().then(setIsFullscreen);
  }, []);

  // Automatically pin the widget (unmovable in web app, moves OS window instead) after 60 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWidgetDraggable(false);
    }, 60000);
    return () => clearTimeout(timer);
  }, []);

  const handleFullscreen = async () => {
    const current = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!current);
    setIsFullscreen(!current);
  };

  const cyclePosition = () => {
    if (dockPos === "top") setDockPos("right");
    else if (dockPos === "right") setDockPos("bottom");
    else setDockPos("top");
  };

  // Determine fixed positioning classes based on dockPos
  let posClasses = "";
  let isVertical = false;

  if (dockPos === "top") {
    posClasses = "top-0 left-0 w-full flex-row justify-between rounded-none border-x-0 border-t-0 border-b";
  } else if (dockPos === "bottom") {
    posClasses = "bottom-0 left-0 w-full flex-row justify-between rounded-none border-x-0 border-b-0 border-t";
  } else if (dockPos === "right") {
    posClasses = "right-0 top-0 h-full flex-col justify-between rounded-none border-y-0 border-r-0 border-l";
    isVertical = true;
  }

  return (
    <AnimatePresence>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        // When not "draggable" (meaning it's in OS drag mode), make the whole bar an OS drag region
        data-tauri-drag-region={!isWidgetDraggable ? "true" : undefined}
        className={`fixed z-[9999] pointer-events-auto flex items-center bg-gray-900/80 backdrop-blur-md border-gray-700 shadow-2xl ${
          isVertical ? "py-4 px-2" : "px-4 py-2"
        } ${posClasses}`}
        style={{ color: "white" }}
      >
        {/* Left/Top Group */}
        <div className={`flex items-center gap-4 ${isVertical ? "flex-col" : "flex-row"}`} data-tauri-drag-region={undefined}>
          <div 
            onClick={cyclePosition}
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            title="Click to change dock position"
          >
            {isVertical ? <GripHorizontal size={20} /> : <GripVertical size={20} />}
          </div>
          
          {/* Mobile Nav Drawer Toggle (hidden on md+) */}
          <div className="md:hidden z-10">
            <MobileNavToggle />
          </div>

          {/* Desktop Sidebar Toggle (hidden on mobile) */}
          <div 
            className="hidden md:flex items-center justify-center p-1 hover:bg-gray-700 rounded-md cursor-pointer transition-colors z-10"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </div>

          <Heading 
            level={5} 
            style={{ 
              margin: 0, 
              fontWeight: 600, 
              letterSpacing: '0.5px',
              writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb'
            }} 
            className="hidden sm:block select-none pointer-events-none"
          >
            DevOpsEasy
          </Heading>
        </div>

        {/* Right/Bottom Group */}
        <div className={`flex items-center gap-3 z-10 ${isVertical ? "flex-col" : "flex-row"}`} data-tauri-drag-region={undefined}>
          
          {/* Toggle between Widget Drag (true) and OS Window Drag (false) */}
          <div title={isWidgetDraggable ? "Floating UI Mode (Click Grip to move)" : "Pinned Mode (Drag moves OS window)"}>
            <Switch
              size="sm"
              label={isWidgetDraggable ? "Float" : "Pinned"}
              isLabelHidden
              value={isWidgetDraggable}
              onChange={(val) => setIsWidgetDraggable(val)}
            />
          </div>

          {/* Fullscreen Button */}
          <div 
            onClick={handleFullscreen}
            className="w-4 h-4 flex items-center justify-center rounded-sm hover:bg-gray-700 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={14} className="text-gray-300" /> : <Maximize size={14} className="text-gray-300" />}
          </div>

          <div className={`${isVertical ? "h-px w-4" : "w-px h-4"} bg-gray-600 mx-1`} />

          {/* Window Controls */}
          <div 
            onClick={() => appWindow.close()} 
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" 
            title="Close"
          />
          <div 
            onClick={() => appWindow.minimize()} 
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" 
            title="Minimize"
          />
          <div 
            onClick={() => appWindow.toggleMaximize()} 
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" 
            title="Maximize"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
