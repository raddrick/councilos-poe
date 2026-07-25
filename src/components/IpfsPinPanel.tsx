import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button, Field, Input, Panel, Textarea } from "@/components/kit";
import { pinJsonToIpfs } from "@/lib/ipfs.functions";

export function IpfsPinPanel({
  onUse,
  title = "Pin JSON to IPFS",
}: {
  onUse?: (uri: string) => void;
  title?: string;
}) {
  const pin = useServerFn(pinJsonToIpfs);
  const [name, setName] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [result, setResult] = useState<{ uri: string; hash: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePin = async () => {
    let payload: unknown;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      toast.error("Invalid JSON");
      return;
    }

    setBusy(true);
    try {
      const res = await pin({ data: { name, payload } });
      setResult(res);
      toast.success("Pinned to IPFS", { description: res.uri });
    } catch (error) {
      toast.error("IPFS pin failed", { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title={title} subtitle="Provide a JSON blob and get back an ipfs:// URI.">
      <div className="flex flex-col gap-3">
        <Field label="Pin name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="product-v1-metadata"
          />
        </Field>
        <Field label="JSON blob">
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{"description": "...", "roadmap": "..."}'
            rows={6}
          />
        </Field>
        <Button disabled={busy || !name || !jsonText} onClick={() => void handlePin()}>
          {busy ? "Pinning…" : "Pin to IPFS"}
        </Button>

        {result && (
          <div className="mt-2 rounded-md border border-border bg-surface-2/40 p-3">
            <p className="label-mono">URI</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="break-all font-mono text-xs text-foreground">{result.uri}</code>
              <div className="ml-auto flex shrink-0 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(result.uri);
                    toast.success("Copied URI");
                  }}
                >
                  Copy
                </Button>
                {onUse && (
                  <Button variant="outline" onClick={() => onUse(result.uri)}>
                    Use
                  </Button>
                )}
              </div>
            </div>
            <p className="label-mono mt-2">
              CID {result.hash} · {result.size} bytes
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
