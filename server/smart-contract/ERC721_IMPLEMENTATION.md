# ERC-721 Mint & Burn Implementation with IP Metadata

This document describes the enhanced HederaIPNft contract that implements ERC-721 mint and burn functionality with comprehensive IP metadata integration while retaining marketplace features.

## Contract Features

### 🎨 Enhanced IP Metadata Structure
The contract now includes comprehensive IP metadata fields:

```solidity
struct ArtPiece {
    // Original fields
    uint256 id;
    string uri;
    address payable owner;
    uint256 maxBid;
    address payable maxBidder;
    bool auctionActive;
    bool sold;
    uint256 likes;
    uint256 xCoordinate;
    uint256 yCoordinate;
    uint256 rotation;
    
    // New IP Metadata fields
    string title;
    string description;
    string ipType;
    address creator;
    uint256 createdAt;
    string[] tags;
    string contentHash;
    bool isActive;
    bytes metadataBytes;
    string schemaVersion;
    string externalUrl;
    string imageUrl;
    bool burned;
}
```

### 🔐 Access Control
- **Ownable**: Contract owner can perform administrative functions
- **ERC721Burnable**: Token owners can burn their tokens
- **Authorization checks**: Proper access control for all operations

### 🎯 Core Functions

#### Minting Functions
1. **uploadArt()** - Enhanced public minting with full IP metadata
2. **safeMint()** - Admin-only minting function

#### Burning Functions
1. **burn()** - Enhanced burn function with proper cleanup
2. **isTokenBurned()** - Check if a token has been burned

#### IP Metadata Functions
1. **getIPMetadata()** - Retrieve comprehensive IP metadata
2. **updateIPMetadata()** - Update specific metadata fields

#### Enhanced Marketplace Functions
- All marketplace functions now check for burned tokens
- Active posts filtering excludes burned tokens
- Proper validation for all operations

### 📋 Events
```solidity
event TokenMinted(uint256 indexed tokenId, address indexed to, string title, string ipType);
event TokenBurned(uint256 indexed tokenId, address indexed owner);
event IPMetadataUpdated(uint256 indexed tokenId, string title, string description);
```

## Usage Examples

### 1. Deploy Contract
```bash
npx hardhat run scripts/deploy-nft.ts --network testnet
```

### 2. Mint NFT with IP Metadata
```bash
npx hardhat run scripts/mint.ts --network testnet
```

### 3. Admin Mint
```bash
npx hardhat run scripts/admin-mint.ts --network testnet
```

### 4. Burn NFT
```bash
npx hardhat run scripts/burn.ts --network testnet
```

## Contract Deployment

### Prerequisites
1. Configure Hardhat with Hedera testnet
2. Set up environment variables:
   ```bash
   npx hardhat keystore set HEDERA_RPC_URL
   npx hardhat keystore set HEDERA_PRIVATE_KEY
   ```

### Constructor Parameters
The contract now requires an `initialOwner` parameter:
```solidity
constructor(address initialOwner) ERC721("Hedera IP NFT", "IPNFT") Ownable(initialOwner)
```

## Key Improvements

### 🔒 Security Enhancements
- Proper authorization checks using `_isAuthorized()`
- Burned token validation in all functions
- Owner-only functions protected with `onlyOwner` modifier

### 🏪 Marketplace Integration
- Like functionality checks for burned tokens
- Auction system validates token status
- Buy/sell functions prevent operations on burned tokens

### 📊 Data Management
- `getAllActivePosts()` - Returns only active, non-burned tokens
- `getMyArtPieces()` - Filters out burned tokens
- Comprehensive metadata retrieval functions

### 🔥 Burn Functionality
- Complete cleanup of token data
- Proper event emission
- State management for burned tokens

## Migration Notes

If upgrading from the previous version:
1. The constructor now requires an `initialOwner` parameter
2. The `uploadArt` function signature has changed to accept IP metadata
3. New getter functions are available for enhanced functionality
4. All marketplace functions now validate token burn status

## Testing

The TypeScript errors in the scripts are due to outdated contract types. To resolve:
1. Compile the contract: `npx hardhat compile`
2. Generate types: `npx hardhat typechain`
3. Update script imports if necessary

## Security Considerations

1. **Access Control**: Only token owners or authorized addresses can burn tokens
2. **State Management**: Burned tokens are properly marked and excluded from operations
3. **Event Logging**: All mint and burn operations emit appropriate events
4. **Validation**: Comprehensive input validation for all functions

## Future Enhancements

1. **Batch Operations**: Implement batch minting and burning
2. **Metadata Standards**: Support for additional metadata standards
3. **Royalty System**: Implement EIP-2981 royalty standard
4. **Upgradability**: Consider proxy patterns for future upgrades
