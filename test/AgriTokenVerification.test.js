const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgriTokenVerification", function () {
  it("Should store and retrieve verification records", async function () {
    const Contract = await ethers.getContractFactory("AgriTokenVerification");
    const contract = await Contract.deploy();
    
    const txId = "test-tx-123";
    const hash = ethers.id("test-data");
    
    await contract.storeVerification(txId, hash);
    const record = await contract.getVerification(txId);
    
    expect(record.transactionHash).to.equal(hash);
    expect(record.transactionId).to.equal(txId);
  });

  it("Should prevent duplicate transaction IDs", async function () {
    const Contract = await ethers.getContractFactory("AgriTokenVerification");
    const contract = await Contract.deploy();
    
    const txId = "test-tx-456";
    const hash = ethers.id("test-data");
    
    await contract.storeVerification(txId, hash);
    await expect(contract.storeVerification(txId, hash)).to.be.revertedWith("Transaction already verified");
  });

  it("Should reject empty hash", async function () {
    const Contract = await ethers.getContractFactory("AgriTokenVerification");
    const contract = await Contract.deploy();
    
    await expect(contract.storeVerification("test-tx", ethers.ZeroHash)).to.be.revertedWith("Hash cannot be empty");
  });
});
