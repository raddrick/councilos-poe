# CouncilOS: Proof of Effort for StudioOS Product Councils

A Monad/EVM package for testing the StudioOS Product Council model.

## Correct StudioOS authority model

CouncilOS follows the StudioOS design language:

```txt
Director
→ Founder
→ Fractionals
→ Executors
```

Important correction:

```txt
The Director does not create or own the product.
The Director defines the product record and Founder at the same time.
The Founder owns the product and the council from genesis.
```

## What this proves

The contract lets you run a Product Council where:

- the **Director** defines a founder-owned product record and provides governance/audit
- the **Founder** owns the product council and accepts useful Efforts
- **Fractionals** hold one of eight council chairs
- **Executors** can be assigned to deliver scoped Efforts
- Efforts are submitted with VSM mappings
- another active chair peer-verifies the Effort
- the Founder accepts the Effort
- eligible annual revenue can be recorded
- each active chair can calculate a 1% participation amount

## Core flow

```txt
Director defines Founder + Product
→ Founder owns Product Council
→ Founder nominates / appoints Fractional chairs
→ Founder assigns Executors
→ Fractional or Executor submits Effort
→ another active chair peer-verifies
→ Founder accepts
→ Effort becomes accepted contribution evidence
→ eligible revenue produces 1% chair payout math
```

## Contract

`contracts/CouncilOS.sol`

### Main product function

```solidity
defineFounderProduct(string name, string metadataURI, address founder)
```

This replaces the older `createProduct` language.

### Seats

```txt
Strategy
Product
Technology
Marketing
Operations
Finance
Legal
Customer
```

### VSM systems

```txt
S1 Operations
S2 Coordination
S3 Governance
S3 Audit
S4 Intelligence
S5 Identity
```

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Compile

```bash
npm run compile
```

### 3. Run tests

```bash
npm test
```

### 4. Run the in-memory test rig

This deploys to Hardhat's ephemeral network and simulates the whole flow.

```bash
npm run rig:hardhat
```

## Local node test rig

Open terminal 1:

```bash
npm run node
```

Open terminal 2:

```bash
npm run deploy:local
npm run rig:local
```

The rig will:

1. deploy CouncilOS
2. define ClickStudio Pro with Founder at the same time
3. confirm Founder owns the product record
4. Founder nominates and appoints a Strategy Chair
5. active chair nominates another Fractional
6. Founder appoints Marketing Chair
7. Founder assigns an Executor
8. Marketing Chair submits a VSM Effort
9. Strategy Chair peer-verifies it
10. Founder accepts it
11. Executor submits a delivery Effort
12. Marketing Chair peer-verifies it
13. Founder accepts it
14. Founder records CA$1,000,000 eligible annual revenue
15. contract calculates CA$10,000 payout for a 1% chair
16. contract calculates CA$80,000 as the full 8-seat pool

## Monad testnet setup

Create a `.env` file:

```bash
cp .env.example .env
```

Set:

```bash
MONAD_RPC_URL=https://testnet-rpc.monad.xyz/
PRIVATE_KEY=0xYOUR_BURNER_PRIVATE_KEY
```

Deploy:

```bash
npm run deploy:monad
```

Run the rig on Monad:

```bash
npm run rig:monad
```

## Notes

- Use a burner wallet.
- Keep real strategy, private docs, customer data, and product details off-chain.
- The contract stores hashes and metadata URIs only.
- For a hackathon, `metadataURI` can point to mock `ipfs://...` strings or a simple JSON file.
- `eligibleRevenue` is just an integer for demo math. Use whatever unit your app layer defines.

## Demo script

```txt
CouncilOS is Proof of Effort for StudioOS Product Councils.

The Director defines the Founder and Product together. The Founder owns the product council from genesis. Fractionals hold one of eight leadership chairs. Executors deliver scoped Efforts. Every Effort maps to a VSM system, gets peer-verified by another chair, and then founder-accepted as useful to the product.

Once eligible revenue is recorded, the contract can calculate each active chair's 1% participation.

This is an on-chain trust rail for role stewardship, contribution evidence, and Product Council economics.
```
