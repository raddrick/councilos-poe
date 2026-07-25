import { useQuery } from "@tanstack/react-query";
import type { Contract } from "ethers";

import { useWallet } from "./wallet";

export interface Product {
  id: number;
  name: string;
  metadataURI: string;
  founder: string;
  definedByDirector: string;
  definedAt: number;
  active: boolean;
}

export interface Chair {
  seatIndex: number;
  participant: string;
  revenueShareBps: number;
  startDate: number;
  endDate: number;
  status: number;
}

export interface Effort {
  id: number;
  productId: number;
  submittedBy: string;
  role: number;
  seatIndex: number;
  vsmSystem: number;
  effortHash: string;
  metadataURI: string;
  submittedAt: number;
  peerVotes: number;
  founderAccepted: boolean;
  status: number;
}

async function readProduct(contract: Contract, id: number): Promise<Product | null> {
  const p = await contract.products(id);
  if (Number(p.id) === 0) return null;
  return {
    id: Number(p.id),
    name: p.name,
    metadataURI: p.metadataURI,
    founder: p.founder,
    definedByDirector: p.definedByDirector,
    definedAt: Number(p.definedAt),
    active: p.active,
  };
}

export function useCouncilOverview() {
  const { getReadContract, contractAddress, refreshKey } = useWallet();

  return useQuery({
    queryKey: ["council-overview", contractAddress, refreshKey],
    enabled: Boolean(contractAddress),
    refetchInterval: 15_000,
    queryFn: async () => {
      const contract = getReadContract();
      if (!contract) throw new Error("No contract address configured");

      const [director, nextProductId, nextEffortId] = await Promise.all([
        contract.director() as Promise<string>,
        contract.nextProductId() as Promise<bigint>,
        contract.nextEffortId() as Promise<bigint>,
      ]);

      const productIds = Array.from({ length: Number(nextProductId) - 1 }, (_, i) => i + 1);
      const products = (await Promise.all(productIds.map((id) => readProduct(contract, id)))).filter(
        (p): p is Product => p !== null,
      );

      const effortIds = Array.from({ length: Number(nextEffortId) - 1 }, (_, i) => i + 1);
      const efforts: Effort[] = await Promise.all(
        effortIds.map(async (id) => {
          const e = await contract.getEffort(id);
          return {
            id: Number(e.id),
            productId: Number(e.productId),
            submittedBy: e.submittedBy,
            role: Number(e.role),
            seatIndex: Number(e.seatIndex),
            vsmSystem: Number(e.vsmSystem),
            effortHash: e.effortHash,
            metadataURI: e.metadataURI,
            submittedAt: Number(e.submittedAt),
            peerVotes: Number(e.peerVotes),
            founderAccepted: e.founderAccepted,
            status: Number(e.status),
          };
        }),
      );

      return { director, products, efforts };
    },
  });
}

export function useProductDetail(productId: number) {
  const { getReadContract, contractAddress, refreshKey, account } = useWallet();

  return useQuery({
    queryKey: ["council-product", contractAddress, productId, account, refreshKey],
    enabled: Boolean(contractAddress) && Number.isFinite(productId) && productId > 0,
    refetchInterval: 15_000,
    queryFn: async () => {
      const contract = getReadContract();
      if (!contract) throw new Error("No contract address configured");

      const [director, product] = await Promise.all([
        contract.director() as Promise<string>,
        readProduct(contract, productId),
      ]);
      if (!product) throw new Error("Product not found");

      const chairs: Chair[] = await Promise.all(
        Array.from({ length: 8 }, async (_, seat) => {
          const c = await contract.chairs(productId, seat);
          return {
            seatIndex: seat,
            participant: c.participant,
            revenueShareBps: Number(c.revenueShareBps),
            startDate: Number(c.startDate),
            endDate: Number(c.endDate),
            status: Number(c.status),
          };
        }),
      );

      // Nominations and executors are event-sourced (no on-chain enumeration).
      let nominations: { seatIndex: number; nominee: string }[] = [];
      let executors: { address: string; active: boolean }[] = [];
      try {
        const [nomLogs, execLogs] = await Promise.all([
          contract.queryFilter(contract.filters.ChairNominated(productId), 0, "latest"),
          contract.queryFilter(contract.filters.ExecutorAssigned(productId), 0, "latest"),
        ]);
        nominations = nomLogs.map((log) => {
          const args = (log as unknown as { args: Record<string, unknown> }).args;
          return { seatIndex: Number(args.seatType), nominee: String(args.nominee) };
        });
        const execMap = new Map<string, boolean>();
        for (const log of execLogs) {
          const args = (log as unknown as { args: Record<string, unknown> }).args;
          execMap.set(String(args.executor), Boolean(args.active));
        }
        executors = [...execMap.entries()].map(([address, active]) => ({ address, active }));
      } catch {
        // RPC log range limits — degrade gracefully.
      }

      const nextEffortId = Number((await contract.nextEffortId()) as bigint);
      const efforts: Effort[] = (
        await Promise.all(
          Array.from({ length: nextEffortId - 1 }, async (_, i) => {
            const e = await contract.getEffort(i + 1);
            return {
              id: Number(e.id),
              productId: Number(e.productId),
              submittedBy: e.submittedBy,
              role: Number(e.role),
              seatIndex: Number(e.seatIndex),
              vsmSystem: Number(e.vsmSystem),
              effortHash: e.effortHash,
              metadataURI: e.metadataURI,
              submittedAt: Number(e.submittedAt),
              peerVotes: Number(e.peerVotes),
              founderAccepted: e.founderAccepted,
              status: Number(e.status),
            };
          }),
        )
      ).filter((e) => e.productId === productId);

      const isChair = account ? Boolean(await contract.isActiveChair(productId, account)) : false;
      const isExecutor = account
        ? Boolean(await contract.assignedExecutors(productId, account))
        : false;

      return { director, product, chairs, nominations, executors, efforts, isChair, isExecutor };
    },
  });
}
