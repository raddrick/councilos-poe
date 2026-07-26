import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ADDRESS_STORAGE_KEY,
  COUNCILOS_ABI,
  DEFAULT_CONTRACT_ADDRESS,
  MONAD_TESTNET,
} from "./councilos";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: never[]) => void) => void;
  removeListener?: (event: string, handler: (...args: never[]) => void) => void;
  isMetaMask?: boolean;
};

function getInjected(): Eip1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
}

interface WalletState {
  account: string | null;
  chainId: number | null;
  hasWallet: boolean;
  connecting: boolean;
  onMonad: boolean;
  contractAddress: string;
  setContractAddress: (value: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToMonad: () => Promise<void>;
  getReadContract: () => Contract | null;
  getWriteContract: () => Promise<Contract>;
  refreshKey: number;
  bumpRefresh: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [hasWallet, setHasWallet] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [contractAddress, setContractAddressState] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (stored) {
      setContractAddressState(stored);
    } else {
      void getAppConfig()
        .then((cfg) => {
          if (cfg.contractAddress) setContractAddressState(cfg.contractAddress);
        })
        .catch(() => undefined);
    }

    const injected = getInjected();
    setHasWallet(Boolean(injected));
    if (!injected) return;


    void injected
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list.length) setAccount(list[0]);
      })
      .catch(() => undefined);

    void injected
      .request({ method: "eth_chainId" })
      .then((id) => setChainId(Number(id as string)))
      .catch(() => undefined);

    const onAccounts = (...args: never[]) => {
      const list = args[0] as unknown as string[];
      setAccount(list?.length ? list[0] : null);
    };
    const onChain = (...args: never[]) => {
      setChainId(Number(args[0] as unknown as string));
      setRefreshKey((k) => k + 1);
    };

    injected.on?.("accountsChanged", onAccounts);
    injected.on?.("chainChanged", onChain);
    return () => {
      injected.removeListener?.("accountsChanged", onAccounts);
      injected.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const setContractAddress = useCallback((value: string) => {
    const trimmed = value.trim();
    setContractAddressState(trimmed);
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, trimmed);
    setRefreshKey((k) => k + 1);
  }, []);

  const switchToMonad = useCallback(async () => {
    const injected = getInjected();
    if (!injected) throw new Error("MetaMask not detected");
    try {
      await injected.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET.chainIdHex }],
      });
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 4902 || code === -32603) {
        await injected.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MONAD_TESTNET.chainIdHex,
              chainName: MONAD_TESTNET.chainName,
              rpcUrls: MONAD_TESTNET.rpcUrls,
              blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
              nativeCurrency: MONAD_TESTNET.nativeCurrency,
            },
          ],
        });
      } else {
        throw error;
      }
    }
    setChainId(MONAD_TESTNET.chainId);
  }, []);

  const connect = useCallback(async () => {
    const injected = getInjected();
    if (!injected) {
      window.open("https://metamask.io/download/", "_blank", "noopener");
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await injected.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts[0] ?? null);
      const id = Number((await injected.request({ method: "eth_chainId" })) as string);
      setChainId(id);
      if (id !== MONAD_TESTNET.chainId) await switchToMonad();
      setRefreshKey((k) => k + 1);
    } finally {
      setConnecting(false);
    }
  }, [switchToMonad]);

  const disconnect = useCallback(() => setAccount(null), []);

  const getReadContract = useCallback(() => {
    if (!contractAddress) return null;
    const provider = new JsonRpcProvider(MONAD_TESTNET.rpcUrls[0], MONAD_TESTNET.chainId, {
      staticNetwork: true,
    });
    return new Contract(contractAddress, COUNCILOS_ABI, provider);
  }, [contractAddress]);

  const getWriteContract = useCallback(async () => {
    const injected = getInjected();
    if (!injected) throw new Error("MetaMask not detected");
    if (!contractAddress) throw new Error("Set the CouncilOS contract address first");
    const provider = new BrowserProvider(injected);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== MONAD_TESTNET.chainId) {
      throw new Error("Switch MetaMask to Monad Testnet");
    }
    const signer = await provider.getSigner();
    return new Contract(contractAddress, COUNCILOS_ABI, signer);
  }, [contractAddress]);

  const value = useMemo<WalletState>(
    () => ({
      account,
      chainId,
      hasWallet,
      connecting,
      onMonad: chainId === MONAD_TESTNET.chainId,
      contractAddress,
      setContractAddress,
      connect,
      disconnect,
      switchToMonad,
      getReadContract,
      getWriteContract,
      refreshKey,
      bumpRefresh: () => setRefreshKey((k) => k + 1),
    }),
    [
      account,
      chainId,
      hasWallet,
      connecting,
      contractAddress,
      setContractAddress,
      connect,
      disconnect,
      switchToMonad,
      getReadContract,
      getWriteContract,
      refreshKey,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
