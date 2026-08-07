import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Heading, Text, VStack, Card } from "@astryxdesign/core";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Toolbar } from "@astryxdesign/core/Toolbar";
import { useToast } from "@astryxdesign/core/Toast";
import { FolderOpen, RefreshCw, GitBranch, CircleCheck, AlertCircle } from "lucide-react";

interface StatusEntry {
  code: string;
  path: string;
}

interface RepoStatus {
  path: string;
  branch: string | null;
  is_clean: boolean;
  entries: StatusEntry[];
  error: string | null;
}

// One-line description of a porcelain code, human-readable.
const CODE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "M ": "Modified in index",
  " M": "Modified in worktree",
  "A ": "Added to index",
  "??": "Untracked",
  "!!": "Ignored",
  "D ": "Deleted from index",
  " D": "Deleted from worktree",
  "R ": "Renamed in index",
  "C ": "Copied in index",
  "UU": "Both modified",
  "AA": "Both added",
  "DD": "Both deleted",
};

function describeCode(code: string): string {
  return CODE_DESCRIPTIONS[code] ?? code;
}

function isRepoStatus(value: unknown): value is RepoStatus {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.path !== "string") return false;
  if (v.branch !== null && typeof v.branch !== "string") return false;
  if (typeof v.is_clean !== "boolean") return false;
  if (!Array.isArray(v.entries)) return false;
  if (v.error !== null && typeof v.error !== "string") return false;
  for (const e of v.entries) {
    if (!e || typeof e !== "object") return false;
    const er = e as Record<string, unknown>;
    if (typeof er.code !== "string") return false;
    if (typeof er.path !== "string") return false;
  }
  return true;
}

function stringifyError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/**
 * Git dashboard. Single folder picker + read-only `git status --porcelain`
 * view. No worktrees, no remote ops yet — just a working baseline so the
 * rest of the git feature area has a place to grow.
 */
export function GitPage() {
  const [status, setStatus] = useState<RepoStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const runStatus = async (path: string) => {
    setIsLoading(true);
    try {
      const raw: unknown = await invoke("git_status", { path });
      if (!isRepoStatus(raw)) {
        toast({
          type: "error",
          body: "Received an unexpected response from the backend.",
          isAutoHide: false,
        });
        return;
      }
      setStatus(raw);
    } catch (e) {
      toast({
        type: "error",
        body: `Failed to read repo status: ${stringifyError(e)}`,
        isAutoHide: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickFolder = async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (typeof selected === "string" && selected.length > 0) {
        await runStatus(selected);
      }
    } catch (e) {
      toast({
        type: "error",
        body: `Failed to open folder picker: ${stringifyError(e)}`,
        isAutoHide: false,
      });
    }
  };

  const refresh = () => {
    if (status && !isLoading) {
      void runStatus(status.path);
    }
  };

  return (
    <VStack gap={4} className="p-6 w-full h-full">
      <VStack gap={1} className="w-full">
        <Heading level={1}>Git</Heading>
        <Text type="body" color="secondary">
          Pick a local repository to inspect its working-tree status.
        </Text>
      </VStack>

      <Card className="w-full h-full min-h-0 flex flex-col">
        <Toolbar
          label="Repo actions"
          size="md"
          dividers={["bottom"]}
          startContent={
            <div className="inline-flex items-center gap-2">
              <Heading level={3}>Repository</Heading>
              {status && (
                <span className="text-xs opacity-70 inline-flex items-center gap-1">
                  <GitBranch size={12} aria-hidden />
                  {status.branch ?? "detached"}
                </span>
              )}
            </div>
          }
          endContent={
            <div className="inline-flex items-center gap-2">
              <Button
                label="Pick folder"
                variant="primary"
                icon={<Icon icon={FolderOpen} />}
                onClick={pickFolder}
              />
              <Button
                label="Refresh"
                variant="secondary"
                icon={<Icon icon={RefreshCw} />}
                onClick={refresh}
                isDisabled={!status || isLoading}
              />
            </div>
          }
        />

        <div className="flex-1 min-h-0 overflow-auto">
          {!status ? (
            <EmptyState>
              <Icon icon={FolderOpen} size="lg" />
              <Text type="body">No repository selected.</Text>
              <Text type="supporting" color="secondary">
                Click <strong>Pick folder</strong> to choose a directory.
              </Text>
            </EmptyState>
          ) : status.error ? (
            <EmptyState>
              <Icon icon={AlertCircle} size="lg" className="text-red-500" />
              <Text type="body" className="text-red-500">
                {status.error}
              </Text>
              <Text type="supporting" color="secondary">
                Path: <code>{status.path}</code>
              </Text>
            </EmptyState>
          ) : status.is_clean ? (
            <EmptyState>
              <Icon icon={CircleCheck} size="lg" className="text-green-500" />
              <Text type="body">Working tree clean.</Text>
              <Text type="supporting" color="secondary">
                Nothing to commit on <code>{status.branch ?? "(detached HEAD)"}</code>.
              </Text>
            </EmptyState>
          ) : (
            <ul className="divide-y divide-default">
              {status.entries.map((entry, idx) => (
                <li
                  key={`${entry.code}-${entry.path}-${idx}`}
                  className="px-4 py-2 flex items-center gap-3 text-sm"
                >
                  <code
                    className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{
                      backgroundColor: "var(--color-background-muted)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {entry.code}
                  </code>
                  <span className="truncate flex-1" title={entry.path}>
                    {entry.path}
                  </span>
                  <span className="text-xs opacity-70">{describeCode(entry.code)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </VStack>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
      {children}
    </div>
  );
}

export default GitPage;
