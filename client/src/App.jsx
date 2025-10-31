import { ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Modal } from "antd";
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

function App() {
  const [shopMode] = useAtom(shopModeAtom);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [id, setId] = useState("");
  const [price, setPrice] = useState("");
  const [likes, setLikes] = useState(0);

  const showModal = (id, price, likes, title, by) => {
    setId(id);
    console.log(id);
    setPrice(price);
    setLikes(likes);
    setIsModalVisible(true);
    setTitle(title);
    setOwner(by);
  };

  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [bid, setBid] = useState(null);
  const [title, setTitle] = useState(null);
  const [owner, setOwner] = useState("");
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


  const handleBuy = async (id, price) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      await contractBuyArt(id, price);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error buying art:", error);
      toast.error("Error buying art");
    }
  };
  const handleBid = async (id, bid) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      if (!bid || parseFloat(bid) <= 0) {
        toast.error("Please enter a valid bid amount");
        return;
      }
      
      await contractPlaceBid(id, bid);
      setBid("");
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Error placing bid");
    }
  };
  const handleToggle = async (id) => {
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
  const [bidders, setBidders] = useState([]);
  const [isBiddersModalVisible, setIsBiddersModalVisible] = useState(false); // Control the visibility of bidders modal

  const handleGetBidders = async (id) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      const biddersList = await contractGetBidders(id);
      setBidders(biddersList);
      setIsBiddersModalVisible(true);
    } catch (error) {
      console.error("Error fetching bidders:", error);
      toast.error("Error fetching bidders");
    }
  };
  const [maxBid, setMaxBid] = useState(null); // To store the maximum bid
  const [isMaxBidModalVisible, setIsMaxBidModalVisible] = useState(false); // Control the visibility of max bid modal
  const handleGetMaxBid = async (id) => {
    try {
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      const maxBidAmount = await contractGetMaxBid(id);
      setMaxBid(maxBidAmount);
      setIsMaxBidModalVisible(true);
    } catch (error) {
      console.error("Error fetching max bid:", error);
      toast.error("Error fetching max bid");
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
      console.error("Error liking art:", error);
      toast.error("Error liking art");
    }
  };

  return (
    <>
      <style jsx global>{`
        .ant-modal .ant-modal-content {
          background-color: #000000 !important;
        }
        .ant-modal .ant-modal-header {
          background-color: #000000 !important;
          border-bottom: 1px solid #333333 !important;
        }
        .ant-modal .ant-modal-close {
          color: #ffffff !important;
        }
        .ant-modal .ant-modal-close:hover {
          background-color: #333333 !important;
        }
        .ant-modal .ant-modal-footer {
          background-color: #000000 !important;
          border-top: 1px solid #333333 !important;
        }
      `}</style>
      <ToastContainer />
      <Navbar />
      <Modal
        title={
          <span className="text-white text-lg font-semibold">Art Details</span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        className="dark-modal"
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        width={500}
        styles={{
          header: { 
            backgroundColor: '#000000', 
            borderBottom: '1px solid #333333',
            marginBottom: 0
          },
          body: { 
            backgroundColor: '#000000',
            padding: '24px'
          },
          content: {
            backgroundColor: '#000000',
            border: '1px solid #333333'
          }
        }}
        footer={null}
      >
        <div className="space-y-6">
          {/* Art Title */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-lg font-semibold text-white">Price: {price} ETH</p>
            <p className="text-sm text-gray-400 mt-2">Owner: {owner}</p>
          </div>

          {/* Bid Section */}
          <div className="space-y-3">
            <label className="block text-white text-sm font-medium">
              Place Your Bid (ETH)
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 px-3 py-2.5 bg-black border border-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                placeholder="Enter bid amount"
                onChange={(e) => setBid(e.target.value)}
              />
              <button
                className="px-6 py-2.5 bg-white text-black font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
                onClick={() => handleBid(id, bid)}
              >
                Place Bid
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
              onClick={() => handleBuy(id, price)}
            >
              Buy Now
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="bg-black text-white font-medium py-2.5 px-4 rounded-md border border-gray-700 hover:bg-gray-900 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                onClick={() => handleToggle(id)}
              >
                Toggle Auction
              </button>

              <button
                className="bg-black text-white font-medium py-2.5 px-4 rounded-md border border-gray-700 hover:bg-gray-900 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                onClick={() => handleGetBidders(id)}
              >
                View Bidders
              </button>
            </div>

            <button
              className="w-full bg-black text-white font-medium py-2.5 px-4 rounded-md border border-gray-700 hover:bg-gray-900 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              onClick={() => handleGetMaxBid(id)}
            >
              {maxBid ? `Max Bid: ${maxBid} ETH` : "View Max Bid"}
            </button>
          </div>

          {/* Like Section */}
          <div className="pt-4 border-t border-gray-700">
            <button
              className="flex items-center justify-center w-full bg-black text-white font-medium py-2.5 px-4 rounded-md border border-gray-700 hover:bg-gray-900 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
              onClick={() => handleLike(id)}
            >
              <svg
                className="w-5 h-5 fill-current text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>Like ({likes})</span>
            </button>
          </div>
        </div>

        {/* Bidders Modal */}
        <Modal
          title={
            <span className="text-white text-lg font-semibold">Bidders List</span>
          }
          open={isBiddersModalVisible}
          onOk={() => setIsBiddersModalVisible(false)}
          onCancel={() => setIsBiddersModalVisible(false)}
          className="dark-modal"
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          width={500}
          styles={{
            header: { 
              backgroundColor: '#000000', 
              borderBottom: '1px solid #333333',
              marginBottom: 0
            },
            body: { 
              backgroundColor: '#000000',
              padding: '24px'
            },
            content: {
              backgroundColor: '#000000',
              border: '1px solid #333333'
            }
          }}
          footer={
            <div className="flex justify-end">
              <button
                className="bg-white text-black font-medium py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
                onClick={() => setIsBiddersModalVisible(false)}
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-3">
              <p className="text-lg font-semibold text-white">Art ID: {id}</p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Active Bidders:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bidders.length > 0 ? (
                  bidders.map((bidder, index) => (
                    <div 
                      key={index} 
                      className="bg-black border border-gray-700 rounded-md px-3 py-2"
                    >
                      <span className="text-white text-sm font-mono">{bidder}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No bidders found for this artwork</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </Modal>

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
