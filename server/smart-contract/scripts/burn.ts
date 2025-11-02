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

  // Token ID to burn (replace with actual token ID)
  const tokenIdToBurn = 1;

  console.log("🔥 Burning NFT...");
  console.log("Burner:", deployer.address);
  console.log("Token ID:", tokenIdToBurn);

  // Check if token exists and is owned by the deployer
  try {
    const owner = await contract.ownerOf(tokenIdToBurn);
    console.log("Current owner:", owner);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error("❌ Error: You don't own this token");
      return;
    }

    // Check if token is already burned
    const isBurned = await contract.isTokenBurned(tokenIdToBurn);
    if (isBurned) {
      console.error("❌ Error: Token is already burned");
      return;
    }

    // Get IP metadata before burning
    console.log("📋 Getting IP metadata before burning...");
    const metadata = await contract.getIPMetadata(tokenIdToBurn);
    console.log("IP Metadata:", {
      title: metadata.title,
      description: metadata.description,
      ipType: metadata.ipType,
      creator: metadata.creator
    });

  } catch (error) {
    console.error("❌ Error checking token:", error);
    return;
  }

  // Burn the token
  const burnTx = await contract.burn(tokenIdToBurn);
  const receipt = await burnTx.wait();
  console.log("✅ Burn transaction receipt:", JSON.stringify(receipt, null, 2));

  // Extract the burned token ID from events
  const burnedEvent = receipt?.logs?.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "TokenBurned";
    } catch {
      return false;
    }
  });

  if (burnedEvent) {
    const parsedEvent = contract.interface.parseLog(burnedEvent);
    const tokenId = parsedEvent?.args[0];
    console.log("🔥 Burned token ID:", tokenId.toString());
  }

  // Verify the token is burned
  try {
    const isBurned = await contract.isTokenBurned(tokenIdToBurn);
    console.log("🔍 Token burned status:", isBurned);
    
    // This should fail since the token is burned
    try {
      await contract.ownerOf(tokenIdToBurn);
      console.log("⚠️  Warning: Token still exists after burning");
    } catch {
      console.log("✅ Confirmed: Token no longer exists");
    }
  } catch (error) {
    console.log("✅ Token successfully burned");
  }

  // Check the balance after burning
  const balance = await contract.balanceOf(deployer.address);
  console.log("💰 Updated balance:", balance.toString(), "NFTs");

  // Get all active posts (should exclude burned tokens)
  const activePosts = await contract.getAllActivePosts();
  console.log("📊 Total active posts after burn:", activePosts.length);
}

main().catch(console.error);
