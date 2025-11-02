// Get values from environment variables
export const contractAddress = import.meta.env.REACT_APP_CONTRACT_ADDRESS || "0xa779B2594Fb4fEFaf8Ac7c9c74d386a023D3354b";

// function Names

export const uploadArt = 'uploadArt';
export const totalPosts = 'totalPosts';
export const setCoordinates = 'setCoordinates';
export const getAllPosts = 'getAllPosts';
export const buyArt = 'buyArt';
export const placeBid = 'placeBid';
export const toggleAuction = 'toggleAuction';
export const getBidders = 'getBidders';
export const getMaxBid = 'getMaxBid';
export const likeArt = 'likeArt';

// keys

export const pinataApi = import.meta.env.REACT_APP_PINATA_API_KEY;
export const pinataSecret = import.meta.env.REACT_APP_PINATA_API_SECRET;