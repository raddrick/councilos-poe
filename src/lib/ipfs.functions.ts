import { createServerFn } from "@tanstack/react-start";

export const pinJsonToIpfs = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (typeof input !== "object" || input === null) throw new Error("Invalid input");
    const { name, payload } = input as { name?: unknown; payload?: unknown };
    if (typeof name !== "string" || name.length === 0) throw new Error("Name is required");
    return { name, payload };
  })
  .handler(async ({ data }) => {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      throw new Error(
        "PINATA_JWT is not configured. Add your Pinata JWT secret to publish JSON blobs to IPFS.",
      );
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        pinataMetadata: { name: data.name },
        pinataContent: data.payload,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pinata error ${response.status}: ${text}`);
    }

    const json = (await response.json()) as { IpfsHash: string; PinSize: number };
    return {
      uri: `ipfs://${json.IpfsHash}`,
      hash: json.IpfsHash,
      size: json.PinSize,
    };
  });
