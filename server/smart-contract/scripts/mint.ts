import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "testnet"
});

async function main() {
  const [deployer] = await ethers.getSigners();

  // Get the ContractFactory of your HederaIPNft ERC-721 contract
  const HederaIPNft = await ethers.getContractFactory("HederaIPNft", deployer);

  // Connect to the deployed contract
  // (REPLACE WITH YOUR CONTRACT ADDRESS)
  const contractAddress = "0xD48d7E6Abac7AE2b9f058077F6ceD85A1a9138Bb";
  const contract = HederaIPNft.attach(contractAddress);

  // Sample IP metadata
  const ipMetadata = {
    uri: "https://example.com/metadata/1.json",
    title: "Digital Art Piece #1",
    description: "A beautiful digital artwork showcasing modern creativity",
    ipType: "Digital Art",
    tags: ["art", "digital", "creative", "nft"],
    contentHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    metadataBytes: ethers.toUtf8Bytes("{}"),
    schemaVersion: "1.0",
    externalUrl: "https://example.com/art/1",
    imageUrl: "https://example.com/images/1.png"
  };

  console.log("🎨 Minting NFT with IP metadata...");
  console.log("Minter:", deployer.address);

  // Mint an NFT with comprehensive IP metadata
  const mintTx = await contract.uploadArt(
    ipMetadata.uri,
    ipMetadata.title,
    ipMetadata.description,
    ipMetadata.ipType,
    ipMetadata.tags,
    ipMetadata.contentHash,
    ipMetadata.metadataBytes,
    ipMetadata.schemaVersion,
    ipMetadata.externalUrl,
    ipMetadata.imageUrl
  );

  const receipt = await mintTx.wait();
  console.log("✅ Mint transaction receipt:", JSON.stringify(receipt, null, 2));

  // Extract the minted token ID from events
  const mintedEvent = receipt?.logs?.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "TokenMinted";
    } catch {
      return false;
    }
  });

  if (mintedEvent) {
    const parsedEvent = contract.interface.parseLog(mintedEvent);
    const tokenId = parsedEvent?.args[0];
    console.log("🎉 Minted token ID:", tokenId.toString());

    // Verify the IP metadata
    const metadata = await contract.getIPMetadata(tokenId);
    console.log("📋 IP Metadata:", {
      title: metadata.title,
      description: metadata.description,
      ipType: metadata.ipType,
      creator: metadata.creator,
      createdAt: new Date(Number(metadata.createdAt) * 1000).toISOString(),
      tags: metadata.tags,
      contentHash: metadata.contentHash,
      isActive: metadata.isActive,
      schemaVersion: metadata.schemaVersion,
      externalUrl: metadata.externalUrl,
      imageUrl: metadata.imageUrl
    });
  }

  // Check the balance of the token
  const balance = await contract.balanceOf(deployer.address);
  console.log("💰 Balance:", balance.toString(), "NFTs");

  // Get all active posts
  const activePosts = await contract.getAllActivePosts();
  console.log("📊 Total active posts:", activePosts.length);
}

main().catch(console.error);
