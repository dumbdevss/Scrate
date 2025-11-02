import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Stack, 
  Typography, 
  Box, 
  Divider,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  IconButton
} from "@mui/material";
import { Close as CloseIcon, Security as SecurityIcon, AccountBalanceWallet as WalletIcon } from "@mui/icons-material";
import { connectToMetamask } from "../services/wallets/metamask/metamaskClient";
import { openWalletConnectModal } from "../services/wallets/walletconnect/walletConnectClient";
import MetamaskLogo from "../assets/metamask-logo.svg";
import WalletConnectLogo from "../assets/walletconnect-logo.svg";
import { useState } from "react";


interface WalletSelectionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: (value: string) => void;
}

export const WalletSelectionDialog = (props: WalletSelectionDialogProps) => {
  const { onClose, open, setOpen } = props;
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleWalletConnect = async () => {
    if (!termsAccepted) {
      return;
    }
    await openWalletConnectModal();
    setOpen(false);
  };

  const handleMetamaskConnect = async () => {
    if (!termsAccepted) {
      return;
    }
    await connectToMetamask();
    setOpen(false);
  };

  const handleClose = () => {
    setTermsAccepted(false);
    onClose('');
  };

  return (
    <Dialog 
      onClose={handleClose} 
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <WalletIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Connect Your Wallet
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          Connect your wallet to start minting, buying, and selling IPNFTs in the Meta Gallery. 
          Choose from our supported wallet providers below.
        </Typography>

        <Stack spacing={3}>
          {/* Security Notice */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              bgcolor: 'primary.50', 
              border: '1px solid', 
              borderColor: 'primary.200',
              borderRadius: 2
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <SecurityIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="semibold">
                Secure Connection
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Your wallet connection is encrypted and secure. We never store your private keys or seed phrases.
            </Typography>
          </Paper>

          {/* Wallet Options */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold' }}>
              Choose Your Wallet
            </Typography>
            
            <Stack spacing={2}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleWalletConnect}
                disabled={!termsAccepted}
                sx={{
                  p: 2.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: termsAccepted ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50'
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <img
                    src={WalletConnectLogo}
                    alt='WalletConnect logo'
                    style={{
                      width: '40px',
                      height: '40px'
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="semibold">
                      WalletConnect
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connect with 300+ wallets including HashPack, Blade, and more
                    </Typography>
                  </Box>
                </Box>
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleMetamaskConnect}
                disabled={!termsAccepted}
                sx={{
                  p: 2.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: termsAccepted ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50'
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <img
                    src={MetamaskLogo}
                    alt='MetaMask logo'
                    style={{
                      width: '40px',
                      height: '40px'
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="semibold">
                      MetaMask
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Popular browser extension wallet with Hedera support
                    </Typography>
                  </Box>
                </Box>
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, flexDirection: 'column', alignItems: 'stretch' }}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Terms and Agreement */}
        <FormControlLabel
          control={
            <Checkbox 
              checked={termsAccepted} 
              onChange={(e) => setTermsAccepted(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              I agree to the{' '}
              <Link href="#" underline="hover" color="primary">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="#" underline="hover" color="primary">
                Privacy Policy
              </Link>
              . I understand that blockchain transactions are irreversible.
            </Typography>
          }
          sx={{ alignItems: 'flex-start', mb: 1 }}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          By connecting your wallet, you acknowledge that you understand the risks associated with 
          blockchain technology and cryptocurrency transactions.
        </Typography>
      </DialogActions>
    </Dialog>
  );
};