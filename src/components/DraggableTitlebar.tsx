import { motion } from "framer-motion";
import { GripHorizontal } from "lucide-react";
import { Heading } from "@astryxdesign/core";

export default function DraggableTitlebar() {
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: 24, y: 24 }}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className="fixed z-[9999] flex items-center gap-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 shadow-2xl rounded-full px-5 py-2 cursor-grab"
      style={{
        // Ensure the colors pop in the dark theme and feel premium
        color: "white",
      }}
    >
      <GripHorizontal size={20} className="text-gray-400 hover:text-white transition-colors" />
      
      <Heading level={4} style={{ margin: 0, fontWeight: 600, letterSpacing: '0.5px' }}>
        DevOpsEasy
      </Heading>

      <div className="flex items-center gap-2 ml-4">
        <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" />
        <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" />
      </div>
    </motion.div>
  );
}
