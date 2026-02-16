// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriTokenVerification {
    struct VerificationRecord {
        bytes32 transactionHash;
        address farmerAddress;
        uint256 timestamp;
        string transactionId;
    }
    
    mapping(string => VerificationRecord) public verifications;
    mapping(string => bool) public recordExists;
    address public owner;
    
    event TransactionVerified(
        string indexed transactionId,
        bytes32 transactionHash,
        address indexed farmerAddress,
        uint256 timestamp
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    function storeVerification(
        string memory transactionId,
        bytes32 transactionHash
    ) external returns (bool) {
        require(transactionHash != bytes32(0), "Hash cannot be empty");
        require(msg.sender != address(0), "Invalid sender address");
        require(!recordExists[transactionId], "Transaction already verified");
        
        verifications[transactionId] = VerificationRecord({
            transactionHash: transactionHash,
            farmerAddress: msg.sender,
            timestamp: block.timestamp,
            transactionId: transactionId
        });
        
        recordExists[transactionId] = true;
        
        emit TransactionVerified(transactionId, transactionHash, msg.sender, block.timestamp);
        
        return true;
    }
    
    function getVerification(
        string memory transactionId
    ) external view returns (VerificationRecord memory) {
        require(recordExists[transactionId], "Verification record not found");
        return verifications[transactionId];
    }
    
    function verifyHash(
        string memory transactionId,
        bytes32 expectedHash
    ) external view returns (bool) {
        if (!recordExists[transactionId]) {
            return false;
        }
        return verifications[transactionId].transactionHash == expectedHash;
    }
}
