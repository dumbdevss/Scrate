import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { AvatarCreator } from "@readyplayerme/react-avatar-creator";
import { socket,mapAtom } from "./SocketManager";
import { Modal, Button ,Input} from "antd"; // Import Ant Design Modal and Button
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pinataApi, pinataSecret } from "../utils/utils";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { useNFTGallery } from "../hooks/useHederaIp";
import { IPNFTUploadDialog } from "./IPNFTUploadDialog";

// Atoms
export const buildModeAtom = atom(false);
export const shopModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);

export const UI = () => {
  const [map] = useAtom(mapAtom);
  const [inputLink, setInputLink] = useState(""); // State for storing the input link
  const [buildMode, setBuildMode] = useAtom(buildModeAtom);
  const [shopMode, setShopMode] = useAtom(shopModeAtom);
  const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
  const [draggedItemRotation, setDraggedItemRotation] = useAtom(
    draggedItemRotationAtom
  );
  const [avatarMode, setAvatarMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for controlling the Ant Design modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isIPNFTModalVisible, setIsIPNFTModalVisible] = useState(false);
  const [title,setTitle] = useState(null)
  const [price,setPrice] = useState(null)
  const [img,setImg] = useState(null)
  const [uri,setURI] = useState(null)
  const [artPieces,setArtPieces] = useState([])
  const [xCoordinate, setXCoordinate] = useState('')
  const [yCoordinate, setYCoordinate] = useState('')
  const [rotation, setRotation] = useState(0)
  const { accountId, walletInterface } = useWalletInterface();
  const { uploadIpNft: contractUploadIpNft, fetchAllPosts, loading: contractLoading } = useNFTGallery();
  // Functions to show and hide modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const showIPNFTModal = () => {
    setIsIPNFTModalVisible(true);
  };

  const handleIPNFTUpload = async (ipnftData) => {
    try {
      await contractUploadIpNft(ipnftData);
      await fetchAllPosts();
      fetchArtPieces();
    } catch (error) {
      console.error('Error uploading IPNFT:', error);
      toast.error('Failed to upload IPNFT');
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if(!img) {
        toast.error("Please upload an image");
        setLoading(false);
        return;
      }
      // Prepare the data for IPFS upload
      const data = JSON.stringify({ title, price, img });
      console.log("Uploading data to IPFS:", data);
  
      // Pin JSON to IPFS using Pinata API
      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: pinataApi,
          pinata_secret_api_key: pinataSecret,
          "Content-Type": "application/json",
        },
      });
  
      const resData = await res.data;
      console.log("IPFS Upload Success:", resData);
  
      // Set the URI for the uploaded art
      const ipfsURI = `https://ipfs.io/ipfs/${resData.IpfsHash}`;
      setURI(ipfsURI);
      console.log(ipfsURI)
  
      // Interact with the smart contract
      if (!walletInterface) {
        toast.error("Please connect your wallet first");
        return;
      }
      
      console.log("Calling contract to mint/upload art...");
      
      // Prepare coordinates - use manual input or generate automatically
      let coords;
      if (xCoordinate && yCoordinate) {
        coords = {
          xCoordinate: parseInt(xCoordinate),
          yCoordinate: parseInt(yCoordinate),
          rotation: rotation
        };
      } else {
        const count = artPieces.length + 1;
        const vals = generateFramePos(Number(count));
        coords = {
          xCoordinate: vals.x,
          yCoordinate: vals.y,
          rotation: vals.rotation
        };
      }
      
      // Upload ipNft to contract
      const result = await contractUploadIpNft({
        uri: ipfsURI,
        ...coords
      });
      
      if (!result) {
        toast.error("Failed to upload ipNft to contract");
        return;
      }
      
      // Refresh art pieces
      await fetchAllPosts();
      fetchArtPieces();

      const newItem = {
        name: 'frame',
        size: [ 1, 4 ],
        gridPosition: [ vals.x, vals.y ],
        by: accountId || "unknown",
        likes: 0,
        rotation: vals.rotation,
        link: img,
        title: title,
        price: price,
        auctionActive: false,
        sold: false,
        maxBidder: '0x0000000000000000000000000000000000000000',
        currentBid: 0,
        id :Number(count)
      }
      // Update map items
      const temp = [...map.items];
      temp.push(newItem);
      console.log("Updated map items:", temp);
  
      // Emit updated items to the server
      socket.emit("itemsUpdate", temp);
  
      // Close the modal
      toast.success("Successfully added new IpNft");
      setIsModalVisible(false);

    } catch (error) {
      console.error("Error during the submission process:", error);
      // window.alert("Minting error: " + error.message || "Unknown error occurred");
      toast.error("Error during the ipNft submission process");
    } finally {
      setLoading(false);
    }
  };

  function generateFramePos(total) {
    let totalRotations = Math.floor((total*5) / 30);
    let left = 30 - ((total*5) % 30);
    let currentRotation = totalRotations;
    if (left < 4) {
      currentRotation += 1;
      left = 30;
    }
    let toUse = 30- left;
    switch (currentRotation) {
      case 0:
        return { x:0, y:toUse, rotation: 0 };
      case 1:
        return { x:toUse, y:29, rotation: 1 };
      case 2:
        return { x:29, y:30-toUse-4, rotation: 2 };
      case 3:
        return { x:30-toUse, y:0, rotation: 3 };
      default:
        toast.info("No more frames can be added");
        return { x: 0, y: 0, rotation: 0 }; //
    }
  }
  // function getRandomNumber(arr) {
  //   return arr[Math.floor(Math.random() * arr.length)];
  // }
  
  // function getFirstConsecutiveNumbers(set) {
  //   const sortedArray = Array.from(set).sort((a, b) => a - b);
  //   let firstNumbers = new Set();

  //   for (let i = 0; i < sortedArray.length - 3; i++) {
  //     if (
  //       sortedArray[i + 1] === sortedArray[i] + 1 &&
  //       sortedArray[i + 2] === sortedArray[i] + 2 &&
  //       sortedArray[i + 3] === sortedArray[i] + 3
  //     ) {
  //       firstNumbers.add(sortedArray[i]);
  //     }
  //   }

  //   return firstNumbers;
  // }
  
  
  const handleImageChange =async (e) => {
    e.preventDefault()
    const file = e.target.files[0];
    if(!file) return;
    setLoading(true);
    if (typeof file !== "undefined") {
      try {
        const formData = new FormData();
        formData.append("file", file);
        // console.log(formData)
        const res = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: pinataApi,
            pinata_secret_api_key: pinataSecret,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(res);
        const resData = await res.data;
        setImg(`https://ipfs.io/ipfs/${resData.IpfsHash}`);
      } catch (error) {
        window.alert(error);
      } finally {
        setLoading(false);
      }
    }

  }
  const fetchArtPieces = async () => {
    try {
      if(!walletInterface) return;
      
      const posts = await fetchAllPosts();
      setArtPieces(posts || []);
      console.log("Fetched Art Pieces:", posts);
    } catch (error) {
      console.error("Error fetching art pieces:", error);
    }
  };
  useEffect(()=>{
    fetchArtPieces()
  },[walletInterface])
  

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
      `}</style>
      {/* Avatar Creator */}
      {avatarMode && (
        <AvatarCreator
          subdomain="wawa-sensei-tutorial"
          className="fixed top-0 left-0 z-10 w-screen h-screen"
          onAvatarExported={(event) => {
            socket.emit("characterAvatarUpdate", event.data.url,null);
            toast.success("Successfully updated avatar");
            setAvatarMode(false);
          }}
        />
      )}


      {/* Ant Design Modal */}
      <Modal
  title={
    <span className="text-xl font-semibold text-white">Upload New IpNft</span>
  }
  open={isModalVisible}
  onOk={handleSubmit} // Trigger handleSubmit on Ok
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
    <div className="space-y-2">
      <label className="block text-white text-sm font-medium">
        Title
      </label>
      <input
        type="text"
        placeholder="Enter ipNft title"
        value={title || ''}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2.5 bg-black border border-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
      />
    </div>

    <div className="space-y-2">
      <label className="block text-white text-sm font-medium">
        Price (ETH)
      </label>
      <input
        type="text"
        placeholder="0.001"
        value={price || ''}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full px-3 py-2.5 bg-black border border-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
      />
    </div>

    <div className="space-y-2">
      <label className="block text-white text-sm font-medium">
        Upload Image
      </label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2.5 bg-black border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-200 file:cursor-pointer cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>

    {/* Coordinates Section */}
    <div className="space-y-4 border-t border-gray-700 pt-4">
      <h3 className="text-white text-sm font-medium">Position Settings (Optional)</h3>
      <p className="text-gray-400 text-xs">Leave empty for automatic positioning</p>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-white text-xs font-medium">
            X Coordinate
          </label>
          <input
            type="number"
            placeholder="Auto"
            value={xCoordinate}
            onChange={(e) => setXCoordinate(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-white text-xs font-medium">
            Y Coordinate
          </label>
          <input
            type="number"
            placeholder="Auto"
            value={yCoordinate}
            onChange={(e) => setYCoordinate(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-white text-xs font-medium">
          Rotation: {rotation * 90}°
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={rotation}
          onChange={(e) => setRotation(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
        </div>
      </div>
    </div>

    <button
      onClick={handleSubmit}
      disabled={loading || contractLoading}
      className="w-full bg-white text-black font-medium py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {(loading || contractLoading) ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading...
        </>
      ) : (
        'Upload IpNft'
      )}
    </button>
  </div>
</Modal>

      <div className="fixed inset-4 flex items-end justify-center pointer-events-none">
        <div className="flex items-center space-x-4 pointer-events-auto">
          
          {(buildMode || shopMode) && draggedItem === null && (
            <button
              className="p-4 rounded-full bg-black border border-gray-700 text-white shadow-lg cursor-pointer hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => {
                shopMode ? setShopMode(false) : setBuildMode(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
            </button>
          )}
          {/* UPLOAD Button (Legacy) */}
          {!buildMode && !shopMode && (
            <button
              className="p-4 rounded-full bg-gray-600 border border-gray-500 text-white shadow-lg cursor-pointer hover:bg-gray-700 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => {
                showModal();
              }}
              title="Legacy Upload"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </button>
          )}
          {/* IPNFT Upload Button */}
          {!buildMode && !shopMode && (
            <button
              className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-400 text-white shadow-lg cursor-pointer hover:from-purple-700 hover:to-blue-700 hover:border-purple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              onClick={() => {
                showIPNFTModal();
              }}
              title="Create IPNFT"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </button>
          )}
          {/* AVATAR Button */}
          {!buildMode && !shopMode && (
            <>
            <button
              className="p-4 rounded-full bg-black border border-gray-700 text-white shadow-lg cursor-pointer hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setAvatarMode(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </button></>
          )}
          {/* DANCE Button */}
          {!buildMode && !shopMode && (
            <button
              className="p-4 rounded-full bg-black border border-gray-700 text-white shadow-lg cursor-pointer hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => socket.emit("dance")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                />
              </svg>
            </button>
          )}
          {/* BUILD Button */}
          {!buildMode && !shopMode && (
            <button
              className="p-4 rounded-full bg-black border border-gray-700 text-white shadow-lg cursor-pointer hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setBuildMode(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </button>
          )}
          {buildMode && !shopMode && draggedItem !== null && (
            <button
              className="p-4 rounded-full bg-black border border-gray-700 text-white shadow-lg cursor-pointer hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() =>
                setDraggedItemRotation(
                  draggedItemRotation === 3 ? 0 : draggedItemRotation + 1
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
          )}
          {/* CANCEL */}
          {buildMode && !shopMode && draggedItem !== null && (
            <button
              className="p-4 rounded-full bg-black border border-gray-700 text-white shadow-lg cursor-pointer hover:bg-gray-900 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setDraggedItem(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* IPNFT Upload Dialog */}
      <IPNFTUploadDialog
        open={isIPNFTModalVisible}
        onClose={() => setIsIPNFTModalVisible(false)}
        onUpload={handleIPNFTUpload}
        loading={contractLoading}
      />
    </>
  );
};