import pathfinding from "pathfinding";
import { Server } from "socket.io";
// import socketIO from "socket.io";
import { ethers } from "ethers";
import { JsonRpcProvider } from "ethers";
import abi from "../client/src/abi/NFTGallery.json" with { type: "json" };
import hederaAbi from "../client/src/abi/HederaIPNft.json" with { type: "json" };
// const http = require("http");
import http from "http";

// const hostname = "127.0.0.1";
const port = 8080;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, World!\n");
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found\n");
  }
});

server.listen(port, () => {
  console.log(`Server running at port = ${port}/`);
});

const io = new Server(server, {
  cors: {
    origin: ["https://meta-gallery-client.vercel.app/", "http://localhost:5173", "http://localhost:3000", "https://imagine-sandy.vercel.app", "https://imagine-dlv3.onrender.com"],
    methods: ["GET", "POST"]
  },
});

const privateKey =
  "440e0d85a55d3f9bb901900c62bc33f77570c32b640b3e881e3422c34a199ca7";
const alchemyProvider = new JsonRpcProvider(
  "https://rpc.basecamp.t.raas.gelato.cloud"
);
const contractAddress = "0xa779B2594Fb4fEFaf8Ac7c9c74d386a023D3354b";

// Hedera network configuration
const hederaProvider = new JsonRpcProvider("https://testnet.hashio.io/api");
const hederaContractAddress = "0xD48d7E6Abac7AE2b9f058077F6ceD85A1a9138Bb"; // Ethereum-style address for the Hedera contract

// console.log(abi.abi)
const signer = new ethers.Wallet(privateKey, alchemyProvider);
const contract = new ethers.Contract(contractAddress, abi.abi, signer);

// Hedera contract instance (read-only)
const hederaContract = new ethers.Contract(hederaContractAddress, hederaAbi.abi, hederaProvider);

// Check if the contract instances are created successfully
if (contract) {
  console.log("Base Camp contract instance created successfully");
} else {
  console.error("Failed to create Base Camp contract instance");
}

if (hederaContract) {
  console.log("Hedera contract instance created successfully");
} else {
  console.error("Failed to create Hedera contract instance");
}

// Function to get all active posts from Hedera
async function getHederaActivePosts() {
  try {
    console.log("Fetching active posts from Hedera contract...");
    const activePosts = await hederaContract.getAllActivePosts();
    
    console.log(`Found ${activePosts.length} active posts on Hedera`);
    
    // Convert the result to a more readable format
    const formattedPosts = activePosts.map((post, index) => ({
      id: Number(post.id),
      uri: post.uri,
      owner: post.owner,
      maxBid: ethers.formatEther(post.maxBid),
      maxBidder: post.maxBidder,
      auctionActive: post.auctionActive,
      sold: post.sold,
      likes: Number(post.likes),
      xCoordinate: Number(post.xCoordinate),
      yCoordinate: Number(post.yCoordinate),
      rotation: Number(post.rotation),
      title: post.title,
      description: post.description,
      ipType: post.ipType,
      creator: post.creator,
      createdAt: Number(post.createdAt),
      tags: post.tags,
      contentHash: post.contentHash,
      isActive: post.isActive,
      schemaVersion: post.schemaVersion,
      externalUrl: post.externalUrl,
      imageUrl: post.imageUrl,
      burned: post.burned
    }));
    
    return formattedPosts;
  } catch (error) {
    console.error("Error fetching Hedera active posts:", error);
    return [];
  }
}

// Test the Hedera contract call
getHederaActivePosts().then(posts => {
  console.log("Hedera active posts:", posts);
}).catch(error => {
  console.error("Failed to fetch Hedera posts:", error);
});
const items = {
  chineseMonk: {
    name: "chineseMonk",
    size: [2, 2],
  },
  goldenRetriever: {
    name: "goldenRetriever",
    size: [2, 2],
  },
  chineseArtifact: {
    name: "chineseArtifact",
    size: [2, 2],
  },
  squareBlock1: {
    name: "squareBlock",
    size: [2, 2],
  },
  squareBlock2: {
    name: "squareBlock",
    size: [2, 2],
  },
  squareBlock3: {
    name: "squareBlock",
    size: [2, 2],
  },
  stanchion1: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion2: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion3: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion4: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion5: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion6: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion7: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion8: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion9: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion10: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion11: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion12: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion13: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion14: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion15: {
    name: "stanchion1",
    size: [1, 5],
  },
  stanchion16: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion17: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion18: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion19: {
    name: "stanchion2",
    size: [5, 1],
  },
  stanchion20: {
    name: "stanchion2",
    size: [5, 1],
  },
  portraitWall: {
    name: "portraitWall",
    size: [1, 12],
  },
  portraitWall2: {
    name: "portraitWall",
    size: [1, 12],
  },
  portraitWall3: {
    name: "portraitWall",
    size: [1, 12],
  },
  frame: {
    name: "frame",
    size: [1, 4],
  },
  washer: {
    name: "washer",
    size: [2, 2],
    drag: false,
  },
  toiletSquare: {
    name: "toiletSquare",
    size: [2, 2],
  },
  trashcan: {
    name: "trashcan",
    size: [1, 1],
  },
  bathroomCabinetDrawer: {
    name: "bathroomCabinetDrawer",
    size: [2, 2],
  },
  bathtub: {
    name: "bathtub",
    size: [4, 2],
  },
  bathroomMirror: {
    name: "bathroomMirror",
    size: [2, 1],
    wall: true,
  },
  bathroomCabinet: {
    name: "bathroomCabinet",
    size: [2, 1],
    wall: true,
  },
  bathroomSink: {
    name: "bathroomSink",
    size: [2, 2],
  },
  showerRound: {
    name: "showerRound",
    size: [2, 2],
  },
  tableCoffee: {
    name: "tableCoffee",
    size: [4, 2],
  },
  loungeSofaCorner: {
    name: "loungeSofaCorner",
    size: [5, 5],
  },
  bear: {
    name: "bear",
    size: [2, 1],
    wall: true,
  },
  loungeSofaOttoman: {
    name: "loungeSofaOttoman",
    size: [2, 2],
  },
  tableCoffeeGlassSquare: {
    name: "tableCoffeeGlassSquare",
    size: [2, 2],
  },
  loungeDesignSofaCorner: {
    name: "loungeDesignSofaCorner",
    size: [5, 5],
  },
  loungeDesignSofa: {
    name: "loungeDesignSofa",
    size: [5, 2],
  },
  loungeSofa: {
    name: "loungeSofa",
    size: [5, 2],
  },
  bookcaseOpenLow: {
    name: "bookcaseOpenLow",
    size: [2, 1],
  },
  kitchenBar: {
    name: "kitchenBar",
    size: [2, 1],
  },
  bookcaseClosedWide: {
    name: "bookcaseClosedWide",
    size: [3, 1],
  },
  bedSingle: {
    name: "bedSingle",
    size: [3, 5],
  },
  bench: {
    name: "bench",
    size: [2, 1],
  },
  bedDouble: {
    name: "bedDouble",
    size: [5, 5],
  },
  benchCushionLow: {
    name: "benchCushionLow",
    size: [2, 1],
  },
  loungeChair: {
    name: "loungeChair",
    size: [2, 2],
  },
  cabinetBedDrawer: {
    name: "cabinetBedDrawer",
    size: [1, 1],
  },
  cabinetBedDrawerTable: {
    name: "cabinetBedDrawerTable",
    size: [1, 1],
  },
  table: {
    name: "table",
    size: [4, 2],
  },
  tableCrossCloth: {
    name: "tableCrossCloth",
    size: [4, 2],
  },
  plant: {
    name: "plant",
    size: [1, 1],
  },
  plantSmall: {
    name: "plantSmall",
    size: [1, 1],
  },
  rugRounded: {
    name: "rugRounded",
    size: [6, 4],
    walkable: true,
  },
  rugRound: {
    name: "rugRound",
    size: [4, 4],
    walkable: true,
  },
  rugSquare: {
    name: "rugSquare",
    size: [4, 4],
    walkable: true,
  },
  rugRectangle: {
    name: "rugRectangle",
    size: [8, 4],
    walkable: true,
  },
  televisionVintage: {
    name: "televisionVintage",
    size: [4, 2],
  },
  televisionModern: {
    name: "televisionModern",
    size: [4, 2],
  },
  kitchenCabinetCornerRound: {
    name: "kitchenCabinetCornerRound",
    size: [2, 2],
  },
  kitchenCabinetCornerInner: {
    name: "kitchenCabinetCornerInner",
    size: [2, 2],
  },
  kitchenCabinet: {
    name: "kitchenCabinet",
    size: [2, 2],
  },
  kitchenBlender: {
    name: "kitchenBlender",
    size: [1, 1],
  },
  dryer: {
    name: "dryer",
    size: [2, 2],
  },
  chairCushion: {
    name: "chairCushion",
    size: [1, 1],
  },
  chair: {
    name: "chair",
    size: [1, 1],
  },
  deskComputer: {
    name: "deskComputer",
    size: [3, 2],
  },
  desk: {
    name: "desk",
    size: [3, 2],
  },
  chairModernCushion: {
    name: "chairModernCushion",
    size: [1, 1],
  },
  chairModernFrameCushion: {
    name: "chairModernFrameCushion",
    size: [1, 1],
  },
  kitchenMicrowave: {
    name: "kitchenMicrowave",
    size: [1, 1],
  },
  coatRackStanding: {
    name: "coatRackStanding",
    size: [1, 1],
  },
  kitchenSink: {
    name: "kitchenSink",
    size: [2, 2],
  },
  lampRoundFloor: {
    name: "lampRoundFloor",
    size: [1, 1],
  },
  lampRoundTable: {
    name: "lampRoundTable",
    size: [1, 1],
  },
  lampSquareFloor: {
    name: "lampSquareFloor",
    size: [1, 1],
  },
  lampSquareTable: {
    name: "lampSquareTable",
    size: [1, 1],
  },
  toaster: {
    name: "toaster",
    size: [1, 1],
  },
  kitchenStove: {
    name: "kitchenStove",
    size: [2, 2],
  },
  laptop: {
    name: "laptop",
    size: [1, 1],
  },
  radio: {
    name: "radio",
    size: [1, 1],
  },
  speaker: {
    name: "speaker",
    size: [1, 1],
  },
  speakerSmall: {
    name: "speakerSmall",
    size: [1, 1],
  },
  stoolBar: {
    name: "stoolBar",
    size: [1, 1],
  },
  stoolBarSquare: {
    name: "stoolBarSquare",
    size: [1, 1],
  },
};

const map = {
  size: [15, 15],
  gridDivision: 2,
  items: [
    {
      ...items.chineseMonk,
      gridPosition: [7, 5],
    },
    {
      ...items.goldenRetriever,
      gridPosition: [14, 22],
    },
    {
      ...items.chineseArtifact,
      gridPosition: [21, 5],
    },
    {
      ...items.squareBlock1,
      gridPosition: [21, 5],
    },
    {
      ...items.squareBlock2,
      gridPosition: [14, 22],
    },
    {
      ...items.squareBlock3,
      gridPosition: [7, 5],
    },
    {
      ...items.stanchion1,
      gridPosition: [1, 2],
    },
    {
      ...items.stanchion2,
      gridPosition: [1, 7],
    },
    {
      ...items.stanchion3,
      gridPosition: [1, 12],
    },
    {
      ...items.stanchion4,
      gridPosition: [1, 17],
    },
    {
      ...items.stanchion5,
      gridPosition: [1, 22],
    },
    {
      ...items.stanchion6,
      gridPosition: [3, 1],
    },
    {
      ...items.stanchion7,
      gridPosition: [8, 1],
    },
    {
      ...items.stanchion8,
      gridPosition: [13, 1],
    },
    {
      ...items.stanchion9,
      gridPosition: [18, 1],
    },
    {
      ...items.stanchion10,
      gridPosition: [23, 1],
    },
    {
      ...items.stanchion11,
      gridPosition: [27, 2],
    },
    {
      ...items.stanchion12,
      gridPosition: [27, 7],
    },
    {
      ...items.stanchion13,
      gridPosition: [27, 12],
    },
    {
      ...items.stanchion14,
      gridPosition: [27, 17],
    },
    {
      ...items.stanchion15,
      gridPosition: [27, 22],
    },
    {
      ...items.stanchion16,
      gridPosition: [3, 27],
    },
    {
      ...items.stanchion17,
      gridPosition: [8, 27],
    },
    {
      ...items.stanchion18,
      gridPosition: [13, 27],
    },
    {
      ...items.stanchion19,
      gridPosition: [18, 27],
    },
    {
      ...items.stanchion20,
      gridPosition: [23, 27],
    },
    {
      ...items.portraitWall,
      gridPosition: [8, 12],
    },
    {
      ...items.portraitWall2,
      gridPosition: [15, 4],
    },
    {
      ...items.portraitWall3,
      gridPosition: [22, 12],
    },
    // {
    //   ...items.showerRound,
    //   gridPosition: [0, 0],
    // },
    // {
    //   ...items.toiletSquare,
    //   gridPosition: [0, 3],
    //   rotation: 1,
    // },
    // {
    //   ...items.washer,
    //   gridPosition: [5, 0],
    // },
    // {
    //   ...items.bathroomSink,
    //   gridPosition: [7, 0],
    // },
    // {
    //   ...items.trashcan,
    //   gridPosition: [0, 5],
    //   rotation: 1,
    // },
    // {
    //   ...items.bathroomCabinetDrawer,
    //   gridPosition: [3, 0],
    // },
    // {
    //   ...items.bathtub,
    //   gridPosition: [4, 4],
    // },
    // {
    //   ...items.bathtub,
    //   gridPosition: [0, 8],
    //   rotation: 3,
    // },
    // {
    //   ...items.bathroomCabinet,
    //   gridPosition: [3, 0],
    // },
    // {
    //   ...items.bathroomMirror,
    //   gridPosition: [0, 8],
    //   rotation: 1,
    // },
    // {
    //   ...items.bathroomMirror,
    //   gridPosition: [, 10],
    //   rotation: 1,
    // },
    // {
    //   ...items.tableCoffee,
    //   gridPosition: [10, 8],
    // },
    // {
    //   ...items.rugRectangle,
    //   gridPosition: [8, 7],
    // },
    // {
    //   ...items.loungeSofaCorner,
    //   gridPosition: [6, 10],
    // },
    // {
    //   ...items.bear,
    //   gridPosition: [0, 3],
    //   rotation: 1,
    // },
    // {
    //   ...items.plant,
    //   gridPosition: [11, 13],
    // },
    // {
    //   ...items.cabinetBedDrawerTable,
    //   gridPosition: [13, 19],
    // },
    // {
    //   ...items.cabinetBedDrawer,
    //   gridPosition: [19, 19],
    // },
    // {
    //   ...items.bedDouble,
    //   gridPosition: [14, 15],
    // },
    // {
    //   ...items.bookcaseClosedWide,
    //   gridPosition: [12, 0],
    //   rotation: 2,
    // },
    // {
    //   ...items.speaker,
    //   gridPosition: [11, 0],
    // },
    // {
    //   ...items.speakerSmall,
    //   gridPosition: [15, 0],
    // },
    // {
    //   ...items.loungeChair,
    //   gridPosition: [10, 4],
    // },
    // {
    //   ...items.loungeSofaOttoman,
    //   gridPosition: [14, 4],
    // },
    // {
    //   ...items.loungeDesignSofa,
    //   gridPosition: [18, 0],
    //   rotation: 1,
    // },
    // {
    //   ...items.kitchenCabinetCornerRound,
    //   gridPosition: [2, 18],
    //   rotation: 2,
    // },
    // {
    //   ...items.kitchenCabinetCornerInner,
    //   gridPosition: [0, 18],
    //   rotation: 2,
    // },
    // {
    //   ...items.kitchenStove,
    //   gridPosition: [0, 16],
    //   rotation: 1,
    // },
    // {
    //   ...items.dryer,
    //   gridPosition: [0, 14],
    //   rotation: 1,
    // },
    // {
    //   ...items.lampRoundFloor,
    //   gridPosition: [0, 12],
    // },
  ],
};
const fetchAllPosts = async () => {
  console.log("Fetching posts from both networks...");
  
  // Fetch from Camp network
  let campPosts = [];
  try {
    campPosts = await contract.getAllPosts();
    console.log("Fetched Camp network posts:", campPosts.length);
  } catch (error) {
    console.error("Error fetching Camp network posts:", error);
  }

  // Fetch from Hedera network
  let hederaPosts = [];
  try {
    hederaPosts = await getHederaActivePosts();
    console.log("Fetched Hedera network posts:", hederaPosts.length);
  } catch (error) {
    console.error("Error fetching Hedera network posts:", error);
  }

  // Combine posts from both networks
  const allPosts = [...campPosts, ...hederaPosts];
  console.log("Total posts from both networks:", allPosts.length);
  // posts.map(async (post, i) => {
  //   const imgResponse = await fetch(post[1]);
  //   const imgData = await imgResponse.json();
  //   const obj = {
  //     ...items.frame,
  //     gridPosition: [Number(post[8]), Number(post[9])],
  //     by: post[2],
  //     likes: Number(post[7]),
  //     rotation: Number(post[10]),
  //     link: imgData.img,
  //     title: imgData.title,
  //     price: imgData.price,
  //     auctionActive: post[5],
  //     sold: post[6],
  //     maxBidder: post[4],
  //     currentBid: Number(post[3]),
  //     id: Number(post[0]),
  //   };
  //   // console.log(obj);
  //   map.items.push(obj);
  // });
  for (const post of allPosts) {
    let postID, obj = {};
    
    // Check if this is a Hedera post (object) or Camp post (array)
    const isHederaPost = post && typeof post === 'object' && !Array.isArray(post) && post.id !== undefined;
    
    if (isHederaPost) {
      postID = post.id;
    } else {
      postID = Number(post[0]);
    }
    
    const itemIndex = map.items.findIndex(item => item.name === "frame" && item.id === postID);
    if (itemIndex !== -1) {
      // Update existing item
      if (isHederaPost) {
        map.items[itemIndex] = {
          ...map.items[itemIndex],
          by: post.owner,
          likes: post.likes,
          rotation: post.rotation,
          auctionActive: post.auctionActive,
          sold: post.sold,
          maxBidder: post.maxBidder,
          currentBid: parseFloat(post.maxBid),
          gridPosition: [post.xCoordinate, post.yCoordinate],
          id: postID,
        };
      } else {
        map.items[itemIndex] = {
          ...map.items[itemIndex],
          by: post[2],
          likes: Number(post[7]),
          rotation: Number(post[10]),
          auctionActive: post[5],
          sold: post[6],
          maxBidder: post[4],
          currentBid: Number(post[3]),
          gridPosition: [Number(post[8]), Number(post[9])],
          id: postID,
        };
      }
      continue;
    }
    
    try {
      if (isHederaPost) {
        // Hedera post (already formatted object)
        obj = {
          ...items.frame,
          gridPosition: [post.xCoordinate, post.yCoordinate],
          by: post.owner,
          likes: post.likes,
          rotation: post.rotation,
          link: post.imageUrl || '',
          title: post.title || 'Untitled',
          description: post.description || '',
          ipType: post.ipType || 'Digital Art',
          creator: post.creator || post.owner,
          tags: post.tags || [],
          contentHash: post.contentHash || '',
          externalUrl: post.externalUrl || '',
          price: 0, // Hedera posts don't have price in same format
          auctionActive: post.auctionActive,
          sold: post.sold,
          maxBidder: post.maxBidder,
          currentBid: parseFloat(post.maxBid),
          id: post.id,
          network: 'hedera'
        };
      } else {
        // Camp network post (array format)
        const imgResponse = await fetch(post[1]);
        const imgData = await imgResponse.json();
        obj = {
          ...items.frame,
          gridPosition: [Number(post[8]), Number(post[9])],
          by: post[2],
          likes: Number(post[7]),
          rotation: Number(post[10]),
          link: imgData.img || '',
          title: imgData.title || 'Untitled',
          description: imgData.description || '',
          price: imgData.price || 0,
          auctionActive: post[5],
          sold: post[6],
          maxBidder: post[4],
          currentBid: Number(post[3]),
          id: Number(post[0]),
          network: 'camp'
        };
      }
    } catch (error) {
      console.error("Error processing post:", error);
      // Fallback object
      obj = {
        ...items.frame,
        gridPosition: isHederaPost ? [post.xCoordinate || 0, post.yCoordinate || 0] : [Number(post[8]) || 0, Number(post[9]) || 0],
        by: isHederaPost ? (post.owner || 'Unknown') : (post[2] || 'Unknown'),
        likes: isHederaPost ? (post.likes || 0) : (Number(post[7]) || 0),
        rotation: isHederaPost ? (post.rotation || 0) : (Number(post[10]) || 0),
        link: '',
        title: 'Error Loading Post',
        description: '',
        price: 0,
        auctionActive: false,
        sold: false,
        maxBidder: isHederaPost ? (post.maxBidder || '') : (post[4] || ''),
        currentBid: isHederaPost ? (parseFloat(post.maxBid) || 0) : (Number(post[3]) || 0),
        id: isHederaPost ? (post.id || 0) : (Number(post[0]) || 0),
        network: isHederaPost ? 'hedera' : 'camp'
      };
    }
    // console.log(obj);
    map.items.push(obj);
  }
  console.log("fetchAllPosts completed");
  console.log("Map items:", map.items.length);
};
// await fetchAllPosts()

const characters = [];


const grid = new pathfinding.Grid(
  map.size[0] * map.gridDivision,
  map.size[1] * map.gridDivision
);

const finder = new pathfinding.AStarFinder({
  allowDiagonal: true,
  dontCrossCorners: true,
});

const findPath = (start, end) => {
  const gridClone = grid.clone();
  const path = finder.findPath(start[0], start[1], end[0], end[1], gridClone);
  return path;
};

const updateGrid = () => {
  // RESET
  for (let x = 0; x < map.size[0] * map.gridDivision; x++) {
    for (let y = 0; y < map.size[1] * map.gridDivision; y++) {
      grid.setWalkableAt(x, y, true);
    }
  }
  map.items.forEach((item) => {
    // console.log(item.name)
    if (item.walkable || item.wall) {
      return;
    }
    const width =
      item.rotation === 1 || item.rotation === 3 ? item.size[1] : item.size[0];
    const height =
      item.rotation === 1 || item.rotation === 3 ? item.size[0] : item.size[1];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const gridX = item.gridPosition[0] + x;
        const gridY = item.gridPosition[1] + y;
        // Check bounds before setting walkable
        if (gridX >= 0 && gridX < map.size[0] * map.gridDivision &&
          gridY >= 0 && gridY < map.size[1] * map.gridDivision) {
          grid.setWalkableAt(gridX, gridY, false);
        }
      }
    }
  });
};

updateGrid();

const generateRandomPosition = () => {
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * map.size[0] * map.gridDivision);
    const y = Math.floor(Math.random() * map.size[1] * map.gridDivision);
    if (grid.isWalkableAt(x, y)) {
      return [x, y];
    }
  }
};

const generateRandomHexColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

io.on("connection", async (socket) => {
  console.log("user connected");
  await fetchAllPosts();

  characters.push({
    id: socket.id,
    position: generateRandomPosition(),
    hairColor: generateRandomHexColor(),
    topColor: generateRandomHexColor(),
    bottomColor: generateRandomHexColor(),
    avatarUrl: "https://models.readyplayer.me/64f0265b1db75f90dcfd9e2c.glb",
    address: "",
  });
  map.items.forEach((item) => {
    console.log(item.name);
  });
  socket.emit("hello", {
    map,
    characters,
    id: socket.id,
    items,
  });

  io.emit("characters", characters);

  socket.on("characterAvatarUpdate", (avatarUrl, address) => {
    const character = characters.find(
      (character) => character.id === socket.id
    );
    if (address != null) {
      character.address = address;
    }
    if (avatarUrl != null) {
      character.avatarUrl =
        avatarUrl.split("?")[0] + "?" + new Date().getTime();
    }
    io.emit("characters", characters);
  });

  socket.on("move", (from, to) => {
    const character = characters.find(
      (character) => character.id === socket.id
    );
    const path = findPath(from, to);
    if (!path) {
      return;
    }
    character.position = from;
    character.path = path;
    io.emit("playerMove", character);
  });

  socket.on("dance", () => {
    io.emit("playerDance", {
      id: socket.id,
    });
  });

  socket.on("itemsUpdate", (items) => {
    map.items = items;
    characters.forEach((character) => {
      character.path = [];
      character.position = generateRandomPosition();
    });
    updateGrid();
    io.emit("mapUpdate", {
      map,
      characters,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    characters.splice(
      characters.findIndex((character) => character.id === socket.id),
      1
    );
    io.emit("characters", characters);
  });
});