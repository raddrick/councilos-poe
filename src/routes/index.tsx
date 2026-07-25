import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CouncilOS Console — Proof of Effort on Monad" },
      {
        name: "description",
        content:
          "CouncilOS is an EVM smart contract primitive for StudioOS-style venture studios. A Director defines a Founder and Product together. The Founder owns the Product",
      },
      { property: "og:title", content: "CouncilOS Console — Proof of Effort on Monad" },
      {
        property: "og:description",
        content:
          "CouncilOS is an EVM smart contract primitive for StudioOS-style venture studios. A Director defines a Founder and Product together. The Founder owns the Product",
      },
    ],
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
        <div className="relative max-w-2xl">
          <Badge tone="primary">Monad Testnet · chain 10143</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Proof of Effort for <span className="text-primary">Product Councils</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A Director defines the product and its Founder. The Founder owns the council, eight
            Fractionals steward the leadership seats, Executors deliver scoped Efforts, peers verify
            the work, and the Founder accepts what is useful to the product.
          </p>
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
