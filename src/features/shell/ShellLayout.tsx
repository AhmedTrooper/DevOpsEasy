import { AppShell } from "@astryxdesign/core/AppShell";
import { Theme } from "@astryxdesign/core/theme";
import { y2kTheme } from "../../themes/y2k/y2kTheme";
import { cyberTheme } from "../../themes/cyber/cyberTheme";
import { LeftSidebar } from "./components/LeftSidebar";
import { TopHeaderBar } from "./components/TopHeaderBar";
import { CentralWorkspace } from "./components/CentralWorkspace";
import { BottomTerminalPanel } from "./components/BottomTerminalPanel";
import { useShellStore } from "./store/shellStore";

export function ShellLayout() {
  const isTerminalOpen = useShellStore((state) => state.isTerminalOpen);
  const activeTheme = useShellStore((state) => state.activeTheme);
  const activeGradient = useShellStore((state) => state.activeGradient);

  const selectedTheme = activeTheme === "cyber" ? cyberTheme : y2kTheme;

  const gradientClass =
    activeGradient === "aurora"
      ? "bg-gradient-to-br from-zinc-950 via-indigo-950/40 to-slate-950"
      : activeGradient === "cyberpunk"
      ? "bg-gradient-to-br from-zinc-950 via-purple-950/40 to-rose-950/30"
      : activeGradient === "deepvoid"
      ? "bg-gradient-to-br from-black via-zinc-950 to-neutral-950"
      : "bg-gradient-to-br from-slate-950 via-cyan-950/30 to-indigo-950/40";

  return (
    <Theme theme={selectedTheme}>
      <div className={`h-full w-full ${gradientClass} transition-colors duration-500`}>
        <AppShell
          topNav={<TopHeaderBar />}
          sideNav={<LeftSidebar />}
          contentPadding={0}
          height="fill"
          variant="wash"
        >
          <div className="flex flex-col h-full overflow-hidden backdrop-blur-sm bg-transparent">
            <CentralWorkspace />
            {isTerminalOpen && <BottomTerminalPanel />}
          </div>
        </AppShell>
      </div>
    </Theme>
  );
}

export default ShellLayout;
