import { WalletSelectionDialog } from './WalletSelectionDialog';
import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useWalletInterface } from '../services/wallets/useWalletInterface';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();

  const handleConnect = async () => {
    if (accountId) {
      walletInterface.disconnect();
    } else {
      setOpen(true);
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

        <Button
          variant='contained'
          sx={{
            ml: "auto"
          }}
          onClick={handleConnect}
        >
          {accountId ? `Connected: ${accountId}` : 'Connect Wallet'}
        </Button>
        <WalletSelectionDialog open={open} setOpen={setOpen} onClose={() => setOpen(false)} />
      </div>
    </nav>


  );
};

export default Navbar;
