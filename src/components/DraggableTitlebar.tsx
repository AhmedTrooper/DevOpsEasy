import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GripHorizontal, Menu, Maximize, Minimize } from "lucide-react";
import { Heading } from "@astryxdesign/core";
import { Switch } from "@astryxdesign/core/Switch";
import { MobileNavToggle } from "@astryxdesign/core/MobileNav";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useUIStore } from "../store/uiStore";

const appWindow = getCurrentWindow();

export default function DraggableTitlebar() {
  const { toggleSidebar } = useUIStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWidgetDraggable, setIsWidgetDraggable] = useState(true);

  const [constraints, setConstraints] = useState({ top: 10, left: 10, right: 1000, bottom: 800 });

  useEffect(() => {
    appWindow.isFullscreen().then(setIsFullscreen);
  }, []);

  // Update drag constraints so it never gets lost off-screen
  useEffect(() => {
    const updateConstraints = () => {
      setConstraints({
        top: 10,
        left: 10,
        // Approximate max right/bottom values for a 450x60 widget
        right: window.innerWidth - 450,
        bottom: window.innerHeight - 60,
      });
    };
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
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

  return (
    <motion.div
      drag={isWidgetDraggable}
      dragConstraints={constraints}
      dragMomentum={false}
      initial={{ x: 24, y: 24 }}
      whileDrag={isWidgetDraggable ? { scale: 1.05, cursor: "grabbing" } : undefined}
      // When not dragging the widget, make the whole bar an OS drag region
      data-tauri-drag-region={!isWidgetDraggable ? "true" : undefined}
      className={`fixed z-[9999] flex items-center gap-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 shadow-2xl rounded-full px-3 py-2 ${
        isWidgetDraggable ? "cursor-grab" : "cursor-default"
      }`}
      style={{ color: "white" }}
    >
      <GripHorizontal 
        size={20} 
        className="text-gray-400 hover:text-white transition-colors ml-2 pointer-events-none" 
      />
      
      {/* Mobile Nav Drawer Toggle (hidden on md+) */}
      <div className="md:hidden z-10" data-tauri-drag-region={undefined}>
        <MobileNavToggle />
      </div>

      {/* Desktop Sidebar Toggle (hidden on mobile) */}
      <div 
        className="hidden md:flex items-center justify-center p-1 hover:bg-gray-700 rounded-md cursor-pointer transition-colors z-10"
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        data-tauri-drag-region={undefined}
      >
        <Menu size={18} />
      </div>

      <Heading 
        level={5} 
        style={{ margin: 0, fontWeight: 600, letterSpacing: '0.5px' }} 
        className="hidden sm:block select-none pointer-events-none"
      >
        DevOpsEasy
      </Heading>

      <div className="flex items-center gap-3 ml-2 mr-2 z-10" data-tauri-drag-region={undefined}>
        
        {/* Toggle between Widget Drag (true) and OS Window Drag (false) */}
        <div title={isWidgetDraggable ? "Widget is Floating (Drag moves widget)" : "Widget is Pinned (Drag moves window)"}>
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

        <div className="w-px h-4 bg-gray-600 mx-1" />

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
  );
}
