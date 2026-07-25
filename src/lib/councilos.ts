export const MONAD_TESTNET = {
  chainIdHex: "0x279f", // 10143
  chainId: 10143,
  chainName: "Monad Testnet",
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
};

export const DEFAULT_CONTRACT_ADDRESS =
  (import.meta.env.VITE_COUNCILOS_ADDRESS as string | undefined) ?? "";

export const ADDRESS_STORAGE_KEY = "councilos.contract.address";

export const COUNCILOS_ABI = [
  "function director() view returns (address)",
  "function nextProductId() view returns (uint256)",
  "function nextEffortId() view returns (uint256)",
  "function products(uint256) view returns (uint256 id, string name, string metadataURI, address founder, address definedByDirector, uint256 definedAt, bool active)",
  "function chairs(uint256, uint8) view returns (address participant, uint8 seatType, uint256 revenueShareBps, uint256 startDate, uint256 endDate, uint8 status)",
  "function peerNominated(uint256, uint8, address) view returns (bool)",
  "function assignedExecutors(uint256, address) view returns (bool)",
  "function effortVerifiedBy(uint256, uint256, address) view returns (bool)",
  "function eligibleRevenueByProductYear(uint256, uint256) view returns (uint256)",
  "function isActiveChair(uint256, address) view returns (bool)",
  "function getEffort(uint256) view returns (tuple(uint256 id, uint256 productId, address submittedBy, uint8 role, uint8 seatIndex, uint8 vsmSystem, bytes32 effortHash, string metadataURI, uint256 submittedAt, uint256 peerVotes, bool founderAccepted, uint8 status))",
  "function calculateAllPayouts(uint256, uint256) view returns (address[8], uint256[8])",
  "function transferDirector(address)",
  "function defineFounderProduct(string name, string metadataURI, address founder) returns (uint256)",
  "function updateFounder(uint256, address)",
  "function pauseProduct(uint256)",
  "function activateProduct(uint256)",
  "function nominateChair(uint256, uint8, address)",
  "function appointFractionalChair(uint256, uint8, address, uint256 startDate, uint256 endDate)",
  "function removeChair(uint256, uint8)",
  "function assignExecutor(uint256, address, bool)",
  "function submitFractionalEffort(uint256, uint8 seatType, uint8 vsmSystem, bytes32 effortHash, string metadataURI) returns (uint256)",
  "function submitExecutorEffort(uint256, uint8 vsmSystem, bytes32 effortHash, string metadataURI) returns (uint256)",
  "function submitFounderEffort(uint256, uint8 vsmSystem, bytes32 effortHash, string metadataURI) returns (uint256)",
  "function verifyEffort(uint256)",
  "function acceptEffort(uint256)",
  "function rejectEffort(uint256, string reasonURI)",
  "function revokeEffort(uint256, string reasonURI)",
  "function setEligibleRevenue(uint256, uint256 year, uint256 amount)",
  "event FounderProductDefined(uint256 indexed productId, string name, address indexed founder, address indexed director, string metadataURI)",
  "event ChairNominated(uint256 indexed productId, uint8 indexed seatType, address indexed nominee, address nominator)",
  "event ChairAppointed(uint256 indexed productId, uint8 indexed seatType, address indexed fractional, address appointedBy, uint256 startDate, uint256 endDate, uint256 revenueShareBps)",
  "event ExecutorAssigned(uint256 indexed productId, address indexed executor, bool active, address assignedBy)",
  "event EffortSubmitted(uint256 indexed effortId, uint256 indexed productId, address indexed submittedBy, uint8 role, uint8 seatIndex, uint8 vsmSystem, bytes32 effortHash, string metadataURI)",
] as const;

export const SEAT_TYPES = [
  "Strategy",
  "Product",
  "Technology",
  "Marketing",
  "Operations",
  "Finance",
  "Legal",
  "Customer",
] as const;

export const VSM_SYSTEMS = [
  "S1 · Operations",
  "S2 · Coordination",
  "S3 · Governance",
  "S3* · Audit",
  "S4 · Intelligence",
  "S5 · Identity",
] as const;

export const CHAIR_STATUS = ["None", "Nominated", "Active", "Removed"] as const;

export const EFFORT_STATUS = [
  "Submitted",
  "Peer Verified",
  "Founder Accepted",
  "Rejected",
  "Disputed",
  "Revoked",
] as const;

export const PARTICIPANT_ROLES = ["Founder", "Fractional", "Executor"] as const;

export const NO_SEAT = 255;

export function shortAddress(address?: string | null) {
  if (!address) return "—";
  if (address === "0x0000000000000000000000000000000000000000") return "unassigned";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function explorerAddress(address: string) {
  return `${MONAD_TESTNET.blockExplorerUrls[0]}/address/${address}`;
}

export function explorerTx(hash: string) {
  return `${MONAD_TESTNET.blockExplorerUrls[0]}/tx/${hash}`;
}

export function formatTimestamp(seconds: bigint | number) {
  const n = Number(seconds);
  if (!n) return "—";
  return new Date(n * 1000).toLocaleString();
}
