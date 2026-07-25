import type { Contract, ContractTransactionResponse } from "ethers";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { explorerTx } from "./councilos";
import { useWallet } from "./wallet";

function readableError(error: unknown) {
  const e = error as { shortMessage?: string; reason?: string; message?: string };
  return e.reason ?? e.shortMessage ?? e.message ?? "Transaction failed";
}

export function useTx() {
  const { getWriteContract, bumpRefresh } = useWallet();
  const [pending, setPending] = useState<string | null>(null);

  const send = useCallback(
    async (label: string, run: (contract: Contract) => Promise<ContractTransactionResponse>) => {
      setPending(label);
      const id = toast.loading(`${label} — confirm in MetaMask`);
      try {
        const contract = await getWriteContract();
        const tx = await run(contract);
        toast.loading(`${label} — mining…`, { id });
        const receipt = await tx.wait();
        toast.success(`${label} confirmed`, {
          id,
          description: receipt?.hash ? `tx ${receipt.hash.slice(0, 14)}…` : undefined,
          action: receipt?.hash
            ? { label: "Explorer", onClick: () => window.open(explorerTx(receipt.hash), "_blank") }
            : undefined,
        });
        bumpRefresh();
        return true;
      } catch (error) {
        toast.error(label, { id, description: readableError(error) });
        return false;
      } finally {
        setPending(null);
      }
    },
    [getWriteContract, bumpRefresh],
  );

  return { send, pending };
}
