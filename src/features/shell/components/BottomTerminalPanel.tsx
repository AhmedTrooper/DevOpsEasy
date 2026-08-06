import { useShellStore } from "../store/shellStore";
import { Terminal as TerminalIcon, ScrollText, Trash2, FolderCode, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

export function BottomTerminalPanel() {
  const terminalCwd = useShellStore((state) => state.terminalCwd);
  const terminalLogs = useShellStore((state) => state.terminalLogs);
  const clearLogs = useShellStore((state) => state.clearLogs);
  const addLog = useShellStore((state) => state.addLog);

  const [cliInput, setCliInput] = useState("");
  const [flushTimer, setFlushTimer] = useState(11);

  // 11-second state flush interval indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setFlushTimer((prev) => {
        if (prev <= 1) {
          addLog("[FLUSH] UI local state flushed to LRU memory cache");
          return 11;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [addLog]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    addLog(`$ (${terminalCwd}) > ${cliInput}`);
    setCliInput("");
  };

  return (
    <div className="h-80 md:h-64 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col font-mono shrink-0">
      {/* Header bar of Bottom Panel */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold whitespace-nowrap">
            <TerminalIcon className="w-3.5 h-3.5" />
            Terminal & Logs
          </span>
          <span className="flex items-center gap-1 text-zinc-400 text-[11px] bg-zinc-800 px-2 py-0.5 rounded whitespace-nowrap">
            <FolderCode className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Auto-CD: </span>
            <span className="text-zinc-200">{terminalCwd}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded whitespace-nowrap">
            <RefreshCcw className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Flush {flushTimer}s</span>
          </span>
          <button
            onClick={clearLogs}
            className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 text-[11px] whitespace-nowrap"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Split-Pane Content (Responsive Stack on mobile) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 overflow-hidden">
        {/* Left Pane: Integrated Interactive Terminal */}
        <div className="flex flex-col p-2.5 sm:p-3 text-xs bg-zinc-950 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-zinc-300">
            <div className="text-zinc-500"># Interactive Shell (Scoped)</div>
            <div className="text-emerald-400">$ cd {terminalCwd}</div>
            <div className="text-zinc-400">Ready for commands... Type 'docker ps' or 'git status'</div>
          </div>
          <form onSubmit={handleCommandSubmit} className="mt-2 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">$</span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Execute command..."
              className="flex-1 bg-transparent text-xs font-mono text-zinc-100 focus:outline-none placeholder-zinc-600"
            />
          </form>
        </div>

        {/* Right Pane: Real-time Structured Stream Logs */}
        <div className="flex flex-col p-2.5 sm:p-3 text-xs bg-zinc-900/60 overflow-y-auto space-y-1 min-h-0">
          <div className="text-zinc-500 flex items-center gap-1 mb-1 font-semibold">
            <ScrollText className="w-3 h-3 text-indigo-400" />
            Real-time Output Log Stream
          </div>
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="text-zinc-300 font-mono text-[11px] leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
