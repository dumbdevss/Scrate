import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Alert,
  Badge,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Gavel as GavelIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Copyright as CopyrightIcon,
  Verified as VerifiedIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Tag as TagIcon,
  Link as LinkIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  AccountBalanceWallet as WalletIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Shared styles for consistent theming
const cardStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 2,
  color: 'white'
};

const priceChipStyle = {
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  height: 40
};

const tabStyle = {
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': { color: 'white' }
};

interface IPNFTMarketplaceModalProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    link?: string; // Alternative image URL field
    price: string | number;
    owner: string;
    by?: string; // Alternative owner field
    creator?: string;
    likes: number;
    auctionActive: boolean;
    sold: boolean;
    maxBid: string;
    maxBidder: string;
    currentBid?: number;
    network?: string;
    // IP-specific fields
    ipType?: string;
    tags?: string[];
    contentHash?: string;
    schemaVersion?: string;
    externalUrl?: string;
    createdAt?: number;
    isActive?: boolean;
    agreementPdfUrl?: string;
    // Flattened project details to match server structure
    industry?: string;
    organization?: string;
    topic?: string;
    researchLeadName?: string;
    researchLeadEmail?: string;
    projectDetails?: any; // Keep for backward compatibility
  };
  onBuy: (id: string) => Promise<void>;
  onPlaceBid: (id: string, amount: string) => Promise<void>;
  onLike: (id: string) => Promise<void>;
  onToggleAuction?: (id: string) => Promise<void>;
  currentUser?: string;
  loading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ipnft-tabpanel-${index}`}
      aria-labelledby={`ipnft-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Helper function to get IP type icon
const getIPTypeIcon = (ipType: string) => {
  switch (ipType.toLowerCase()) {
    case 'patent':
      return <SecurityIcon />;
    case 'trademark':
      return <BusinessIcon />;
    case 'copyright':
      return <CopyrightIcon />;
    case 'trade secret':
      return <SecurityIcon />;
    case 'digital art':
      return <CategoryIcon />;
    default:
      return <InfoIcon />;
  }
};

// Helper function to get IP type color
const getIPTypeColor = (ipType: string) => {
  switch (ipType.toLowerCase()) {
    case 'patent':
      return '#2196F3';
    case 'trademark':
      return '#FF9800';
    case 'copyright':
      return '#4CAF50';
    case 'trade secret':
      return '#9C27B0';
    case 'digital art':
      return '#E91E63';
    default:
      return '#607D8B';
  }
};

export const IPNFTMarketplaceModal: React.FC<IPNFTMarketplaceModalProps> = ({
  open,
  onClose,
  item,
  onBuy,
  onPlaceBid,
  onLike,
  onToggleAuction,
  currentUser,
  loading = false
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(item.likes);
  const [ownershipChanged, setOwnershipChanged] = useState(false);

  useEffect(() => {
    setLocalLikes(item.likes);
  }, [item.likes]);

  // Watch for ownership changes and show notification
  useEffect(() => {
    const isNewOwner = currentUser === item.owner || currentUser === item.by;
    if (isNewOwner && !ownershipChanged && item.sold) {
      setOwnershipChanged(true);
      // Auto-switch to Owner Panel tab if user just became owner
      setTimeout(() => {
        setTabValue(4);
      }, 1000);
    }
  }, [item.owner, item.by, item.sold, currentUser, ownershipChanged]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBuy = async () => {
    try {
      await onBuy(item.id);
      // Success handling is done in App.jsx
    } catch (error) {
      toast.error('Purchase failed');
    }
  };

  console.log(item)

  const handlePlaceBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }
    
    const currentMaxBid = parseFloat(item.maxBid);
    if (parseFloat(bidAmount) <= currentMaxBid) {
      toast.error(`Bid must be higher than current bid of ${currentMaxBid} HBAR`);
      return;
    }

    try {
      await onPlaceBid(item.id, bidAmount);
      // Success handling is done in App.jsx
      setBidAmount('');
    } catch (error) {
      toast.error('Failed to place bid');
    }
  };

  const handleLike = async () => {
    try {
      await onLike(item.id);
      setLiked(!liked);
      setLocalLikes(prev => liked ? prev - 1 : prev + 1);
      toast.success(liked ? 'Unliked!' : 'Liked!');
    } catch (error) {
      toast.error('Failed to like');
    }
  };

  const handleToggleAuction = async () => {
    if (!onToggleAuction) return;
    try {
      await onToggleAuction(item.id);
      // Success handling is done in App.jsx
    } catch (error) {
      toast.error('Failed to toggle auction');
    }
  };

  const isOwner = currentUser === item.owner || currentUser === item.by;
  const canBuy = !item.sold && !item.auctionActive && !isOwner;
  const canBid = item.auctionActive && !item.sold && !isOwner;
  const createdDate = item.createdAt ? new Date(item.createdAt * 1000).toLocaleDateString() : 'Unknown';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          overflow: 'hidden',
          maxHeight: '90vh'
        },
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.7 },
          '100%': { opacity: 1 }
        }
      }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 350,
            borderRadius: 2,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {(item.imageUrl || item.link) ? (
            <img
              src={item.imageUrl || item.link}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                console.error('Image failed to load:', item.imageUrl || item.link);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', item.imageUrl || item.link);
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <Typography variant="h6">No Image Available</Typography>
            </Box>
          )}
          
          {/* Top right controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              gap: 1
            }}
          >
            <IconButton
              onClick={handleLike}
              sx={{
                background: 'rgba(0, 0, 0, 0.5)',
                color: liked ? '#ff4757' : 'white',
                '&:hover': { background: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <Badge badgeContent={localLikes} color="error">
                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </Badge>
            </IconButton>
            <IconButton
              onClick={onClose}
              sx={{
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': { background: 'rgba(0, 0, 0, 0.7)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Status and IP type indicators */}
          <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {/* Owner Badge - Most Prominent */}
              {isOwner && (
                <Chip 
                  label="YOU OWN THIS"
                  icon={<SecurityIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    animation: 'pulse 2s infinite'
                  }}
                />
              )}
              
              {/* IP Type Badge */}
              {item.ipType && (
                <Chip 
                  label={item.ipType}
                  icon={getIPTypeIcon(item.ipType)}
                  sx={{
                    background: getIPTypeColor(item.ipType),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              )}
              
              {/* Status badges */}
              {item.sold && (
                <Chip label="SOLD" color="error" size="small" />
              )}
              {item.auctionActive && !item.sold && (
                <Chip 
                  label="LIVE AUCTION" 
                  color="success" 
                  size="small"
                  icon={<GavelIcon />}
                />
              )}
              {item.isActive && (
                <Chip 
                  label="ACTIVE" 
                  color="success" 
                  size="small"
                  icon={<VerifiedIcon />}
                />
              )}
            </Stack>
            
            {/* Network badge */}
            {item.network && (
              <Chip 
                label={`${item.network.toUpperCase()} NETWORK`} 
                variant="outlined" 
                size="small"
                sx={{ 
                  mt: 1, 
                  color: 'white', 
                  borderColor: 'white',
                  background: 'rgba(0, 0, 0, 0.3)'
                }}
              />
            )}
          </Box>

          {/* Bottom overlay with key info */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
              p: 2
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {item.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip 
                label={`Token #${item.id}`}
                size="small"
                sx={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
              <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                Created: {createdDate}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 3 }}>
        {/* Owner and Creator Info */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <WalletIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                    Current Owner
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {item.owner.slice(0, 8)}...{item.owner.slice(-6)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            {item.creator && item.creator !== item.owner && (
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                      Original Creator
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {item.creator.slice(0, 8)}...{item.creator.slice(-6)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Price Display */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          {item.auctionActive ? (
            <Box>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                Current Highest Bid
              </Typography>
              <Chip 
                label={`${item.maxBid} HBAR`}
                icon={<GavelIcon />}
                sx={priceChipStyle}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                Purchase Price
              </Typography>
              <Chip 
                label={`${item.price} HBAR`}
                icon={<ShoppingCartIcon />}
                sx={priceChipStyle}
              />
            </Box>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Marketplace" sx={tabStyle} />
            <Tab label="IP Details" sx={tabStyle} />
            <Tab label="Verification" sx={tabStyle} />
            <Tab label="History" sx={tabStyle} />
            {isOwner && <Tab label="Owner Panel" sx={tabStyle} />}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Buy/Bid Actions */}
            {!isOwner && (
              <Grid item xs={12} md={6}>
                <Card sx={cardStyle}>
                  <CardContent>
                    {canBuy && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Purchase IP NFT
                        </Typography>
                        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
                          Acquire full ownership rights to this intellectual property
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handleBuy}
                          disabled={loading}
                          sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)'
                            }
                          }}
                        >
                          {loading ? 'Processing...' : `Buy for ${item.price} HBAR`}
                        </Button>
                      </Box>
                    )}

                    {canBid && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Place Bid
                        </Typography>
                        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
                          Current highest bid: {item.maxBid} HBAR
                        </Typography>
                        <TextField
                          fullWidth
                          label="Bid Amount (HBAR)"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          type="number"
                          sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              color: 'white',
                              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                              '&.Mui-focused fieldset': { borderColor: 'white' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                          }}
                        />
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handlePlaceBid}
                          disabled={loading || !bidAmount}
                          sx={{
                            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)'
                            }
                          }}
                        >
                          {loading ? 'Processing...' : 'Place Bid'}
                        </Button>
                      </Box>
                    )}

                    {item.sold && (
                      <Alert severity="info" sx={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                        This IP NFT has been sold
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <Grid item xs={12} md={6}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      You Own This IP NFT
                    </Typography>
                    
                    <Alert severity="success" sx={{ mb: 2, background: 'rgba(76, 175, 80, 0.1)' }}>
                      <Typography variant="body2">
                        🎉 You are the verified owner of this intellectual property
                      </Typography>
                    </Alert>
                    
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
                      As the owner, you have full rights to this IP and can manage its sale or auction.
                      Visit the <strong>Owner Panel</strong> tab for detailed management options.
                    </Typography>
                    
                    {onToggleAuction && (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleToggleAuction}
                        disabled={loading}
                        color={item.auctionActive ? "error" : "success"}
                        sx={{ mb: 1 }}
                      >
                        {loading ? 'Processing...' : (item.auctionActive ? 'End Auction' : 'Start Auction')}
                      </Button>
                    )}
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setTabValue(4)}
                      sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': { borderColor: 'white' }
                      }}
                    >
                      Go to Owner Panel
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Statistics */}
            <Grid item xs={12} md={isOwner ? 6 : 6}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    IP NFT Statistics
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><FavoriteIcon sx={{ color: '#ff4757' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Likes" 
                        secondary={localLikes}
                        sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SecurityIcon sx={{ color: '#2196F3' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Status" 
                        secondary={item.sold ? 'Sold' : item.auctionActive ? 'On Auction' : 'Available'}
                        sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><VerifiedIcon sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Verification" 
                        secondary={item.isActive !== undefined ? (item.isActive ? 'Active & Verified' : 'Pending') : 'Unknown'}
                        sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    IP Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {item.description || 'No description provided for this intellectual property.'}
                  </Typography>
                  
                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                  
                  <Typography variant="h6" gutterBottom>
                    <TagIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Tags & Categories
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                        No tags specified
                      </Typography>
                    )}
                  </Box>

                  {/* Project Details Section */}
                  {(item.projectDetails || item.industry || item.organization || item.topic || item.researchLeadName) && (
                    <>
                      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                      <Typography variant="h6" gutterBottom>
                        <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Project Details
                      </Typography>
                      <Grid container spacing={2}>
                        {(item.projectDetails?.industry || item.industry) && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                              Industry
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                              {item.projectDetails?.industry || item.industry}
                            </Typography>
                          </Grid>
                        )}
                        {(item.projectDetails?.organization || item.organization) && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                              Organization
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                              {item.projectDetails?.organization || item.organization}
                            </Typography>
                          </Grid>
                        )}
                        {(item.projectDetails?.topic || item.topic) && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                              Research Topic
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                              {item.projectDetails?.topic || item.topic}
                            </Typography>
                          </Grid>
                        )}
                        {(item.projectDetails?.researchLeadName || item.researchLeadName) && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                              Research Lead
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {item.projectDetails?.researchLeadName || item.researchLeadName}
                            </Typography>
                            {(item.projectDetails?.researchLeadEmail || item.researchLeadEmail) && (
                              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                                {item.projectDetails?.researchLeadEmail || item.researchLeadEmail}
                              </Typography>
                            )}
                          </Grid>
                        )}
                      </Grid>
                    </>
                  )}

                  {/* Agreement PDF Section */}
                  {item.agreementPdfUrl && (
                    <>
                      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                      <Typography variant="h6" gutterBottom>
                        <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Legal Documentation
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        href={item.agreementPdfUrl}
                        target="_blank"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          '&:hover': { borderColor: 'white' }
                        }}
                      >
                        View Agreement PDF
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Technical Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Token ID" 
                        secondary={`#${item.id}`}
                        sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                      />
                    </ListItem>
                    {item.ipType && (
                      <ListItem>
                        <ListItemText 
                          primary="IP Type" 
                          secondary={item.ipType}
                          sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                        />
                      </ListItem>
                    )}
                    {item.schemaVersion && (
                      <ListItem>
                        <ListItemText 
                          primary="Schema Version" 
                          secondary={item.schemaVersion}
                          sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="Network" 
                        secondary={item.network?.toUpperCase() || 'HEDERA'}
                        sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Created" 
                        secondary={createdDate}
                        sx={{ '& .MuiListItemText-secondary': { color: 'white' } }}
                      />
                    </ListItem>
                  </List>
                  
                  {item.externalUrl && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      href={item.externalUrl}
                      target="_blank"
                      sx={{ 
                        mt: 2,
                        color: 'white', 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': { borderColor: 'white' }
                      }}
                    >
                      View External Link
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Blockchain Verification
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
                    Content Hash (IPFS)
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      background: 'rgba(0, 0, 0, 0.3)', 
                      p: 1, 
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {item.contentHash || 'Not available'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
                    Owner Address
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      background: 'rgba(0, 0, 0, 0.3)', 
                      p: 1, 
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {item.owner}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Alert severity="success" sx={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                  <Typography variant="body2">
                    ✅ This IP NFT is verified on the Hedera blockchain and its authenticity is guaranteed by cryptographic proof.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Transaction History
              </Typography>
              <Alert severity="info" sx={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                <Typography variant="body2">
                  Transaction history and ownership transfers will be displayed here once the feature is implemented.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Owner Panel Tab */}
        {isOwner && (
          <TabPanel value={tabValue} index={4}>
            {/* Ownership Celebration Banner */}
            {ownershipChanged && (
              <Box sx={{ mb: 3 }}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiAlert-icon': { color: 'white' }
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    🎉 Congratulations! You are now the owner of this IP NFT!
                  </Typography>
                  <Typography variant="body2">
                    You now have full rights to this intellectual property and can manage its sale or auction from this panel.
                  </Typography>
                </Alert>
              </Box>
            )}
            
            <Grid container spacing={3}>
              {/* Auction Management */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Auction Management
                    </Typography>
                    
                    {item.auctionActive ? (
                      <Box>
                        <Alert severity="success" sx={{ mb: 2, background: 'rgba(76, 175, 80, 0.1)' }}>
                          <Typography variant="body2">
                            🔴 Your auction is currently LIVE
                          </Typography>
                        </Alert>
                        
                        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
                          Current highest bid: <strong>{item.maxBid} HBAR</strong>
                          {item.maxBidder && (
                            <><br />Highest bidder: {item.maxBidder.slice(0, 8)}...{item.maxBidder.slice(-6)}</>
                          )}
                        </Typography>
                        
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handleToggleAuction}
                          disabled={loading}
                          color="error"
                          sx={{ mb: 2 }}
                        >
                          {loading ? 'Processing...' : 'End Auction'}
                        </Button>
                        
                        <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                          Ending the auction will transfer ownership to the highest bidder if there are any bids.
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Alert severity="info" sx={{ mb: 2, background: 'rgba(33, 150, 243, 0.1)' }}>
                          <Typography variant="body2">
                            Your IP NFT is available for direct purchase at {item.price} HBAR
                          </Typography>
                        </Alert>
                        
                        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
                          Start an auction to allow competitive bidding on your intellectual property.
                        </Typography>
                        
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handleToggleAuction}
                          disabled={loading || item.sold}
                          color="success"
                        >
                          {loading ? 'Processing...' : 'Start Auction'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Ownership Information */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Ownership Rights
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon><VerifiedIcon sx={{ color: '#4CAF50' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Full IP Rights" 
                          secondary="You own all intellectual property rights"
                          sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><GavelIcon sx={{ color: '#FF9800' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Transfer Rights" 
                          secondary="You can sell or auction this IP NFT"
                          sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CopyrightIcon sx={{ color: '#2196F3' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Commercial Use" 
                          secondary="You can commercially exploit this IP"
                          sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SecurityIcon sx={{ color: '#9C27B0' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Legal Protection" 
                          secondary="Blockchain-verified ownership proof"
                          sx={{ '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' } }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Revenue & Analytics */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <WalletIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Revenue Analytics
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                        Current Value
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                        {item.auctionActive ? `${item.maxBid} HBAR` : `${item.price} HBAR`}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                        Engagement
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FavoriteIcon sx={{ color: '#ff4757', fontSize: 20 }} />
                          <Typography variant="body1" fontWeight="medium">
                            {localLikes} likes
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 1 }}>
                      Status: <strong>{item.sold ? 'Sold' : item.auctionActive ? 'On Auction' : 'Available'}</strong>
                    </Typography>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                      Listed: {createdDate}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Asset Management */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Asset Management
                    </Typography>
                    
                    <Stack spacing={2}>
                      {/* View Agreement */}
                      {item.agreementPdfUrl && (
                        <Button
                          variant="outlined"
                          startIcon={<DescriptionIcon />}
                          href={item.agreementPdfUrl}
                          target="_blank"
                          sx={{ 
                            color: 'white', 
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': { borderColor: 'white' }
                          }}
                        >
                          View Legal Agreement
                        </Button>
                      )}
                      
                      {/* External Link */}
                      {item.externalUrl && (
                        <Button
                          variant="outlined"
                          startIcon={<LinkIcon />}
                          href={item.externalUrl}
                          target="_blank"
                          sx={{ 
                            color: 'white', 
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': { borderColor: 'white' }
                          }}
                        >
                          View External Resource
                        </Button>
                      )}
                      
                      {/* Contact Information */}
                      {(item.researchLeadEmail || item.projectDetails?.researchLeadEmail) && (
                        <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 1 }}>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" gutterBottom>
                            Research Contact
                          </Typography>
                          <Typography variant="body2">
                            {item.researchLeadName || item.projectDetails?.researchLeadName || 'Research Lead'}
                          </Typography>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                            {item.researchLeadEmail || item.projectDetails?.researchLeadEmail}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Ownership Verification */}
              <Grid item xs={12}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Ownership Verification
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <VerifiedIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 1 }} />
                          <Typography variant="h6" gutterBottom>Verified Owner</Typography>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                            Your ownership is cryptographically verified on the Hedera blockchain
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <SecurityIcon sx={{ fontSize: 48, color: '#2196F3', mb: 1 }} />
                          <Typography variant="h6" gutterBottom>Secure Transfer</Typography>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                            All transfers are secured by smart contracts and blockchain technology
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <CopyrightIcon sx={{ fontSize: 48, color: '#FF9800', mb: 1 }} />
                          <Typography variant="h6" gutterBottom>IP Protection</Typography>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                            Your intellectual property rights are protected and immutable
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IPNFTMarketplaceModal;
