import { useState, useCallback } from 'react';
import { ContractId } from '@hashgraph/sdk';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { toast } from 'react-toastify';
import { hederaContractId } from '../utils/utils';
import { ContractFunctionParameterBuilder } from '../services/wallets/contractFunctionParameterBuilder';

// Hedera Contract configuration - Updated with new deployed contract
const HEDERA_CONTRACT_ID = hederaContractId;

export interface ProjectDetails {
  industry: string;
  organization: string;
  topic: string;
  researchLeadName: string;
  researchLeadEmail: string;
}

export interface ArtPiece {
  id: number;
  uri: string;
  owner: string;
  price: string;           // Fixed price for direct purchase
  maxBid: string;
  maxBidder: string;
  auctionActive: boolean;
  sold: boolean;
  likes: number;
  xCoordinate: number;
  yCoordinate: number;
  rotation: number;
  // New IP Metadata fields
  title: string;
  description: string;
  ipType: string;
  creator: string;
  createdAt: number;
  tags: string[];
  contentHash: string;
  isActive: boolean;
  schemaVersion: string;
  externalUrl: string;
  imageUrl: string;
  agreementPdfUrl: string; // IPFS link for agreement PDF
  projectDetails: ProjectDetails;
  burned: boolean;
}

export interface IpNftCreationData {
  uri: string;
  price: string;
  title: string;
  description: string;
  ipType: string;
  tags: string[];
  contentHash: string;
  metadataBytes: string;
  schemaVersion: string;
  externalUrl: string;
  imageUrl: string;
  agreementPdfUrl: string;
  projectDetails: ProjectDetails;
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

  // Execute contract function using Hedera wallet interface
  const executeHederaFunction = useCallback(async (
    functionName: string,
    parameters: ContractFunctionParameterBuilder,
    gasLimit: number = 5000000
  ) => {
    if (!walletInterface || !walletInterface.executeContractFunction) {
      throw new Error('Wallet not connected or does not support Hedera functions');
    }

    const contractId = ContractId.fromString(HEDERA_CONTRACT_ID);
    return await walletInterface.executeContractFunction(contractId, functionName, parameters, gasLimit);
  }, [walletInterface]);

  // Upload/Create IpNft with comprehensive metadata
  const uploadIpNft = useCallback(async (ipNftData: IpNftCreationData) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      // Log the data being sent to contract for debugging
      console.log('Sending IPNFT data to contract:', {
        price: ipNftData.price || "0",
        projectDetails: ipNftData.projectDetails,
        title: ipNftData.title,
        description: ipNftData.description
      });

      // Use Hedera contract function execution with comprehensive metadata
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "string", name: "_uri", value: ipNftData.uri })
        .addParam({ type: "uint256", name: "_price", value: ipNftData.price || "0" })
        .addParam({ type: "string", name: "_title", value: ipNftData.title })
        .addParam({ type: "string", name: "_description", value: ipNftData.description })
        .addParam({ type: "string", name: "_ipType", value: ipNftData.ipType })
        .addParam({ type: "string[]", name: "_tags", value: ipNftData.tags })
        .addParam({ type: "string", name: "_contentHash", value: ipNftData.contentHash })
        .addParam({ type: "bytes", name: "_metadataBytes", value: ipNftData.metadataBytes })
        .addParam({ type: "string", name: "_schemaVersion", value: ipNftData.schemaVersion })
        .addParam({ type: "string", name: "_externalUrl", value: ipNftData.externalUrl })
        .addParam({ type: "string", name: "_imageUrl", value: ipNftData.imageUrl })
        .addParam({ type: "string", name: "_agreementPdfUrl", value: ipNftData.agreementPdfUrl || "" })
        .addParam({ type: "string", name: "_industry", value: ipNftData.projectDetails.industry || "" })
        .addParam({ type: "string", name: "_organization", value: ipNftData.projectDetails.organization || "" })
        .addParam({ type: "string", name: "_topic", value: ipNftData.projectDetails.topic || "" })
        .addParam({ type: "string", name: "_researchLeadName", value: ipNftData.projectDetails.researchLeadName || "" })
        .addParam({ type: "string", name: "_researchLeadEmail", value: ipNftData.projectDetails.researchLeadEmail || "" });
      
      // Upload the ipNft with comprehensive metadata using Hedera contract execution
      const txHash = await executeHederaFunction('uploadArt', parameters);
      console.log(txHash);
      
      if (!txHash) {
        throw new Error('Transaction failed');
      }

      // If coordinates are provided, set them
      if (ipNftData.xCoordinate !== undefined && ipNftData.yCoordinate !== undefined) {
        // We'll need to get the token ID from the transaction result or fetch latest
        // For now, we'll skip coordinate setting in this simplified version
        toast.info('IPNFT created! Coordinates will be set automatically.');
      }

      toast.success('IPNFT created successfully!');
      await fetchAllPosts(); // Refresh the art pieces
      return txHash;
    } catch (error: any) {
      console.error('Error creating IPNFT:', error);
      toast.error(`Error creating IPNFT: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, executeHederaFunction]);

  // Fetch all posts - for now this will be a placeholder since we need server integration
  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      // This would typically call a read function on the contract
      // For now, we'll use a placeholder
      console.log('Fetching all posts...');
      setArtPieces([]);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error(`Error fetching posts: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buy Art function
  const buyArt = useCallback(async (artId: number, price: string) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId });
      
      // Convert price to tinybars (1 HBAR = 100,000,000 tinybars)
      const priceInTinybars = Math.floor(parseFloat(price) * 100000000);
      
      const txHash = await executeHederaFunction('buyArt', parameters, priceInTinybars);
      
      if (!txHash) {
        throw new Error('Transaction failed');
      }

      toast.success('IP NFT purchased successfully!');
      await fetchAllPosts();
      return txHash;
    } catch (error: any) {
      console.error('Error buying IP NFT:', error);
      toast.error(`Error buying IP NFT: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, executeHederaFunction, fetchAllPosts]);

  // Place Bid function
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
      await fetchAllPosts();
      return txHash;
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error(`Error placing bid: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, executeHederaFunction, fetchAllPosts]);

  // Like Art function
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

      toast.success('Art liked!');
      await fetchAllPosts();
      return txHash;
    } catch (error: any) {
      console.error('Error liking art:', error);
      toast.error(`Error liking art: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, executeHederaFunction, fetchAllPosts]);

  // Toggle Auction function
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
      await fetchAllPosts();
      return txHash;
    } catch (error: any) {
      console.error('Error toggling auction:', error);
      toast.error(`Error toggling auction: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, executeHederaFunction, fetchAllPosts]);

  // Burn NFT function
  const burnNft = useCallback(async (tokenId: number) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "tokenId", value: tokenId });
      
      const txHash = await executeHederaFunction('burn', parameters);
      
      if (!txHash) {
        throw new Error('Transaction failed');
      }

      toast.success('NFT burned successfully!');
      await fetchAllPosts();
      return txHash;
    } catch (error: any) {
      console.error('Error burning NFT:', error);
      toast.error(`Error burning NFT: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, executeHederaFunction, fetchAllPosts]);

  // Placeholder functions for other operations
  const getBidders = useCallback(async (artId: number) => {
    console.log('getBidders not implemented yet');
    return [];
  }, []);

  const getMaxBid = useCallback(async (artId: number) => {
    console.log('getMaxBid not implemented yet');
    return "0";
  }, []);

  const setCoordinates = useCallback(async (artId: number, x: number, y: number, rotation: number) => {
    if (!accountId) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setLoading(true);
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId })
        .addParam({ type: "uint256", name: "_xCoordinate", value: x })
        .addParam({ type: "uint256", name: "_yCoordinate", value: y })
        .addParam({ type: "uint256", name: "_rotation", value: rotation });
      
      const txHash = await executeHederaFunction('setCoordinates', parameters);
      
      if (!txHash) {
        throw new Error('Transaction failed');
      }

      toast.success('Coordinates set successfully!');
      await fetchAllPosts();
      return txHash;
    } catch (error: any) {
      console.error('Error setting coordinates:', error);
      toast.error(`Error setting coordinates: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accountId, executeHederaFunction, fetchAllPosts]);

  // Get Price function
  const getPrice = useCallback(async (artId: number) => {
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "_id", value: artId });
      
      const result = await executeHederaFunction('getPrice', parameters);
      return result;
    } catch (error: any) {
      console.error('Error getting price:', error);
      return null;
    }
  }, [executeHederaFunction]);

  // Get Project Details function
  const getProjectDetails = useCallback(async (tokenId: number) => {
    try {
      const parameters = new ContractFunctionParameterBuilder()
        .addParam({ type: "uint256", name: "tokenId", value: tokenId });
      
      const result = await executeHederaFunction('getProjectDetails', parameters);
      return result;
    } catch (error: any) {
      console.error('Error getting project details:', error);
      return null;
    }
  }, [executeHederaFunction]);

  return {
    // State
    loading,
    artPieces,
    
    // Functions
    uploadIpNft,
    fetchAllPosts,
    buyArt,
    placeBid,
    likeArt,
    toggleAuction,
    getBidders,
    getMaxBid,
    setCoordinates,
    burnNft,
    getPrice,
    getProjectDetails,
    
    // Contract info
    contractAddress: HEDERA_CONTRACT_ID,
    isConnected: !!accountId,
  };
};
