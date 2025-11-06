import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useState } from "react";
import { Experience } from "./components/Experience";
import Navbar from "./components/Navbar";
import { SocketManager } from "./components/SocketManager";
import { UI, shopModeAtom } from "./components/UI";
import StoreWalls from "./components/walls/Storewalls";
import StoreWalls2 from "./components/walls/Storewalls2";
import StoreWalls3 from "./components/walls/Storewalls3";
import StoreWalls4 from "./components/walls/Storewalls4";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWalletInterface } from "./services/wallets/useWalletInterface";
import { useNFTGallery } from "./hooks/useHederaIp";
import IPNFTMarketplaceModal from "./components/IPNFTMarketplaceModal";

function App() {
  const [shopMode] = useAtom(shopModeAtom);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIPNFT, setSelectedIPNFT] = useState(null);

  const showModal = (ipnftData) => {
    console.log('Raw IP NFT data received:', ipnftData);
    
    // Convert the data to match IPNFTMarketplaceModal interface
    const modalData = {
      id: ipnftData.id?.toString() || "",
      title: ipnftData.title || "Untitled IP NFT",
      description: ipnftData.description || "",
      imageUrl: ipnftData.imageUrl || ipnftData.uri || ipnftData.image || "",
      price: ipnftData.price || "0",
      owner: ipnftData.owner || "",
      creator: ipnftData.creator || ipnftData.owner || "",
      likes: ipnftData.likes || 0,
      auctionActive: ipnftData.auctionActive || false,
      sold: ipnftData.sold || false,
      maxBid: ipnftData.maxBid || "0",
      maxBidder: ipnftData.maxBidder || "",
      network: "Hedera",
      ipType: ipnftData.ipType || "Digital Asset",
      tags: ipnftData.tags || [],
      contentHash: ipnftData.contentHash || "",
      schemaVersion: ipnftData.schemaVersion || "1.0",
      externalUrl: ipnftData.externalUrl || "",
      createdAt: ipnftData.createdAt || Date.now() / 1000,
      isActive: ipnftData.isActive !== false,
      agreementPdfUrl: ipnftData.agreementPdfUrl || "",
      // Map both nested and flattened project details structures
      industry: ipnftData.industry || ipnftData.projectDetails?.industry || "",
      organization: ipnftData.organization || ipnftData.projectDetails?.organization || "",
      topic: ipnftData.topic || ipnftData.projectDetails?.topic || "",
      researchLeadName: ipnftData.researchLeadName || ipnftData.projectDetails?.researchLeadName || "",
      researchLeadEmail: ipnftData.researchLeadEmail || ipnftData.projectDetails?.researchLeadEmail || "",
      projectDetails: ipnftData.projectDetails || {
        industry: ipnftData.industry || "",
        organization: ipnftData.organization || "",
        topic: ipnftData.topic || "",
        researchLeadName: ipnftData.researchLeadName || "",
        researchLeadEmail: ipnftData.researchLeadEmail || ""
      }
    };
    
    console.log('Processed modal data:', modalData);
    console.log('Image URL being used:', modalData.imageUrl);
    
    setSelectedIPNFT(modalData);
    setIsModalVisible(true);
  };

  

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedIPNFT(null);
  };

  const { accountId, walletInterface } = useWalletInterface();
  const {
    buyArt: contractBuyArt,
    placeBid: contractPlaceBid,
    likeArt: contractLikeArt,
    toggleAuction: contractToggleAuction,
    getBidders: contractGetBidders,
    getMaxBid: contractGetMaxBid,
    loading: contractLoading,
    fetchAllPosts
  } = useNFTGallery();


  const handleBuy = async (id) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      const result = await contractBuyArt(id, selectedIPNFT?.price || "0");
      
      if (result) {
        // Update the selected IPNFT to reflect new ownership
        setSelectedIPNFT(prev => ({
          ...prev,
          owner: accountId,
          sold: true,
          auctionActive: false
        }));
        
        toast.success("🎉 Congratulations! You now own this IP NFT!");
        
        // Close modal after a brief delay to show the success message
        setTimeout(() => {
          setIsModalVisible(false);
          setSelectedIPNFT(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error buying IP NFT:", error);
      toast.error("Error buying IP NFT");
    }
  };

  const handlePlaceBid = async (id, bidAmount) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      const result = await contractPlaceBid(id, bidAmount);
      
      if (result) {
        // Update the selected IPNFT to reflect new highest bid
        setSelectedIPNFT(prev => ({
          ...prev,
          maxBid: bidAmount,
          maxBidder: accountId
        }));
        
        toast.success("🎯 Bid placed successfully! You are now the highest bidder!");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Error placing bid");
    }
  };

  const handleToggleAuction = async (id) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      const wasAuctionActive = selectedIPNFT?.auctionActive;
      const result = await contractToggleAuction(id);
      
      if (result) {
        if (wasAuctionActive) {
          // Auction was ended - check if there was a highest bidder
          const hasMaxBidder = selectedIPNFT?.maxBidder && selectedIPNFT?.maxBidder !== "0x0000000000000000000000000000000000000000";
          
          if (hasMaxBidder) {
            // Transfer ownership to highest bidder
            setSelectedIPNFT(prev => ({
              ...prev,
              owner: prev.maxBidder,
              sold: true,
              auctionActive: false
            }));
            
            if (selectedIPNFT?.maxBidder === accountId) {
              toast.success("🎉 Congratulations! You won the auction and now own this IP NFT!");
            } else {
              toast.success(`Auction ended! IP NFT sold to ${selectedIPNFT?.maxBidder?.slice(0, 8)}...${selectedIPNFT?.maxBidder?.slice(-6)}`);
            }
          } else {
            // No bidders, auction just ended
            setSelectedIPNFT(prev => ({
              ...prev,
              auctionActive: false
            }));
            toast.success("Auction ended with no bids. IP NFT is now available for direct purchase.");
          }
        } else {
          // Auction was started
          setSelectedIPNFT(prev => ({
            ...prev,
            auctionActive: true,
            sold: false
          }));
          toast.success("🔥 Auction started! Users can now place bids on your IP NFT.");
        }
      }
    } catch (error) {
      console.error("Error toggling auction:", error);
      toast.error("Error toggling auction");
    }
  };

  const handleLike = async (id) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      await contractLikeArt(id);
    } catch (error) {
      console.error("Error liking IP NFT:", error);
      toast.error("Error liking IP NFT");
    }
  };

  return (
    <>
      <ToastContainer />
      <Navbar />
      
      {/* IP NFT Marketplace Modal */}
      {selectedIPNFT && (
        <IPNFTMarketplaceModal
          open={isModalVisible}
          onClose={handleCancel}
          item={selectedIPNFT}
          onBuy={handleBuy}
          onPlaceBid={handlePlaceBid}
          onLike={handleLike}
          onToggleAuction={handleToggleAuction}
          currentUser={accountId}
          loading={contractLoading}
        />
      )}

      <SocketManager />
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <StoreWalls />
        <StoreWalls2 />
        <StoreWalls3 />
        <StoreWalls4 />
        <color attach="background" args={["#ececec"]} />
        <ScrollControls pages={shopMode ? 4 : 0}>
          <Experience
            onFrameClick={showModal}
          />
        </ScrollControls>
      </Canvas>
      <UI/>
    </>
  );
}

export default App;
