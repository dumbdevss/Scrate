// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HederaIPNft is ERC721, ERC721Burnable, Ownable {
    struct ProjectDetails {
        string industry;
        string organization;
        string topic;
        string researchLeadName;
        string researchLeadEmail;
    }

    struct ArtPiece {
        uint256 id;
        string uri;
        address payable owner;
        uint256 price;           // Fixed price for direct purchase
        uint256 maxBid;
        address payable maxBidder;
        bool auctionActive;
        bool sold;
        uint256 likes;
        uint256 xCoordinate;
        uint256 yCoordinate;
        uint256 rotation;
        // IP Metadata fields
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
        string agreementPdfUrl;  // IPFS link for agreement PDF
        ProjectDetails projectDetails;
        bool burned;
    }

    ArtPiece[] public artPieces;
    mapping(uint256 => address[]) public bidders;
    uint256 public totalPosts;

    event ArtLiked(uint256 id, address liker);
    event ArtSold(uint256 id, address buyer, uint256 price);
    event ArtUploaded(uint256 id, string uri);
    event AuctionToggled(uint256 id, bool isActive);
    event BidPlaced(uint256 id, address bidder, uint256 bidAmount);
    event CoordinatesChanged(uint256 id, uint256 xCoordinate, uint256 yCoordinate, uint256 rotation);
    event TokenMinted(uint256 indexed tokenId, address indexed to, string title, string ipType);
    event TokenBurned(uint256 indexed tokenId, address indexed owner);
    event IPMetadataUpdated(uint256 indexed tokenId, string title, string description);

    constructor(address initialOwner) ERC721("Hedera IP NFT", "IPNFT") Ownable(initialOwner) {
        totalPosts = 0;
    }

    function uploadArt(
        string memory _uri,
        uint256 _price,
        string memory _title,
        string memory _description,
        string memory _ipType,
        string[] memory _tags,
        string memory _contentHash,
        bytes memory _metadataBytes,
        string memory _schemaVersion,
        string memory _externalUrl,
        string memory _imageUrl,
        string memory _agreementPdfUrl,
        string memory _industry,
        string memory _organization,
        string memory _topic,
        string memory _researchLeadName,
        string memory _researchLeadEmail
    ) public {
        totalPosts++;
        uint256 newId = totalPosts;
        artPieces.push(ArtPiece({
            id: newId,
            uri: _uri,
            owner: payable(msg.sender),
            price: _price,
            maxBid: 0,
            maxBidder: payable(address(0)),
            auctionActive: false,
            sold: false,
            likes: 0,
            xCoordinate: 0,
            yCoordinate: 0,
            rotation: 0,
            title: _title,
            description: _description,
            ipType: _ipType,
            creator: msg.sender,
            createdAt: block.timestamp,
            tags: _tags,
            contentHash: _contentHash,
            isActive: true,
            metadataBytes: _metadataBytes,
            schemaVersion: _schemaVersion,
            externalUrl: _externalUrl,
            imageUrl: _imageUrl,
            agreementPdfUrl: _agreementPdfUrl,
            projectDetails: ProjectDetails({
                industry: _industry,
                organization: _organization,
                topic: _topic,
                researchLeadName: _researchLeadName,
                researchLeadEmail: _researchLeadEmail
            }),
            burned: false
        }));
        _safeMint(msg.sender, newId);
        emit ArtUploaded(newId, _uri);
        emit TokenMinted(newId, msg.sender, _title, _ipType);
    }

    function likeArt(uint256 _id) public {
        require(_id > 0 && _id <= artPieces.length, "Invalid token ID");
        require(!artPieces[_id - 1].burned, "Cannot like burned token");
        artPieces[_id - 1].likes++;
        emit ArtLiked(_id, msg.sender);
    }

    function toggleAuction(uint256 _id) public {
        require(ownerOf(_id) == msg.sender, "Not owner");
        require(!artPieces[_id - 1].burned, "Cannot auction burned token");
        artPieces[_id - 1].auctionActive = !artPieces[_id - 1].auctionActive;
        emit AuctionToggled(_id, artPieces[_id - 1].auctionActive);
    }

    function placeBid(uint256 _id) public payable {
        require(!artPieces[_id - 1].burned, "Cannot bid on burned token");
        require(artPieces[_id - 1].auctionActive, "Auction not active");
        require(msg.value > artPieces[_id - 1].maxBid, "Bid too low");
        if (artPieces[_id - 1].maxBid > 0) {
            artPieces[_id - 1].maxBidder.transfer(artPieces[_id - 1].maxBid);
        }
        artPieces[_id - 1].maxBid = msg.value;
        artPieces[_id - 1].maxBidder = payable(msg.sender);
        bidders[_id].push(msg.sender);
        emit BidPlaced(_id, msg.sender, msg.value);
    }

    function endAuction(uint256 _id) public {
        require(ownerOf(_id) == msg.sender, "Not owner");
        require(!artPieces[_id - 1].burned, "Cannot end auction for burned token");
        require(artPieces[_id - 1].auctionActive, "Auction not active");
        artPieces[_id - 1].auctionActive = false;
        if (artPieces[_id - 1].maxBid > 0) {
            address payable previousOwner = artPieces[_id - 1].owner;
            _transfer(previousOwner, artPieces[_id - 1].maxBidder, _id);
            previousOwner.transfer(artPieces[_id - 1].maxBid);
            artPieces[_id - 1].sold = true;
            emit ArtSold(_id, artPieces[_id - 1].maxBidder, artPieces[_id - 1].maxBid);
        }
    }

    function buyArt(uint256 _id) public payable {
        require(!artPieces[_id - 1].burned, "Cannot buy burned token");
        require(!artPieces[_id - 1].auctionActive, "In auction");
        require(!artPieces[_id - 1].sold, "Already sold");
        require(artPieces[_id - 1].price > 0, "Item not for sale");
        require(msg.value >= artPieces[_id - 1].price, "Insufficient payment");
        
        address payable previousOwner = artPieces[_id - 1].owner;
        uint256 salePrice = artPieces[_id - 1].price;
        
        _transfer(previousOwner, msg.sender, _id);
        previousOwner.transfer(salePrice);
        
        // Return excess payment if any
        if (msg.value > salePrice) {
            payable(msg.sender).transfer(msg.value - salePrice);
        }
        
        artPieces[_id - 1].sold = true;
        artPieces[_id - 1].owner = payable(msg.sender);
        emit ArtSold(_id, msg.sender, salePrice);
    }

    function setCoordinates(uint256 _id, uint256 _xCoordinate, uint256 _yCoordinate, uint256 _rotation) public {
        require(ownerOf(_id) == msg.sender, "Not owner");
        require(!artPieces[_id - 1].burned, "Cannot modify burned token");
        artPieces[_id - 1].xCoordinate = _xCoordinate;
        artPieces[_id - 1].yCoordinate = _yCoordinate;
        artPieces[_id - 1].rotation = _rotation;
        emit CoordinatesChanged(_id, _xCoordinate, _yCoordinate, _rotation);
    }

    function setPrice(uint256 _id, uint256 _price) public {
        require(ownerOf(_id) == msg.sender, "Not owner");
        require(!artPieces[_id - 1].burned, "Cannot modify burned token");
        artPieces[_id - 1].price = _price;
    }

    function getPrice(uint256 _id) public view returns (uint256) {
        require(_id > 0 && _id <= artPieces.length, "Invalid token ID");
        return artPieces[_id - 1].price;
    }

    function getAllPosts() public view returns (ArtPiece[] memory) {
        return artPieces;
    }
    
    function getAllActivePosts() public view returns (ArtPiece[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < artPieces.length; i++) {
            if (!artPieces[i].burned && artPieces[i].isActive) {
                activeCount++;
            }
        }
        
        ArtPiece[] memory activePosts = new ArtPiece[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < artPieces.length; i++) {
            if (!artPieces[i].burned && artPieces[i].isActive) {
                activePosts[index] = artPieces[i];
                index++;
            }
        }
        return activePosts;
    }

    function getMyArtPieces() public view returns (ArtPiece[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < artPieces.length; i++) {
            if (artPieces[i].owner == msg.sender && !artPieces[i].burned) {
                count++;
            }
        }
        ArtPiece[] memory result = new ArtPiece[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < artPieces.length; i++) {
            if (artPieces[i].owner == msg.sender && !artPieces[i].burned) {
                result[index] = artPieces[i];
                index++;
            }
        }
        return result;
    }
    
    function getIPMetadata(uint256 tokenId) public view returns (
        string memory title,
        string memory description,
        string memory ipType,
        address creator,
        uint256 createdAt,
        string[] memory tags,
        string memory contentHash,
        bool isActive,
        string memory schemaVersion,
        string memory externalUrl,
        string memory imageUrl,
        string memory agreementPdfUrl,
        uint256 price
    ) {
        require(tokenId > 0 && tokenId <= artPieces.length, "Invalid token ID");
        ArtPiece memory piece = artPieces[tokenId - 1];
        
        return (
            piece.title,
            piece.description,
            piece.ipType,
            piece.creator,
            piece.createdAt,
            piece.tags,
            piece.contentHash,
            piece.isActive,
            piece.schemaVersion,
            piece.externalUrl,
            piece.imageUrl,
            piece.agreementPdfUrl,
            piece.price
        );
    }

    function getProjectDetails(uint256 tokenId) public view returns (
        string memory industry,
        string memory organization,
        string memory topic,
        string memory researchLeadName,
        string memory researchLeadEmail
    ) {
        require(tokenId > 0 && tokenId <= artPieces.length, "Invalid token ID");
        ProjectDetails memory details = artPieces[tokenId - 1].projectDetails;
        
        return (
            details.industry,
            details.organization,
            details.topic,
            details.researchLeadName,
            details.researchLeadEmail
        );
    }
    
    function isTokenBurned(uint256 tokenId) public view returns (bool) {
        require(tokenId > 0 && tokenId <= artPieces.length, "Invalid token ID");
        return artPieces[tokenId - 1].burned;
    }

    function getBidders(uint256 _id) public view returns (address[] memory) {
        return bidders[_id];
    }

    function getMaxBid(uint256 _id) public view returns (uint256) {
        return artPieces[_id - 1].maxBid;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        return artPieces[tokenId - 1].uri;
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // Update our custom tracking when token is transferred
        if (tokenId > 0 && tokenId <= artPieces.length) {
            artPieces[tokenId - 1].owner = payable(to);
            if (from != address(0) && to != address(0)) {
                artPieces[tokenId - 1].sold = false; // Reset sold on transfer
            }
        }
        
        return from;
    }

    function safeMint(address to, string memory _title, string memory _ipType) public onlyOwner returns (uint256) {
        totalPosts++;
        uint256 newId = totalPosts;
        
        // Create minimal art piece for admin minting
        artPieces.push(ArtPiece({
            id: newId,
            uri: "",
            owner: payable(to),
            price: 0,
            maxBid: 0,
            maxBidder: payable(address(0)),
            auctionActive: false,
            sold: false,
            likes: 0,
            xCoordinate: 0,
            yCoordinate: 0,
            rotation: 0,
            title: _title,
            description: "",
            ipType: _ipType,
            creator: to,
            createdAt: block.timestamp,
            tags: new string[](0),
            contentHash: "",
            isActive: true,
            metadataBytes: "",
            schemaVersion: "1.0",
            externalUrl: "",
            imageUrl: "",
            agreementPdfUrl: "",
            projectDetails: ProjectDetails({
                industry: "",
                organization: "",
                topic: "",
                researchLeadName: "",
                researchLeadEmail: ""
            }),
            burned: false
        }));
        
        _safeMint(to, newId);
        emit TokenMinted(newId, to, _title, _ipType);
        return newId;
    }

    function burn(uint256 tokenId) public override {
        require(_isAuthorized(_ownerOf(tokenId), msg.sender, tokenId), "Not authorized to burn");
        require(tokenId > 0 && tokenId <= artPieces.length, "Invalid token ID");
        require(!artPieces[tokenId - 1].burned, "Token already burned");
        
        address owner = ownerOf(tokenId);
        
        // Update art piece data
        artPieces[tokenId - 1].owner = payable(address(0));
        artPieces[tokenId - 1].sold = true;
        artPieces[tokenId - 1].isActive = false;
        artPieces[tokenId - 1].burned = true;
        artPieces[tokenId - 1].auctionActive = false;
        
        // Burn the token
        _burn(tokenId);
        
        emit TokenBurned(tokenId, owner);
    }

    function updateIPMetadata(
        uint256 tokenId,
        string memory _title,
        string memory _description,
        string memory _externalUrl,
        string memory _imageUrl
    ) public {
        require(_isAuthorized(_ownerOf(tokenId), msg.sender, tokenId), "Not authorized");
        require(tokenId > 0 && tokenId <= artPieces.length, "Invalid token ID");
        require(!artPieces[tokenId - 1].burned, "Token is burned");
        
        artPieces[tokenId - 1].title = _title;
        artPieces[tokenId - 1].description = _description;
        artPieces[tokenId - 1].externalUrl = _externalUrl;
        artPieces[tokenId - 1].imageUrl = _imageUrl;
        
        emit IPMetadataUpdated(tokenId, _title, _description);
    }
}