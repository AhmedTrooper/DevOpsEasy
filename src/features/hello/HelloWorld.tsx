import { Button } from "@astryxdesign/core/Button";
import { Sparkles, Terminal } from "lucide-react";

export function HelloWorld() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-950 via-indigo-950/40 to-slate-950 text-white font-mono">
      <div className="p-8 rounded-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800 shadow-2xl max-w-lg w-full flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Terminal className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            Hello World!
          </h1>
          <p className="text-sm text-zinc-400">
            Portside SPA Clean Slate Initialized.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 w-full text-left text-xs space-y-2 text-zinc-300">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Architecture Status:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>SPA Root mounted cleanly</li>
            <li>Feature-based modular structure ready</li>
            <li>Existing codebase preserved (ignored for now)</li>
          </ul>
        </div>

        <Button label="Get Started" onClick={() => alert("Portside SPA Ready!")}>
          Get Started
        </Button>
      </div>
    </div>
  );
}

export default HelloWorld;
