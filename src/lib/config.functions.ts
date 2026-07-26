import { createServerFn } from "@tanstack/react-start";

export const getAppConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    contractAddress: process.env.COUNCILOS_CONTRACT_ADDRESS ?? "",
    ipfsConfigured: Boolean(process.env.PINATA_JWT),
  };
});
