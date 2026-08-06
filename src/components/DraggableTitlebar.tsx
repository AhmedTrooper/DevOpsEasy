import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripHorizontal, Menu, Maximize, Minimize, GripVertical, X, Minus } from "lucide-react";
import { Heading } from "@astryxdesign/core";
import { Switch } from "@astryxdesign/core/Switch";
import { MobileNavToggle } from "@astryxdesign/core/MobileNav";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useUIStore } from "../store/uiStore";

const appWindow = getCurrentWindow();



export default function DraggableTitlebar() {
  const { toggleSidebar, dockPos, cycleDockPos } = useUIStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWidgetDraggable, setIsWidgetDraggable] = useState(true);

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

  // Determine fixed positioning classes based on dockPos
  let posClasses = "";
  let isVertical = false;
  
  if (dockPos === "top") {
    posClasses = "flex-row justify-between border-b";
  } else if (dockPos === "bottom") {
    posClasses = "flex-row justify-between border-t";
  } else if (dockPos === "right") {
    posClasses = "h-full flex-col justify-between border-l";
    isVertical = true;
  }

  return (
    <AnimatePresence>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        // When not "draggable" (meaning it's in OS drag mode), make the whole bar an OS drag region
        data-tauri-drag-region={!isWidgetDraggable ? "true" : undefined}
        className={`z-[99] shrink-0 pointer-events-auto flex items-center bg-surface/80 text-primary backdrop-blur-md border-default shadow-sm ${
          isVertical ? "py-4 px-2" : "px-4 py-2"
        } ${posClasses}`}
      >
        {/* Left/Top Group */}
        <div className={`flex items-center gap-4 ${isVertical ? "flex-col" : "flex-row"}`} data-tauri-drag-region={undefined}>
          <div 
            onClick={cycleDockPos}
            className="cursor-pointer text-secondary hover:text-primary transition-colors"
            title="Click to change dock position"
          >
            {isVertical ? <GripHorizontal size={20} /> : <GripVertical size={20} />}
          </div>
          
          {/* Mobile Nav Drawer Toggle (visible on small screens) */}
          <div className="md:hidden z-10 flex items-center justify-center">
            <MobileNavToggle>
              <div className="flex items-center justify-center p-1 hover:bg-surface-hover rounded-md cursor-pointer transition-colors outline-none focus:outline-none">
                <Menu size={18} />
              </div>
            </MobileNavToggle>
          </div>

          {/* Sidebar Toggle (visible on large screens) */}
          <button 
            className="hidden md:flex items-center justify-center p-1 hover:bg-surface-hover rounded-md cursor-pointer transition-colors z-10 outline-none focus:outline-none border-none bg-transparent"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>

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
            Portside
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

          <div className={`${isVertical ? "h-px w-4" : "w-px h-4"} bg-gray-600 mx-1`} />

          {/* Window Controls */}
          <div 
            onClick={() => appWindow.close()} 
            className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" 
            title="Close"
          >
            <X size={10} className="text-red-950 opacity-60 hover:opacity-100" />
          </div>
          <div 
            onClick={() => appWindow.minimize()} 
            className="w-4 h-4 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" 
            title="Minimize"
          >
            <Minus size={10} className="text-yellow-950 opacity-60 hover:opacity-100" />
          </div>
          <div 
            onClick={handleFullscreen} 
            className="w-4 h-4 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" 
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={10} className="text-green-950 opacity-60 hover:opacity-100" /> : <Maximize size={10} className="text-green-950 opacity-60 hover:opacity-100" />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
