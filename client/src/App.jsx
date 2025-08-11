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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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



  const handleBuy = async (id, price) => {
  //   try {
  //     // Ensure that state.contract is available
  //     if (!state.contract) {
  //       console.error("Contract not initialized");
  //       return;
  //     }

  //     // Parse the price from Ether to Wei
  //     const tx = await state.contract.buyArt(id, {
  //       value: ethers.parseEther(String(price)), // Ensure price is a string like "0.1"
  //     });

  //     // Wait for the transaction to be confirmed
  //     await tx.wait();

  //     console.log("Bought Successfully!!");
  //   } catch (error) {
  //     console.error("Error buying art:", error);
  //   }
  };
  const handleBid = async (id, bid) => {
  //   try {
  //     const tx = await state.contract.placeBid(id, {
  //       value: ethers.parseEther(String(bid)),
  //     });
  //     await tx.wait();
  //     console.log("Bid Successfully!!");
  //   } catch (error) {
  //     console.log(error);
  //   }
  };
  const handleToggle = async (id) => {
  //   try {
  //     const tx = await state.contract.toggleAuction(id);
  //     await tx.wait();

  //     console.log("Auction Toggled");
  //   } catch (error) {}
  };
  const [bidders, setBidders] = useState([]);
  const [isBiddersModalVisible, setIsBiddersModalVisible] = useState(false); // Control the visibility of bidders modal

  const handleGetBidders = async (id) => {
  //   try {
  //     const fetchedBidders = await state.contract.getBidders(id);
  //     // await fetchedBidders.wait();
  //     setBidders(fetchedBidders);
  //     setIsBiddersModalVisible(true);

  //     console.log("Bidders fetched");
  //   } catch (error) {
  //     console.log(error);
  //   }
  };
  const [maxBid, setMaxBid] = useState(null); // To store the maximum bid
  const [isMaxBidModalVisible, setIsMaxBidModalVisible] = useState(false); // Control the visibility of max bid modal
  const handleGetMaxBid = async (id) => {
  //   try {
  //     const fetchedMaxBid = await state.contract.getMaxBid(id);

  //     // Convert the fetched value from Wei to Ether for display
  //     const maxBidInEther = ethers.formatEther(fetchedMaxBid);

  //     // After fetching, store the max bid and open the modal
  //     setMaxBid(maxBidInEther);
  //     setIsMaxBidModalVisible(true);

  //     console.log("Max bid fetched:", maxBidInEther);
  //   } catch (error) {
  //     console.error("Error fetching max bid:", error);
  //   }
  };
  const handleLike = async (id) => {
  //   try {
  //     const tx = await state.contract.likeArt(id);
  //     await tx.wait();
  //     console.log("Art liked successfully!");

  //     // Optionally, fetch the updated number of likes
  //   } catch (error) {
  //     console.error("Error liking art:", error);
  //   }
  };

  return (
    <>
      <ToastContainer />
      <Navbar />
      <Modal
        title={<span className="text-gray-200 font-semibold">Art Details</span>}
        open={isModalVisible}
        // onOk={handleOk}
        onCancel={handleCancel}
        className="bg-gray-900 border-0 shadow-xl" // Modal container styling
        footer={null} // Disable default footer
      >
        <div className="p-4 bg-gray-800 rounded-lg text-white">
          {/* Art Title */}
          <p className="text-xl font-bold mb-2">Title: {title}</p>

          {/* Art Price */}
          <p className="text-lg font-semibold mb-4">Price: {price} ETH</p>

          {/* Owner Address */}
          <p className="text-sm text-gray-400 mb-4">Owner: {owner}</p>

          {/* Bid Section */}
          <div className="mt-4 flex items-center">
            <input
              type="text"
              className="border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your bid"
              onChange={(e) => setBid(e.target.value)}
            />
            <button
              className="ml-2 bg-gray-900 text-white font-bold py-2 px-3 rounded-md hover:bg-gray-800 transition duration-300"
              onClick={() => handleBid(id, bid)}
            >
              Bid
            </button>
          </div>

          {/* Buttons Section */}
          <div className="mt-4 space-y-2">
            {/* Buy Button */}
            <button
              className="bg-gray-900 text-white font-bold py-2 px-3 rounded-md hover:bg-gray-800 transition duration-300 w-full"
              onClick={() => handleBuy(id, price)}
            >
              Buy Now
            </button>

            {/* Toggle Auction Button */}
            <button
              className="bg-gray-900 text-white font-bold py-2 px-3 rounded-md hover:bg-gray-800 transition duration-300 w-full"
              onClick={() => handleToggle(id)}
            >
              Toggle Auction
            </button>

            {/* View Bidders Button */}
            <button
              className="bg-gray-900 text-white font-bold py-2 px-3 rounded-md hover:bg-gray-800 transition duration-300 w-full"
              onClick={() => handleGetBidders(id)}
            >
              View Bidders
            </button>

            {/* View Max Bid Button */}
            <button
              className="bg-gray-900 text-white font-bold py-2 px-3 rounded-md hover:bg-gray-800 transition duration-300 w-full"
              onClick={() => handleGetMaxBid(id)}
            >
              {maxBid ? `Max Bid: ${maxBid} ETH` : "View Max Bid"}
            </button>
          </div>

          {/* Like Button */}
          <div className="mt-4 flex items-center space-x-2">
            <button
              className="flex items-center bg-red-500 text-white font-bold py-2 px-3 rounded-md hover:bg-red-500 transition duration-300"
              onClick={() => handleLike(id)}
            >
              {/* Heart SVG */}
              <svg
                className="w-5 h-5 fill-current text-white mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{likes}</span>
            </button>
          </div>
        </div>

        {/* Bidders Modal */}
        <Modal
          title={
            <span className="text-gray-800 font-bold underline">Bidders List</span> // Keep the title light for contrast
          }
          open={isBiddersModalVisible}
          onOk={() => setIsBiddersModalVisible(false)}
          onCancel={() => setIsBiddersModalVisible(false)}
          className="bg-gray-800 border-0 shadow-xl" // Darker background for contrast
        >
          <div className="text-black">
            {" "}
            <p className="text-lg font-semibold">Art ID: {id}</p>
            <p className="mt-4">List of Bidders:</p>
            <ul className="list-disc ml-4 mt-2">
              {bidders.length > 0 ? (
                bidders.map((bidder, index) => (
                  <li key={index} className="mt-2">
                    {bidder}
                  </li>
                ))
              ) : (
                <p>No bidders found</p>
              )}
            </ul>
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
