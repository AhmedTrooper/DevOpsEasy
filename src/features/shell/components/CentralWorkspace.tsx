import { useShellStore } from "../store/shellStore";
import { TabList } from "@astryxdesign/core/TabList";
import { Tab } from "@astryxdesign/core/TabList";
import { Activity, Cloud, Container, GitBranch, ShieldAlert } from "lucide-react";

// Import existing Docker Dashboard for Tab 3
import Home from "../../../routes/Home";

export function CentralWorkspace() {
  const activeTab = useShellStore((state) => state.activeTab);
  const setActiveTab = useShellStore((state) => state.setActiveTab);
  const activeScopePath = useShellStore((state) => state.activeScopePath);
  const activeCloudProfile = useShellStore((state) => state.activeCloudProfile);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden">
      {/* Workspace Header Tabs - Clean Padding & Alignment */}
      <div className="px-3 sm:px-6 pt-2 pb-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
        <TabList
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          size="md"
          hasDivider
        >
          <Tab
            value="overview"
            label="Overview & Status"
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
          />
          <Tab
            value="cloud"
            label="Infrastructure & Cloud"
            icon={<Cloud className="w-4 h-4 text-amber-500" />}
          />
          <Tab
            value="containers"
            label="Containers & Orchestration"
            icon={<Container className="w-4 h-4 text-blue-500" />}
          />
          <Tab
            value="git"
            label="VCS & Git"
            icon={<GitBranch className="w-4 h-4 text-indigo-500" />}
          />
        </TabList>
      </div>

      {/* Tab Content Viewports with Balanced Padding */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "overview" && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-emerald-400 text-lg sm:text-xl">Subdirectory Health Status</h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">Execution scope targeted to <span className="font-mono text-amber-400">{activeScopePath}</span></p>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-md font-mono text-xs font-bold tracking-wide shadow">
                HEALTHY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 font-mono text-xs">
              <div className="p-5 bg-zinc-800/40 rounded-xl border border-zinc-700/60 shadow-sm">
                <div className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">Active Scope</div>
                <div className="text-base font-bold text-amber-400 mt-2">{activeScopePath}</div>
              </div>
              <div className="p-5 bg-zinc-800/40 rounded-xl border border-zinc-700/60 shadow-sm">
                <div className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">Running Containers</div>
                <div className="text-base font-bold text-blue-400 mt-2">4 Active</div>
              </div>
              <div className="p-5 bg-zinc-800/40 rounded-xl border border-zinc-700/60 shadow-sm">
                <div className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">Git Branch Status</div>
                <div className="text-base font-bold text-emerald-400 mt-2">Clean (main)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "cloud" && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-4 shadow-sm">
              <ShieldAlert className="w-7 h-7 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-500 text-lg sm:text-xl">Remote Infrastructure Management</h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Execution target: <span className="font-mono text-amber-400">{activeCloudProfile}</span>. Actions in this tab impact live cloud environments.</p>
              </div>
            </div>
            <div className="p-12 text-center text-zinc-500 font-mono bg-zinc-800/20 rounded-xl border border-zinc-800">
              [Phase 3: AWS / GCP / Azure Infrastructure Management Module]
            </div>
          </div>
        )}

        {activeTab === "containers" && (
          <div className="max-w-7xl mx-auto">
            <Home />
          </div>
        )}

        {activeTab === "git" && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-sm">
              <h3 className="font-bold text-indigo-400 text-lg sm:text-xl">VCS & Git Workspace</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Staging, Diff Viewer, and Remote Branch Sync</p>
            </div>
            <div className="p-12 text-center text-zinc-500 font-mono bg-zinc-800/20 rounded-xl border border-zinc-800">
              [Phase 5: VCS & Git Module]
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
