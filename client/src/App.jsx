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
      
      await contractBuyArt(id, selectedIPNFT?.price || "0");
      setIsModalVisible(false);
      setSelectedIPNFT(null);
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
      
      await contractPlaceBid(id, bidAmount);
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
      
      await contractToggleAuction(id);
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
