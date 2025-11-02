import { WalletSelectionDialog } from './WalletSelectionDialog';
import { WalletDropdown } from './WalletDropdown';
import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useWalletInterface } from '../services/wallets/useWalletInterface';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();

  const handleConnect = async () => {
    setOpen(true);
  };

  const handleDisconnect = () => {
    if (walletInterface) {
      walletInterface.disconnect();
    }
  };

  useEffect(() => {
    if (accountId) {
      setOpen(false);
    }
  }, [accountId])

  return (
    <nav className="bg-gray-900 border-b border-gray-700 shadow-sm">
      <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-3">
          <span className="self-center text-2xl font-bold text-white">
            Meta Gallery
          </span>
        </a>

        {accountId ? (
          <WalletDropdown 
            accountId={accountId} 
            onDisconnect={handleDisconnect}
          />
        ) : (
          <Button
            variant='contained'
            sx={{
              ml: "auto",
              borderRadius: 3,
              px: 3,
              py: 1,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                boxShadow: '0 4px 8px 3px rgba(255, 105, 135, .4)',
              },
              textTransform: 'none',
              fontWeight: 600
            }}
            onClick={handleConnect}
          >
            Connect Wallet
          </Button>
        )}
        <WalletSelectionDialog open={open} setOpen={setOpen} onClose={() => setOpen(false)} />
      </div>
    </nav>


  );
};

export default Navbar;
