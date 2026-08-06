import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GripHorizontal, Menu, Maximize, Minimize } from "lucide-react";
import { Heading } from "@astryxdesign/core";
import { MobileNavToggle } from "@astryxdesign/core/MobileNav";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useUIStore } from "../store/uiStore";

const appWindow = getCurrentWindow();

export default function DraggableTitlebar() {
  const { toggleSidebar } = useUIStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    appWindow.isFullscreen().then(setIsFullscreen);
  }, []);

  const handleFullscreen = async () => {
    const current = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!current);
    setIsFullscreen(!current);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: 24, y: 24 }}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className="fixed z-[9999] flex items-center gap-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 shadow-2xl rounded-full px-3 py-2 cursor-grab"
      style={{
        // Ensure the colors pop in the dark theme and feel premium
        color: "white",
      }}
    >
      <GripHorizontal size={20} className="text-gray-400 hover:text-white transition-colors ml-2" />
      
      {/* Mobile Nav Drawer Toggle (hidden on md+) */}
      <div className="md:hidden">
        <MobileNavToggle />
      </div>

      {/* Desktop Sidebar Toggle (hidden on mobile) */}
      <div 
        className="hidden md:flex items-center justify-center p-1 hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
        onClick={toggleSidebar}
        title="Toggle Sidebar"
      >
        <Menu size={18} />
      </div>

      <Heading level={5} style={{ margin: 0, fontWeight: 600, letterSpacing: '0.5px' }} className="hidden sm:block">
        DevOpsEasy
      </Heading>

      <div className="flex items-center gap-2 ml-2 mr-2">
        {/* Fullscreen Button */}
        <div 
          onClick={handleFullscreen}
          className="w-4 h-4 flex items-center justify-center rounded-sm hover:bg-gray-700 transition-colors cursor-pointer mr-2"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={14} className="text-gray-300" /> : <Maximize size={14} className="text-gray-300" />}
        </div>

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
