const { ethers } = require("hardhat");

async function main() {
  const AgriTokenVerification = await ethers.getContractFactory("AgriTokenVerification");
  const contract = await AgriTokenVerification.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("AgriTokenVerification deployed to:", address);
  console.log("\nUpdate your .env file with:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
