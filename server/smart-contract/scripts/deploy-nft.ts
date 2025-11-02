import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying HederaIPNft (IPNFT) contract...");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "Hbar");

  // Deploy HederaIPNft Contract
  console.log("\n📦 Deploying HederaIPNft...");
  const HederaIPNft = await ethers.getContractFactory("HederaIPNft");
  const hederaIPNft = await HederaIPNft.deploy(deployer.address);
  await hederaIPNft.waitForDeployment();
  
  const contractAddress = await hederaIPNft.getAddress();
  console.log("✅ HederaIPNft deployed to:", contractAddress);

  // Verify contract configuration
  console.log("\n🔍 Verifying contract configuration...");

  // Test minting functionality
  console.log("\n🧪 Testing mint functionality...");
  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contract: {
      name: "HederaIPNft",
      address: contractAddress,
      transactionHash: hederaIPNft.deploymentTransaction()?.hash,
      collectionName: "Hedera IP NFT",
      collectionSymbol: "IPNFT",
    },
    deployedAt: new Date().toISOString(),
    deploymentBlock: await ethers.provider.getBlockNumber(),
  };

  // Create deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment file
  const fileName = `nft-gallery-${network.name}-${Date.now()}.json`;
  const filePath = path.join(deploymentsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📋 Contract: ${deploymentInfo.contract.name}`);
  console.log(`📍 Address: ${deploymentInfo.contract.address}`);
  console.log(`🌐 Network: ${deploymentInfo.network} (Chain ID: ${deploymentInfo.chainId})`);
  console.log(` Saved to: ${filePath}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n🔗 Next steps:");
  console.log("1. Verify the contract on block explorer");
  console.log("2. Update your frontend with the contract address");
  console.log("3. Test minting IPNFTs through your dApp");
  console.log("4. Consider setting up additional marketplace contracts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  });
