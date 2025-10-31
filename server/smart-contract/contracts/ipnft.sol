// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract HederaIPNft is ERC721 {
    struct ArtPiece {
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

    constructor() ERC721("Hedera IP NFT", "IPNFT") {
        totalPosts = 0;
    }

    function uploadArt(string memory _uri) public {
        totalPosts++;
        uint256 newId = totalPosts;
        artPieces.push(ArtPiece({
            id: newId,
            uri: _uri,
            owner: payable(msg.sender),
            maxBid: 0,
            maxBidder: payable(address(0)),
            auctionActive: false,
            sold: false,
            likes: 0,
            xCoordinate: 0,
            yCoordinate: 0,
            rotation: 0
        }));
        _safeMint(msg.sender, newId);
        emit ArtUploaded(newId, _uri);
    }

    function likeArt(uint256 _id) public {
        artPieces[_id - 1].likes++;
        emit ArtLiked(_id, msg.sender);
    }

    function toggleAuction(uint256 _id) public {
        require(ownerOf(_id) == msg.sender, "Not owner");
        artPieces[_id - 1].auctionActive = !artPieces[_id - 1].auctionActive;
        emit AuctionToggled(_id, artPieces[_id - 1].auctionActive);
    }

    function placeBid(uint256 _id) public payable {
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
        require(!artPieces[_id - 1].auctionActive, "In auction");
        require(!artPieces[_id - 1].sold, "Already sold");
        require(msg.value > 0, "Price must be greater than 0");
        address payable previousOwner = artPieces[_id - 1].owner;
        _transfer(previousOwner, msg.sender, _id);
        previousOwner.transfer(msg.value);
        artPieces[_id - 1].sold = true;
        emit ArtSold(_id, msg.sender, msg.value);
    }

    function setCoordinates(uint256 _id, uint256 _xCoordinate, uint256 _yCoordinate, uint256 _rotation) public {
        require(ownerOf(_id) == msg.sender, "Not owner");
        artPieces[_id - 1].xCoordinate = _xCoordinate;
        artPieces[_id - 1].yCoordinate = _yCoordinate;
        artPieces[_id - 1].rotation = _rotation;
        emit CoordinatesChanged(_id, _xCoordinate, _yCoordinate, _rotation);
    }

    function getAllPosts() public view returns (ArtPiece[] memory) {
        return artPieces;
    }

    function getMyArtPieces() public view returns (ArtPiece[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < artPieces.length; i++) {
            if (artPieces[i].owner == msg.sender) {
                count++;
            }
        }
        ArtPiece[] memory result = new ArtPiece[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < artPieces.length; i++) {
            if (artPieces[i].owner == msg.sender) {
                result[index] = artPieces[i];
                index++;
            }
        }
        return result;
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

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _burn(tokenId);
        artPieces[tokenId - 1].owner = payable(address(0));
        artPieces[tokenId - 1].sold = true;
    }
}