import { useShellStore } from "../store/shellStore";
import { TopNav } from "@astryxdesign/core/TopNav";
import { Button } from "@astryxdesign/core/Button";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  ChevronRight,
  GitBranch,
  Cloud,
  Terminal,
  ShieldAlert,
} from "lucide-react";

export function TopHeaderBar() {
  const activeProject = useShellStore((state) => state.activeProject);
  const activeScopePath = useShellStore((state) => state.activeScopePath);
  const activeCloudProfile = useShellStore((state) => state.activeCloudProfile);
  const cloudProfiles = useShellStore((state) => state.cloudProfiles);
  const setActiveCloudProfile = useShellStore((state) => state.setActiveCloudProfile);

  const isTerminalOpen = useShellStore((state) => state.isTerminalOpen);
  const toggleTerminal = useShellStore((state) => state.toggleTerminal);
  const addLog = useShellStore((state) => state.addLog);

  const handleGitSync = () => {
    addLog("[GIT] Triggered global Git Sync...");
  };

  const handleStartDragging = async () => {
    try {
      await getCurrentWindow().startDragging();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div onMouseDown={handleStartDragging} className="w-full cursor-grab active:cursor-grabbing">
      <TopNav
        label="Context & Execution Target Header"
        startContent={
          /* Scope Breadcrumb - Responsive Scrolling */
          <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-md border border-zinc-200 dark:border-zinc-700/60 overflow-x-auto max-w-[280px] sm:max-w-none">
            <span className="font-semibold text-indigo-500 whitespace-nowrap">
              {activeProject?.name || "No Project"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-amber-500 whitespace-nowrap">{activeScopePath}</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 hidden sm:inline" />
            {/* Visual distinction for remote actions */}
            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 items-center gap-1 hidden sm:flex whitespace-nowrap">
              <Cloud className="w-3 h-3" />
              {activeCloudProfile}
            </span>
          </div>
        }
        endContent={
          /* Quick Action Toolbar with Local vs Remote separation */
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto" onMouseDown={(e) => e.stopPropagation()}>
            {/* LOCAL ACTIONS ZONE */}
            <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500/5 rounded border border-emerald-500/20">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-500 tracking-wider hidden xs:inline">
                LOCAL
              </span>
              <Button size="sm" label="Sync (main)" onClick={handleGitSync}>
                <GitBranch className="w-3.5 h-3.5 mr-0.5 sm:mr-1 text-emerald-400" />
                <span className="hidden xs:inline">Sync</span>
              </Button>
            </div>

            {/* REMOTE ACTIONS ZONE (Visual Warning Guard) */}
            <div className="flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-500/5 rounded border border-amber-500/20">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-500 tracking-wider hidden sm:flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                REMOTE
              </span>
              <select
                value={activeCloudProfile}
                onChange={(e) => setActiveCloudProfile(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs rounded px-1.5 sm:px-2 py-1 font-mono focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none"
              >
                {cloudProfiles.map((cp) => (
                  <option key={cp} value={cp}>
                    {cp}
                  </option>
                ))}
              </select>
            </div>

            {/* GLOBAL TERMINAL TRIGGER */}
            <Button
              size="sm"
              label="Terminal"
              onClick={toggleTerminal}
              className={isTerminalOpen ? "bg-indigo-600 text-white" : ""}
            >
              <Terminal className="w-3.5 h-3.5 mr-0.5 sm:mr-1" />
              <span className="hidden md:inline">Terminal</span>
            </Button>
          </div>
        }
      />
    </div>
  );
}
