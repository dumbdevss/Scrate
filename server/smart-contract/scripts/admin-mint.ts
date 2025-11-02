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
  const contractAddress = "<your-contract-address>";
  const contract = HederaIPNft.attach(contractAddress);

  console.log("🎨 Admin minting NFT...");
  console.log("Admin:", deployer.address);

  // Mint a token using the safeMint function (admin only)
  const recipient = deployer.address; // or specify another address
  const title = "Admin Minted NFT";
  const ipType = "Administrative";

  const mintTx = await contract.safeMint(recipient, title, ipType);
  const receipt = await mintTx.wait();
  console.log("✅ Admin mint transaction completed");

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
    console.log("🎉 Admin minted token ID:", tokenId.toString());
  }

  // Check the balance
  const balance = await contract.balanceOf(recipient);
  console.log("💰 Recipient balance:", balance.toString(), "NFTs");
}

main().catch(console.error);
