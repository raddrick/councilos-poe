import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, Button, Field, Input, Panel, Stat } from "@/components/kit";
import { IpfsPinPanel } from "@/components/IpfsPinPanel";
import {
  EFFORT_STATUS,
  PARTICIPANT_ROLES,
  SEAT_TYPES,
  VSM_SYSTEMS,
  explorerAddress,
  formatTimestamp,
  shortAddress,
} from "@/lib/councilos";
import { useCouncilOverview } from "@/lib/council-data";
import { useTx } from "@/lib/tx";
import { useWallet } from "@/lib/wallet";

const SUMMARY =
  "An on-chain Product Council primitive where Fractionals and Executors submit VSM-mapped Efforts, peers verify them, and Founders accept useful contribution evidence.";

const WHAT_IT_DOES = [
  "Defines founder-owned products through a Director-governed flow",
  "Creates 8-seat Product Councils",
  "Lets Founders appoint peer-nominated Fractional chairs",
  "Lets Founders assign Executors",
  "Records VSM-mapped Efforts",
  "Requires peer verification before Founder acceptance",
  "Calculates 1% chair participation from eligible revenue",
];

const DEMO_FLOW = [
  "Director defines Founder + Product",
  "Founder appoints Product Council chairs",
  "Founder assigns Executor",
  "Fractional submits Effort",
  "Peer chair verifies Effort",
  "Founder accepts Effort",
  "Founder records eligible revenue",
  "Contract calculates chair payout",
];

const FUTURE_WORK = [
  "StudioOS frontend integration",
  "IPFS metadata upload",
  "Soulbound badge credentials",
  "Contribution Memory dashboard",
  "Revenue escrow",
  "Stablecoin payout support",
  "Multi-council analytics",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CouncilOS — Proof of Effort for Product Councils" },
      { name: "description", content: SUMMARY },
      { property: "og:title", content: "CouncilOS — Proof of Effort for Product Councils" },
      { property: "og:description", content: SUMMARY },
      { property: "og:url", content: "https://councilos-poe.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://councilos-poe.lovable.app/" }],
  }),
  component: Console,
});


export function effortTone(status: number) {
  if (status === 2) return "success" as const;
  if (status === 1) return "accent" as const;
  if (status === 0) return "warning" as const;
  return "danger" as const;
}

const LEDGER_FILTERS = [
  { key: "all", label: "All" },
  { key: "0", label: "Submitted" },
  { key: "1", label: "Peer verified" },
  { key: "2", label: "Founder accepted" },
] as const;

function Console() {
  const { account, contractAddress, onMonad } = useWallet();
  const { data, isLoading, error } = useCouncilOverview();
  const { send, pending } = useTx();

  const [name, setName] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [founder, setFounder] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const isDirector =
    Boolean(account) && Boolean(data) && data!.director.toLowerCase() === account!.toLowerCase();

  const efforts = (data?.efforts ?? []).slice().reverse();
  const visibleEfforts =
    filter === "all" ? efforts : efforts.filter((e) => String(e.status) === filter);
  const accepted = efforts.filter((e) => e.status === 2).length;
  const verified = efforts.filter((e) => e.status === 1).length;
  const pendingCount = efforts.filter((e) => e.status === 0).length;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <section className="panel grid-lines relative overflow-hidden p-8">
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">Monad Testnet · chain 10143</Badge>
            <Badge tone="accent">Hackathon MVP</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            The <span className="text-primary">Effort Ledger</span> for Product Councils
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SUMMARY}</p>
        </div>
      </section>

      {!contractAddress && (
        <Panel className="mt-6 border-warning/40" title="No contract configured">
          <p className="text-sm text-muted-foreground">
            Paste your deployed CouncilOS address using <strong>Set contract</strong> in the header.
            It is stored in this browser.
          </p>
        </Panel>
      )}

      {error && (
        <Panel className="mt-6 border-destructive/40" title="Read error">
          <p className="font-mono text-xs text-destructive">{(error as Error).message}</p>
        </Panel>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total efforts" value={data?.efforts.length ?? "—"} />
        <Stat label="Accepted" value={data ? accepted : "—"} />
        <Stat label="Peer verified" value={data ? verified : "—"} />
        <Stat label="Awaiting verification" value={data ? pendingCount : "—"} />
        <Stat label="Councils" value={data?.products.length ?? "—"} />
      </div>

      {/* ================= STAR OF THE SHOW ================= */}
      <Panel
        className="mt-6 border-primary/40 shadow-[0_0_60px_-30px_var(--color-primary)]"
        title="Effort ledger"
        subtitle="Every Proof of Effort record on-chain — submitted, peer verified, founder accepted."
        actions={
          <div className="flex flex-wrap gap-1.5">
            {LEDGER_FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "primary" : "outline"}
                className="px-2.5 py-1 text-[10px]"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        }
      >
        {isLoading && <p className="label-mono">Loading chain state…</p>}
        {data && visibleEfforts.length === 0 && (
          <p className="label-mono">No efforts to show for this filter.</p>
        )}
        <div className="flex flex-col gap-2">
          {visibleEfforts.map((effort) => {
            const product = data?.products.find((p) => p.id === effort.productId);
            return (
              <article
                key={effort.id}
                className="rounded-md border border-border bg-surface-2/40 p-4 transition-colors hover:border-primary/60"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-primary">
                    E-{effort.id.toString().padStart(3, "0")}
                  </span>
                  <Link
                    to="/product/$id"
                    params={{ id: String(effort.productId) }}
                    className="text-base font-semibold text-foreground hover:text-primary"
                  >
                    {product?.name ?? `Product ${effort.productId}`}
                  </Link>
                  <Badge tone="neutral">{PARTICIPANT_ROLES[effort.role]}</Badge>
                  {effort.seatIndex < 8 && (
                    <Badge tone="accent">{SEAT_TYPES[effort.seatIndex]}</Badge>
                  )}
                  <Badge tone="primary">{VSM_SYSTEMS[effort.vsmSystem]}</Badge>
                  <Badge tone={effortTone(effort.status)} className="ml-auto">
                    {EFFORT_STATUS[effort.status]}
                  </Badge>
                </div>
                <dl className="mt-3 grid gap-2 sm:grid-cols-4">
                  <div>
                    <dt className="label-mono">Submitted by</dt>
                    <dd>
                      <a
                        href={explorerAddress(effort.submittedBy)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-foreground hover:text-primary"
                      >
                        {shortAddress(effort.submittedBy)}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="label-mono">Submitted at</dt>
                    <dd className="font-mono text-xs text-foreground">
                      {formatTimestamp(effort.submittedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-mono">Peer votes</dt>
                    <dd className="font-mono text-xs text-foreground">{effort.peerVotes}</dd>
                  </div>
                  <div>
                    <dt className="label-mono">Evidence</dt>
                    <dd className="truncate font-mono text-xs text-foreground">
                      {effort.metadataURI || "—"}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel
          title="Define Founder + Product"
          subtitle="Director only. Creates the product record and hands ownership to the Founder at genesis."
        >
          <div className="flex flex-col gap-3">
            <Field label="Product name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ClickStudio"
              />
            </Field>
            <Field label="Metadata URI">
              <Input
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="ipfs://…"
              />
            </Field>
            <Field label="Founder address">
              <Input
                value={founder}
                onChange={(e) => setFounder(e.target.value)}
                placeholder="0x…"
              />
            </Field>
            <Button
              disabled={!isDirector || !onMonad || !name || !founder || pending !== null}
              onClick={() =>
                void send("Define founder + product", (c) =>
                  c.defineFounderProduct(name, metadataURI, founder),
                ).then((ok) => {
                  if (ok) {
                    setName("");
                    setMetadataURI("");
                    setFounder("");
                  }
                })
              }
            >
              Define product
            </Button>
            {!account && <p className="label-mono">Connect MetaMask to sign director actions.</p>}
            {account && !isDirector && (
              <p className="label-mono">
                Connected wallet is not the director ({shortAddress(data?.director)}).
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Products" subtitle="Every council defined on this contract.">
          {isLoading && <p className="label-mono">Loading chain state…</p>}
          {data && data.products.length === 0 && (
            <p className="label-mono">No products defined yet.</p>
          )}
          <div className="flex flex-col gap-3">
            {data?.products.map((product) => {
              const productEfforts = data.efforts.filter((e) => e.productId === product.id);
              const acceptedCount = productEfforts.filter((e) => e.status === 2).length;
              return (
                <Link
                  key={product.id}
                  to="/product/$id"
                  params={{ id: String(product.id) }}
                  className="group rounded-md border border-border bg-surface-2/40 p-4 transition-colors hover:border-primary/60"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{product.id.toString().padStart(3, "0")}
                    </span>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                      {product.name}
                    </h3>
                    <Badge tone={product.active ? "success" : "danger"}>
                      {product.active ? "active" : "paused"}
                    </Badge>
                    <Badge tone="neutral">
                      {acceptedCount}/{productEfforts.length} accepted
                    </Badge>
                  </div>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div>
                      <dt className="label-mono">Founder</dt>
                      <dd className="font-mono text-xs text-foreground">
                        {shortAddress(product.founder)}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-mono">Defined by</dt>
                      <dd className="font-mono text-xs text-foreground">
                        {shortAddress(product.definedByDirector)}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-mono">Defined at</dt>
                      <dd className="font-mono text-xs text-foreground">
                        {formatTimestamp(product.definedAt)}
                      </dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <IpfsPinPanel
          title="Pin product metadata"
          onUse={(uri) => {
            setMetadataURI(uri);
            toast.success("Metadata URI filled in");
          }}
        />
        <Panel title="IPFS metadata" subtitle="How the metadata URI works in CouncilOS.">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The contract stores a <code className="text-foreground">metadataURI</code> string for
              every product and effort. You can point it to any URL, but IPFS is the usual choice
              because the content is content-addressed.
            </p>
            <p>
              Paste a JSON blob here, click <strong>Pin to IPFS</strong>, and the console returns an{" "}
              <code className="text-foreground">ipfs://…</code> URI.
            </p>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="What it does" subtitle="The council primitive, on-chain.">
          <ul className="flex flex-col gap-2">
            {WHAT_IT_DOES.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Why Monad" subtitle="Councils emit many small coordination events.">
          <p className="text-sm leading-relaxed text-muted-foreground">
            CouncilOS benefits from fast, low-cost EVM execution because Product Councils can create
            many small coordination events: nominations, appointments, Effort submissions, peer
            verifications, Founder acceptances, and revenue participation calculations.
          </p>
        </Panel>
      </div>

      <Panel
        className="mt-6"
        title="Council flow"
        subtitle="The full lifecycle from definition to chair payout."
      >
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_FLOW.map((step, i) => (
            <li
              key={step}
              className="rounded-md border border-border bg-surface-2/40 p-3 text-sm text-muted-foreground"
            >
              <span className="label-mono block">Step {String(i + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
      </Panel>

      <Panel className="mt-6" title="Future work" subtitle="Beyond the hackathon MVP.">
        <div className="flex flex-wrap gap-2">
          {FUTURE_WORK.map((item) => (
            <Badge key={item} tone="neutral">
              {item}
            </Badge>
          ))}
        </div>
      </Panel>
    </main>
  );
}

