import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { AvatarCreator } from "@readyplayerme/react-avatar-creator";
import { socket,mapAtom } from "./SocketManager";
import { Modal, Button ,Input} from "antd"; // Import Ant Design Modal and Button
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "@campnetwork/origin/react";
import { contractABI, contractAddress, getAllPosts, pinataApi, pinataSecret, setCoordinates, totalPosts, uploadArt } from "../utils/utils";

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

  // State for controlling the Ant Design modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title,setTitle] = useState(null)
  const [price,setPrice] = useState(null)
  const [img,setImg] = useState(null)
  const [uri,setURI] = useState(null)
  const [artPieces,setArtPieces] = useState([])
  const {origin} = useAuth();
  // Functions to show and hide modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    
    try {
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
      console.log("Calling contract to mint/upload art...");
      const tx = await origin.callContractMethod(contractAddress, contractABI, uploadArt, [ipfsURI])
      console.log("Transaction Success:", tx);
      const count = await origin.callContractMethod(contractAddress, contractABI, totalPosts, [])
      console.log("Total Posts:", count);
      const vals = generateFramePos(Number(count));
      console.log(vals)
      const tx2 = await origin.callContractMethod(contractAddress, contractABI, setCoordinates, [Number(count), vals.x, vals.y, vals.rotation])
      console.log("Transaction Success:", tx2);
      fetchArtPieces()

  
      // Create a new item for the map
      // const newItem = {
      //   name: "frame",
      //   size: [1, 4],
      //   gridPosition: [0, 0],
      //   tmp: true,
      //   link: img,
      //   by: localStorage.getItem("address"),
      // };

      const newItem = {
        name: 'frame',
        size: [ 1, 4 ],
        gridPosition: [ vals.x, vals.y ],
        by: localStorage.getItem("address"),
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
      toast.success("Successfully added new Art");
      setIsModalVisible(false);
  
    } catch (error) {
      console.error("Error during the submission process:", error);
      // window.alert("Minting error: " + error.message || "Unknown error occurred");
      toast.error("Error during the submission process");
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
        return { x:29, y:30-toUse, rotation: 2 };
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
      }
    }

  }
  const fetchArtPieces = async () => {
    try {
      if(origin == null) return;
      // Call the contract's getAllPosts function
      const artPieces = await origin.callContractMethod(contractAddress, contractABI, getAllPosts, [])
      setArtPieces(artPieces)
      console.log("Fetched Art Pieces:", artPieces);
    } catch (error) {
      console.error("Error fetching art pieces:", error);
      throw new Error("Failed to fetch art pieces.");
    }
  };
  useEffect(()=>{
    fetchArtPieces()
  },[origin])
  

  return (
    <>
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
    <span className="text-2xl font-bold text-gray-800">Enter Link</span>
  }
  open={isModalVisible}
  onOk={handleSubmit} // Trigger handleSubmit on Ok
  onCancel={handleCancel}
  className="p-6 rounded-lg shadow-lg"
  footer={null} // Remove the default footer buttons
>
  <div className="space-y-4">
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Title
      </label>
      <Input
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
      />
    </div>

    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Price
      </label>
      <Input
        placeholder="Enter Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
      />
    </div>

    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Upload Image
      </label>
      <Input
        type="file"
        onChange={handleImageChange}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
      />
    </div>

    <Button
      type="primary"
      onClick={handleSubmit}
      className="w-full mt-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition-all"
    >
      Submit
    </Button>
  </div>
</Modal>

      <div className="fixed inset-4 flex items-end justify-center pointer-events-none">
        <div className="flex items-center space-x-4 pointer-events-auto">
          
          {(buildMode || shopMode) && draggedItem === null && (
            <button
              className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
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
          {/* AVATAR Button */}
          {!buildMode && !shopMode && (
            <>
            <button
              className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => {
                showModal();
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
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.436 3h13.127a1.5 1.5 0 011.118.44l2.08 1.189a3.004 3.004 0 01-.621 4.72"
                />
              </svg>
            </button>
            <button
              className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
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
              className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
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
              className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
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
              className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
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
              className="p-4 rounded-full bg-slate-500 text-white drop-shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
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
    </>
  );
};