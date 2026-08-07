import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Heading, Text, VStack, Card, Badge, Toolbar, Button } from "@astryxdesign/core";
import { Icon } from "@astryxdesign/core/Icon";
import { Stack } from "@astryxdesign/core/Stack";
import { useToast } from "@astryxdesign/core/Toast";
import { Cloud, RefreshCw, FolderOpen, FileText, ShieldAlert } from "lucide-react";

interface ProfileSource {
  kind: string;
  path: string;
  found: boolean;
}

interface AwsProfiles {
  profiles: string[];
  home_dir: string | null;
  sources: ProfileSource[];
}

function isProfileSource(value: unknown): value is ProfileSource {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.kind !== "string") return false;
  if (typeof v.path !== "string") return false;
  if (typeof v.found !== "boolean") return false;
  return true;
}

function isAwsProfiles(value: unknown): value is AwsProfiles {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.profiles)) return false;
  if (v.home_dir !== null && typeof v.home_dir !== "string") return false;
  if (!Array.isArray(v.sources)) return false;
  for (const s of v.sources) {
    if (!isProfileSource(s)) return false;
  }
  for (const p of v.profiles) {
    if (typeof p !== "string") return false;
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
 * AWS dashboard. Surfaces the list of profiles the user has configured
 * locally — useful as a sanity check before invoking any deeper AWS
 * commands. No credentials are ever shipped to the frontend.
 */
export function AwsPage() {
  const [profiles, setProfiles] = useState<AwsProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const load = async () => {
    setIsLoading(true);
    try {
      const raw: unknown = await invoke("aws_list_profiles");
      if (!isAwsProfiles(raw)) {
        toast({
          type: "error",
          body: "Received an unexpected response from the backend.",
          isAutoHide: false,
        });
        return;
      }
      setProfiles(raw);
    } catch (e) {
      toast({
        type: "error",
        body: `Failed to load AWS profiles: ${stringifyError(e)}`,
        isAutoHide: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack gap={4} className="p-6 w-full h-full">
      <VStack gap={1} className="w-full">
        <Stack direction="horizontal" gap={2} vAlign="center">
          <Icon icon={Cloud} size="md" />
          <Heading level={1}>AWS</Heading>
        </Stack>
        <Text type="body" color="secondary">
          Browse local AWS profiles configured via the AWS CLI.
        </Text>
      </VStack>

      <Card className="w-full h-full min-h-0 flex flex-col">
        <Toolbar
          label="AWS profile actions"
          size="md"
          dividers={["bottom"]}
          startContent={
            <Stack direction="horizontal" gap={2} vAlign="center">
              <Heading level={3}>Profiles</Heading>
              {profiles && (
                <Badge
                  variant={profiles.profiles.length > 0 ? "info" : "neutral"}
                  label={`${profiles.profiles.length}`}
                />
              )}
            </Stack>
          }
          endContent={
            <Button
              label="Refresh"
              variant="secondary"
              icon={<Icon icon={RefreshCw} />}
              onClick={load}
              isDisabled={isLoading}
            />
          }
        />

        <div className="flex-1 min-h-0 overflow-auto">
          {!profiles ? (
            <div className="p-8 text-center text-sm opacity-70">
              <div className="inline-flex items-center gap-2">
                <Icon icon={Cloud} size="sm" />
                Click Refresh to load your AWS profiles.
              </div>
            </div>
          ) : profiles.profiles.length === 0 ? (
            <EmptyState
              icon={<Icon icon={FolderOpen} size="lg" />}
              title="No AWS profiles found"
              detail={
                profiles.home_dir
                  ? `Looked under ${profiles.home_dir}/.aws`
                  : "No home directory detected"
              }
            />
          ) : (
            <ul className="divide-y divide-default">
              {profiles.profiles.map((name) => (
                <li
                  key={name}
                  className="px-4 py-2 flex items-center gap-3 text-sm"
                >
                  <Icon icon={Cloud} size="sm" />
                  <span className="font-medium">{name}</span>
                  {name === "default" && (
                    <Badge variant="success" label="default" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {profiles && (
          <div className="border-t border-default px-4 py-3 text-xs opacity-70">
            <Stack direction="horizontal" gap={3} wrap="wrap" vAlign="center">
              {profiles.sources.map((source) => (
                <Stack
                  direction="horizontal"
                  gap={1}
                  vAlign="center"
                  key={`${source.kind}-${source.path}`}
                >
                  <Icon
                    icon={source.found ? FileText : ShieldAlert}
                    size="xsm"
                    className={source.found ? "" : "text-yellow-500"}
                  />
                  <span>
                    <code>{source.kind}</code>: <code>{source.path}</code>
                    {!source.found ? " (missing)" : ""}
                  </span>
                </Stack>
              ))}
            </Stack>
          </div>
        )}
      </Card>
    </VStack>
  );
}

function EmptyState({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail?: string;
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
      {icon}
      <Text type="body">{title}</Text>
      {detail && (
        <Text type="supporting" color="secondary">
          {detail}
        </Text>
      )}
    </div>
  );
}

export default AwsPage;
