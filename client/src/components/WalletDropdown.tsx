import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
  WaterDrop as FaucetIcon,
  ExitToApp as DisconnectIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface WalletDropdownProps {
  accountId: string;
  onDisconnect: () => void;
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({ accountId, onDisconnect }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
    handleClose();
  };

  const openFaucet = () => {
    // Open Hedera testnet faucet
    window.open('https://portal.hedera.com/faucet', '_blank');
    handleClose();
  };

  const handleDisconnect = () => {
    onDisconnect();
    handleClose();
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
        sx={{
          ml: 'auto',
          borderRadius: 3,
          px: 2,
          py: 1,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            boxShadow: '0 4px 8px 3px rgba(33, 203, 243, .4)',
          },
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <WalletIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight="inherit">
            {truncateAddress(accountId)}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 280,
            mt: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Account Info */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Connected Account
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={<CheckIcon sx={{ fontSize: 16 }} />}
              label="Connected"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          </Box>
          <Typography 
            variant="body2" 
            fontFamily="monospace" 
            sx={{ 
              mt: 1, 
              p: 1, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              wordBreak: 'break-all',
              fontSize: '0.8rem'
            }}
          >
            {accountId}
          </Typography>
        </Box>

        {/* Actions */}
        <MenuItem onClick={copyToClipboard} sx={{ py: 1.5 }}>
          <ListItemIcon>
            {copied ? (
              <CheckIcon color="success" />
            ) : (
              <CopyIcon />
            )}
          </ListItemIcon>
          <ListItemText 
            primary={copied ? "Copied!" : "Copy Address"}
            secondary="Copy account ID to clipboard"
          />
        </MenuItem>

        <MenuItem onClick={openFaucet} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <FaucetIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Get Test HBAR"
            secondary="Open Hedera testnet faucet"
          />
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={handleDisconnect} 
          sx={{ 
            py: 1.5,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.50'
            }
          }}
        >
          <ListItemIcon>
            <DisconnectIcon color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Disconnect"
            secondary="Disconnect wallet"
            primaryTypographyProps={{ color: 'error.main' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};
