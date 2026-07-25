import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { keccak256, toUtf8Bytes } from "ethers";
import { useState } from "react";

import { Badge, Button, Field, Input, Panel, Select, Stat } from "@/components/kit";
import {
  CHAIR_STATUS,
  EFFORT_STATUS,
  PARTICIPANT_ROLES,
  SEAT_TYPES,
  VSM_SYSTEMS,
  explorerAddress,
  formatTimestamp,
  shortAddress,
} from "@/lib/councilos";
import { useProductDetail } from "@/lib/council-data";
import { effortTone } from "@/routes/index";
import { useTx } from "@/lib/tx";
import { useWallet } from "@/lib/wallet";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Council #${params.id} — CouncilOS` },
      {
        name: "description",
        content:
          "Council status: founder ownership, the eight fractional leadership seats, assigned executors and the verified effort ledger.",
      },
      { property: "og:title", content: `Council #${params.id} — CouncilOS` },
      {
        property: "og:description",
        content: "Seats, executors and Proof of Effort status for this StudioOS product council.",
      },
    ],
  }),
  component: ProductPage,
});

const DAY = 86_400;

function ProductPage() {
  const { id } = Route.useParams();
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) throw notFound();

  const { account, onMonad } = useWallet();
  const { data, isLoading, error } = useProductDetail(productId);
  const { send, pending } = useTx();

  const [nomSeat, setNomSeat] = useState("0");
  const [nominee, setNominee] = useState("");
  const [appointSeat, setAppointSeat] = useState("0");
  const [fractional, setFractional] = useState("");
  const [termDays, setTermDays] = useState("180");
  const [executor, setExecutor] = useState("");
  const [effortSeat, setEffortSeat] = useState("0");
  const [vsm, setVsm] = useState("0");
  const [effortRef, setEffortRef] = useState("");
  const [effortURI, setEffortURI] = useState("");

  const me = account?.toLowerCase();
  const isDirector = Boolean(me) && data?.director.toLowerCase() === me;
  const isFounder = Boolean(me) && data?.product.founder.toLowerCase() === me;
  const canNominate = isDirector || isFounder || Boolean(data?.isChair);
  const busy = pending !== null || !onMonad;

  const activeSeats = data?.chairs.filter((c) => c.status === 2).length ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <Link to="/" className="label-mono hover:text-primary">
        ← Console
      </Link>

      {isLoading && <p className="mt-6 label-mono">Loading council…</p>}
      {error && (
        <Panel className="mt-6 border-destructive/40" title="Read error">
          <p className="font-mono text-xs text-destructive">{(error as Error).message}</p>
        </Panel>
      )}

      {data && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{data.product.name}</h1>
            <Badge tone={data.product.active ? "success" : "danger"}>
              {data.product.active ? "active" : "paused"}
            </Badge>
            {isDirector && <Badge tone="primary">you are director</Badge>}
            {isFounder && <Badge tone="primary">you are founder</Badge>}
            {data.isChair && <Badge tone="accent">you hold a chair</Badge>}
            {data.isExecutor && <Badge tone="accent">you are an executor</Badge>}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Founder"
              value={
                <a
                  href={explorerAddress(data.product.founder)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  {shortAddress(data.product.founder)}
                </a>
              }
            />
            <Stat label="Seats filled" value={`${activeSeats}/8`} />
            <Stat
              label="Executors"
              value={data.executors.filter((e) => e.active).length}
            />
            <Stat
              label="Accepted efforts"
              value={`${data.efforts.filter((e) => e.status === 2).length}/${data.efforts.length}`}
            />
          </div>

          {data.product.metadataURI && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              metadata: {data.product.metadataURI} · defined {formatTimestamp(data.product.definedAt)}
            </p>
          )}

          {isDirector && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void send(
                    data.product.active ? "Pause product" : "Activate product",
                    (c) =>
                      data.product.active
                        ? c.pauseProduct(productId)
                        : c.activateProduct(productId),
                  )
                }
              >
                {data.product.active ? "Pause product" : "Activate product"}
              </Button>
            </div>
          )}

          {/* Council seats */}
          <Panel
            className="mt-6"
            title="Council seats"
            subtitle="Eight fractional leadership chairs · 1% revenue share each."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.chairs.map((chair) => {
                const seatNoms = data.nominations
                  .filter((n) => n.seatIndex === chair.seatIndex)
                  .map((n) => n.nominee);
                return (
                  <div
                    key={chair.seatIndex}
                    className="rounded-md border border-border bg-surface-2/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="label-mono">Seat {chair.seatIndex}</span>
                      <Badge tone={chair.status === 2 ? "success" : "neutral"}>
                        {CHAIR_STATUS[chair.status]}
                      </Badge>
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                      {SEAT_TYPES[chair.seatIndex]}
                    </h3>
                    <p className="mt-2 font-mono text-xs text-foreground">
                      {shortAddress(chair.participant)}
                    </p>
                    {chair.status === 2 && (
                      <p className="label-mono mt-1">
                        term ends {formatTimestamp(chair.endDate)}
                      </p>
                    )}
                    {seatNoms.length > 0 && chair.status !== 2 && (
                      <p className="label-mono mt-2">
                        nominated: {seatNoms.map((n) => shortAddress(n)).join(", ")}
                      </p>
                    )}
                    {(isDirector || isFounder) && chair.status === 2 && (
                      <Button
                        variant="danger"
                        className="mt-3 w-full"
                        disabled={busy}
                        onClick={() =>
                          void send("Remove chair", (c) => c.removeChair(productId, chair.seatIndex))
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Panel title="Nominate fractional" subtitle="Director, Founder or an active chair.">
              <div className="flex flex-col gap-3">
                <Field label="Seat">
                  <Select value={nomSeat} onChange={(e) => setNomSeat(e.target.value)}>
                    {SEAT_TYPES.map((seat, i) => (
                      <option key={seat} value={i}>
                        {i} · {seat}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Nominee address">
                  <Input value={nominee} onChange={(e) => setNominee(e.target.value)} placeholder="0x…" />
                </Field>
                <Button
                  disabled={busy || !canNominate || !nominee}
                  onClick={() =>
                    void send("Nominate chair", (c) =>
                      c.nominateChair(productId, Number(nomSeat), nominee),
                    ).then((ok) => ok && setNominee(""))
                  }
                >
                  Nominate
                </Button>
              </div>
            </Panel>

            <Panel title="Appoint fractional" subtitle="Founder only. Requires a peer nomination.">
              <div className="flex flex-col gap-3">
                <Field label="Seat">
                  <Select value={appointSeat} onChange={(e) => setAppointSeat(e.target.value)}>
                    {SEAT_TYPES.map((seat, i) => (
                      <option key={seat} value={i}>
                        {i} · {seat}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fractional address">
                  <Input
                    value={fractional}
                    onChange={(e) => setFractional(e.target.value)}
                    placeholder="0x…"
                  />
                </Field>
                <Field label="Term length (days)">
                  <Input
                    type="number"
                    value={termDays}
                    onChange={(e) => setTermDays(e.target.value)}
                  />
                </Field>
                <Button
                  disabled={busy || !isFounder || !fractional}
                  onClick={() => {
                    const start = Math.floor(Date.now() / 1000);
                    const end = start + Math.max(1, Number(termDays || 1)) * DAY;
                    void send("Appoint fractional chair", (c) =>
                      c.appointFractionalChair(
                        productId,
                        Number(appointSeat),
                        fractional,
                        start,
                        end,
                      ),
                    ).then((ok) => ok && setFractional(""));
                  }}
                >
                  Appoint
                </Button>
              </div>
            </Panel>

            <Panel title="Executors" subtitle="Founder assigns who may deliver scoped Efforts.">
              <div className="flex flex-col gap-3">
                <Field label="Executor address">
                  <Input
                    value={executor}
                    onChange={(e) => setExecutor(e.target.value)}
                    placeholder="0x…"
                  />
                </Field>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={busy || !isFounder || !executor}
                    onClick={() =>
                      void send("Assign executor", (c) =>
                        c.assignExecutor(productId, executor, true),
                      ).then((ok) => ok && setExecutor(""))
                    }
                  >
                    Assign
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    disabled={busy || !isFounder || !executor}
                    onClick={() =>
                      void send("Revoke executor", (c) =>
                        c.assignExecutor(productId, executor, false),
                      ).then((ok) => ok && setExecutor(""))
                    }
                  >
                    Revoke
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {data.executors.length === 0 && (
                    <p className="label-mono">No executors assigned yet.</p>
                  )}
                  {data.executors.map((e) => (
                    <div
                      key={e.address}
                      className="flex items-center justify-between rounded border border-border bg-surface-2/40 px-3 py-2"
                    >
                      <span className="font-mono text-xs">{shortAddress(e.address)}</span>
                      <Badge tone={e.active ? "success" : "neutral"}>
                        {e.active ? "active" : "revoked"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* Submit effort */}
          <Panel
            className="mt-6"
            title="Submit Effort"
            subtitle="Founder, seated Fractional or assigned Executor. The reference is hashed on-chain."
          >
            <div className="grid gap-3 lg:grid-cols-4">
              <Field label="VSM system">
                <Select value={vsm} onChange={(e) => setVsm(e.target.value)}>
                  {VSM_SYSTEMS.map((s, i) => (
                    <option key={s} value={i}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Effort reference (hashed)">
                <Input
                  value={effortRef}
                  onChange={(e) => setEffortRef(e.target.value)}
                  placeholder="commit sha / deliverable id"
                />
              </Field>
              <Field label="Metadata URI">
                <Input
                  value={effortURI}
                  onChange={(e) => setEffortURI(e.target.value)}
                  placeholder="ipfs://…"
                />
              </Field>
              <Field label="Seat (fractional only)">
                <Select value={effortSeat} onChange={(e) => setEffortSeat(e.target.value)}>
                  {SEAT_TYPES.map((seat, i) => (
                    <option key={seat} value={i}>
                      {i} · {seat}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                disabled={busy || !isFounder || !effortRef}
                onClick={() =>
                  void send("Submit founder effort", (c) =>
                    c.submitFounderEffort(
                      productId,
                      Number(vsm),
                      keccak256(toUtf8Bytes(effortRef)),
                      effortURI,
                    ),
                  ).then((ok) => ok && setEffortRef(""))
                }
              >
                As Founder
              </Button>
              <Button
                variant="outline"
                disabled={busy || !data.isChair || !effortRef}
                onClick={() =>
                  void send("Submit fractional effort", (c) =>
                    c.submitFractionalEffort(
                      productId,
                      Number(effortSeat),
                      Number(vsm),
                      keccak256(toUtf8Bytes(effortRef)),
                      effortURI,
                    ),
                  ).then((ok) => ok && setEffortRef(""))
                }
              >
                As Fractional
              </Button>
              <Button
                variant="outline"
                disabled={busy || !data.isExecutor || !effortRef}
                onClick={() =>
                  void send("Submit executor effort", (c) =>
                    c.submitExecutorEffort(
                      productId,
                      Number(vsm),
                      keccak256(toUtf8Bytes(effortRef)),
                      effortURI,
                    ),
                  ).then((ok) => ok && setEffortRef(""))
                }
              >
                As Executor
              </Button>
            </div>
          </Panel>

          {/* Effort ledger */}
          <Panel
            className="mt-6"
            title="Effort status"
            subtitle="Peers verify · the Founder accepts what is useful to the product."
          >
            {data.efforts.length === 0 && <p className="label-mono">No efforts yet.</p>}
            <div className="flex flex-col gap-3">
              {data.efforts
                .slice()
                .reverse()
                .map((effort) => (
                  <div
                    key={effort.id}
                    className="rounded-md border border-border bg-surface-2/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        E-{effort.id.toString().padStart(3, "0")}
                      </span>
                      <Badge tone="neutral">{PARTICIPANT_ROLES[effort.role]}</Badge>
                      {effort.seatIndex < 8 && (
                        <Badge tone="accent">{SEAT_TYPES[effort.seatIndex]}</Badge>
                      )}
                      <Badge tone="neutral">{VSM_SYSTEMS[effort.vsmSystem]}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {shortAddress(effort.submittedBy)} · {formatTimestamp(effort.submittedAt)}
                      </span>
                      <Badge tone={effortTone(effort.status)} className="ml-auto">
                        {EFFORT_STATUS[effort.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">
                      hash {effort.effortHash}
                      {effort.metadataURI ? ` · ${effort.metadataURI}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="label-mono">{effort.peerVotes} peer verification(s)</span>
                      <Button
                        variant="outline"
                        disabled={
                          busy ||
                          !data.isChair ||
                          effort.submittedBy.toLowerCase() === me ||
                          effort.status > 1
                        }
                        onClick={() => void send("Verify effort", (c) => c.verifyEffort(effort.id))}
                      >
                        Peer verify
                      </Button>
                      <Button
                        disabled={busy || !isFounder || effort.peerVotes < 1 || effort.status > 1}
                        onClick={() => void send("Accept effort", (c) => c.acceptEffort(effort.id))}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        disabled={busy || !isFounder || effort.status > 2}
                        onClick={() =>
                          void send("Reject effort", (c) => c.rejectEffort(effort.id, ""))
                        }
                      >
                        Reject
                      </Button>
                      {isDirector && (
                        <Button
                          variant="ghost"
                          disabled={busy}
                          onClick={() =>
                            void send("Revoke effort", (c) => c.revokeEffort(effort.id, ""))
                          }
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Panel>
        </>
      )}
    </main>
  );
}
