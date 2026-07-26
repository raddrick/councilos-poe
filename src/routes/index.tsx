import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Badge, Button, Field, Input, Panel, Stat } from "@/components/kit";
import { IpfsPinPanel } from "@/components/IpfsPinPanel";
import {
  EFFORT_STATUS,
  PARTICIPANT_ROLES,
  SEAT_TYPES,
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

function Console() {
  const { account, contractAddress, onMonad } = useWallet();
  const { data, isLoading, error } = useCouncilOverview();
  const { send, pending } = useTx();

  const [name, setName] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [founder, setFounder] = useState("");

  const isDirector =
    Boolean(account) && Boolean(data) && data!.director.toLowerCase() === account!.toLowerCase();

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <section className="panel grid-lines relative overflow-hidden p-8">
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">Monad Testnet · chain 10143</Badge>
            <Badge tone="accent">Hackathon MVP</Badge>
            <Badge tone="neutral">Solidity 0.8.24 · Hardhat · TypeScript</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Proof of Effort for <span className="text-primary">Venture Studio Product Councils</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SUMMARY}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="label-mono">Problem</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Founder-led products often rely on scattered advice, invisible contribution, and
                unclear ownership of who did what, when, and why it mattered. Product Councils need
                a verifiable operating trail.
              </p>
            </div>
            <div>
              <p className="label-mono">Solution</p>
              <p className="mt-1 text-sm text-muted-foreground">
                A smart contract layer for founder-owned Product Councils. Directors define the
                Founder and Product together, Founders appoint Fractional chairs, Executors can be
                assigned, Efforts are submitted with VSM mappings, peers verify work, and Founders
                accept useful contributions.
              </p>
            </div>
          </div>
        </div>
      </section>

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

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Director" value={shortAddress(data?.director)} />
        <Stat label="Products" value={data?.products.length ?? "—"} />
        <Stat label="Efforts" value={data?.efforts.length ?? "—"} />
        <Stat
          label="Your role"
          value={!account ? "guest" : isDirector ? "director" : "participant"}
        />
      </div>

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
            {!account && (
              <p className="label-mono">Connect MetaMask to sign director actions.</p>
            )}
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
              const accepted = productEfforts.filter((e) => e.status === 2).length;
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
                    <Badge tone="neutral">{accepted}/{productEfforts.length} accepted</Badge>
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
        <Panel
          title="IPFS metadata"
          subtitle="How the metadata URI works in CouncilOS."
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The contract stores a <code className="text-foreground">metadataURI</code> string for
              every product and effort. You can point it to any URL, but IPFS is the usual choice
              because the content is content-addressed.
            </p>
            <p>
              Paste a JSON blob here, click <strong>Pin to IPFS</strong>, and the console returns an{" "}
              <code className="text-foreground">ipfs://…</code> URI. Use the product metadata panel
              on the left or the effort metadata field on a council page.
            </p>
            <p className="label-mono">
              Requires a Pinata JWT secret. Add it via the secure form when prompted.
            </p>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6" title="Effort ledger" subtitle="All Proof of Effort records on-chain.">
        {data && data.efforts.length === 0 && <p className="label-mono">No efforts submitted yet.</p>}
        <div className="flex flex-col gap-2">
          {data?.efforts
            .slice()
            .reverse()
            .map((effort) => {
              const product = data.products.find((p) => p.id === effort.productId);
              return (
                <div
                  key={effort.id}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface-2/40 px-4 py-3"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    E-{effort.id.toString().padStart(3, "0")}
                  </span>
                  <Link
                    to="/product/$id"
                    params={{ id: String(effort.productId) }}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {product?.name ?? `Product ${effort.productId}`}
                  </Link>
                  <Badge tone="neutral">{PARTICIPANT_ROLES[effort.role]}</Badge>
                  {effort.seatIndex < 8 && (
                    <Badge tone="accent">{SEAT_TYPES[effort.seatIndex]}</Badge>
                  )}
                  <a
                    href={explorerAddress(effort.submittedBy)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-muted-foreground hover:text-primary"
                  >
                    {shortAddress(effort.submittedBy)}
                  </a>
                  <span className="label-mono">{effort.peerVotes} peer votes</span>
                  <Badge tone={effortTone(effort.status)} className="ml-auto">
                    {EFFORT_STATUS[effort.status]}
                  </Badge>
                </div>
              );
            })}
        </div>
      </Panel>
    </main>
  );
}
