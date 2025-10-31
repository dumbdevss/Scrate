import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ContractId } from '@hashgraph/sdk';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { toast } from 'react-toastify';
import { ContractFunctionParameterBuilder } from '../services/wallets/contractFunctionParameterBuilder';
import NFTGalleryABI from '../abi/NFTGallery.json';

// Hedera Contract configuration
const HEDERA_CONTRACT_ID = "0.0.7173071";
const CONTRACT_ABI = NFTGalleryABI.abi;

export interface ArtPiece {
  id: number;
  uri: string;
  owner: string;
  maxBid: string;
  maxBidder: string;
  auctionActive: boolean;
  sold: boolean;
  likes: number;
  xCoordinate: number;
  yCoordinate: number;
  rotation: number;
}

export interface IpNftCreationData {
  uri: string;
  xCoordinate?: number;
  yCoordinate?: number;
  rotation?: number;
}

// Legacy export for backward compatibility
export type ArtCreationData = IpNftCreationData;

export const useNFTGallery = () => {
  const { walletInterface, accountId } = useWalletInterface();
  const [loading, setLoading] = useState(false);
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([]);

  // Get contract instance for read operations
  const getContract = useCallback(async () => {
    if (!walletInterface) {
      throw new Error('Wallet not connected');
    }

    // Use window.ethereum for provider access for read operations
    const { ethereum } = window as any;
    if (!ethereum) {
      throw new Error('Ethereum provider not found');
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const contractAddress = ContractId.fromString(HEDERA_CONTRACT_ID).toSolidityAddress();
    return new ethers.Contract(`0x${contractAddress}`, CONTRACT_ABI, provider);
  }, [walletInterface]);

  // Execute contract function using Hedera MetaMask integration
  const executeHederaFunction = useCallback(async (
    functionName: string,
    parameters: ContractFunctionParameterBuilder,
    gasLimit: number = -1
  ) => {
    if (!walletInterface || !walletInterface.executeContractFunction) {
      throw new Error('Wallet not connected or does not support Hedera functions');
    }

    const contractId = ContractId.fromString(HEDERA_CONTRACT_ID);
    return await walletInterface.executeContractFunction(contractId, functionName, parameters, gasLimit);
  }, [walletInterface]);

  // Upload/Create IpNft
  const uploadIpNft = useCallback(async (ipNftData: IpNftCreationData) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      // Use Hedera contract function execution
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "string", name: "_uri", value: ipNftData.uri });
      
      // Upload the ipNft with URI using Hedera contract execution
      const txHash = await executeHederaFunction('uploadArt', parameters);
      
      if (!txHash) {
        throw new Error('Transaction failed');
      }

      // If coordinates are provided, set them
      if (ipNftData.xCoordinate !== undefined && ipNftData.yCoordinate !== undefined) {
        // Get the latest art ID from contract (read operation)
        const contract = await getContract();
        const totalPosts = await contract.totalPosts();
        const artId = totalPosts.toNumber() - 1;
        
        const coordParameters = new ContractFunctionParameterBuilder()
          .addParam({ type: "uint256", name: "_id", value: artId })
          .addParam({ type: "uint256", name: "_xCoordinate", value: ipNftData.xCoordinate || 0 })
          .addParam({ type: "uint256", name: "_yCoordinate", value: ipNftData.yCoordinate || 0 })
          .addParam({ type: "uint256", name: "_rotation", value: ipNftData.rotation || 0 });
        
        await executeHederaFunction('setCoordinates', coordParameters);
      }

      toast.success('IpNft uploaded successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error uploading ipNft:', error);
      toast.error(`Error uploading ipNft: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract]);

  // Fetch all posts
  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const posts = await contract.getAllPosts();
      
      const formattedPosts: ArtPiece[] = posts.map((post: any) => ({
        id: post.id.toNumber(),
        uri: post.uri,
        owner: post.owner,
        maxBid: ethers.utils.formatEther(post.maxBid),
        maxBidder: post.maxBidder,
        auctionActive: post.auctionActive,
        sold: post.sold,
        likes: post.likes.toNumber(),
        xCoordinate: post.xCoordinate.toNumber(),
        yCoordinate: post.yCoordinate.toNumber(),
        rotation: post.rotation.toNumber(),
      }));

      setArtPieces(formattedPosts);
      return formattedPosts;
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error(`Error fetching posts: ${error.message || 'Unknown error'}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Fetch user's art pieces
  const fetchMyArtPieces = useCallback(async () => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return [];
    }

    setLoading(true);
    try {
      const contract = await getContract();
      const myPosts = await contract.getMyArtPieces();
      
      const formattedPosts: ArtPiece[] = myPosts.map((post: any) => ({
        id: post.id.toNumber(),
        uri: post.uri,
        owner: post.owner,
        maxBid: ethers.utils.formatEther(post.maxBid),
        maxBidder: post.maxBidder,
        auctionActive: post.auctionActive,
        sold: post.sold,
        likes: post.likes.toNumber(),
        xCoordinate: post.xCoordinate.toNumber(),
        yCoordinate: post.yCoordinate.toNumber(),
        rotation: post.rotation.toNumber(),
      }));

      return formattedPosts;
    } catch (error: any) {
      console.error('Error fetching my art pieces:', error);
      toast.error(`Error fetching my art pieces: ${error.message || 'Unknown error'}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract]);

  // Buy Art
  const buyArt = useCallback(async (artId: number, price: string) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId });
      
      // Note: For payable functions, you might need to handle value separately
      const txHash = await executeHederaFunction('buyArt', parameters);

      if (!txHash) {
        throw new Error('Transaction failed');
      }
      
      toast.success('Art purchased successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error buying art:', error);
      toast.error(`Error buying art: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract, fetchAllPosts]);

  // Place Bid
  const placeBid = useCallback(async (artId: number, bidAmount: string) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId });
      
      const txHash = await executeHederaFunction('placeBid', parameters);

      if (!txHash) {
        throw new Error('Transaction failed');
      }
      
      toast.success('Bid placed successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error(`Error placing bid: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract, fetchAllPosts]);

  // Like Art
  const likeArt = useCallback(async (artId: number) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId });
      
      const txHash = await executeHederaFunction('likeArt', parameters);

      if (!txHash) {
        throw new Error('Transaction failed');
      }
      
      toast.success('Art liked successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error liking art:', error);
      toast.error(`Error liking art: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract, fetchAllPosts]);

  // Toggle Auction
  const toggleAuction = useCallback(async (artId: number) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId });
      
      const txHash = await executeHederaFunction('toggleAuction', parameters);

      if (!txHash) {
        throw new Error('Transaction failed');
      }
      
      toast.success('Auction toggled successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error toggling auction:', error);
      toast.error(`Error toggling auction: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract, fetchAllPosts]);

  // Get Bidders
  const getBidders = useCallback(async (artId: number) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const bidders = await contract.getBidders(artId);
      return bidders;
    } catch (error: any) {
      console.error('Error fetching bidders:', error);
      toast.error(`Error fetching bidders: ${error.message || 'Unknown error'}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get Max Bid
  const getMaxBid = useCallback(async (artId: number) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const maxBid = await contract.getMaxBid(artId);
      return ethers.utils.formatEther(maxBid);
    } catch (error: any) {
      console.error('Error fetching max bid:', error);
      toast.error(`Error fetching max bid: ${error.message || 'Unknown error'}`);
      return '0';
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Set Coordinates
  const setCoordinates = useCallback(async (
    artId: number, 
    xCoordinate: number, 
    yCoordinate: number, 
    rotation: number = 0
  ) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId })
        .addParam({ type: "uint256", name: "_xCoordinate", value: xCoordinate })
        .addParam({ type: "uint256", name: "_yCoordinate", value: yCoordinate })
        .addParam({ type: "uint256", name: "_rotation", value: rotation });
      
      const txHash = await executeHederaFunction('setCoordinates', parameters);

      if (!txHash) {
        throw new Error('Transaction failed');
      }
      
      toast.success('Coordinates updated successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error setting coordinates:', error);
      toast.error(`Error setting coordinates: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract, fetchAllPosts]);

  // End Auction
  const endAuction = useCallback(async (artId: number) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId });
      
      const txHash = await executeHederaFunction('endAuction', parameters);

      if (!txHash) {
        throw new Error('Transaction failed');
      }
      
      toast.success('Auction ended successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error ending auction:', error);
      toast.error(`Error ending auction: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, getContract, fetchAllPosts]);

  return {
    // State
    loading,
    artPieces,
    
    // Functions
    uploadIpNft,
    fetchAllPosts,
    fetchMyArtPieces,
    buyArt,
    placeBid,
    likeArt,
    toggleAuction,
    getBidders,
    getMaxBid,
    setCoordinates,
    endAuction,
    
    // Contract info
    contractAddress: HEDERA_CONTRACT_ID,
    isConnected: !!accountId,
  };
};
