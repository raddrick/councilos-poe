import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Badge, Button, Input } from "@/components/kit";
import { shortAddress } from "@/lib/councilos";
import { useWallet } from "@/lib/wallet";

export function WalletBar() {
  const {
    account,
    connect,
    connecting,
    hasWallet,
    onMonad,
    switchToMonad,
    contractAddress,
    setContractAddress,
  } = useWallet();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(contractAddress);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded border border-primary/50 bg-primary/10 font-mono text-[11px] text-primary">
            C
          </span>
          <span className="font-mono text-sm tracking-[0.18em] text-foreground uppercase">
            Council<span className="text-primary">OS</span>
          </span>
        </Link>

        <span className="label-mono hidden sm:inline">Proof of Effort</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="0x… CouncilOS address"
                className="w-[22rem] max-w-[60vw] py-1.5 text-xs"
              />
              <Button
                onClick={() => {
                  setContractAddress(draft);
                  setEditing(false);
                }}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              {contractAddress ? `Contract ${shortAddress(contractAddress)}` : "Set contract"}
            </Button>
          )}

          {account && !onMonad && (
            <Button variant="danger" onClick={() => void switchToMonad()}>
              Switch to Monad
            </Button>
          )}

          {account ? (
            <Badge tone="primary" className="px-3 py-2">
              {shortAddress(account)}
            </Badge>
          ) : (
            <Button onClick={() => void connect()} disabled={connecting}>
              {connecting ? "Connecting…" : hasWallet ? "Connect MetaMask" : "Install MetaMask"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
