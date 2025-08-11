import { CampModal } from '@campnetwork/origin/react';

const Navbar = () => {
 

  return (
    <nav className="bg-gray-900 border-b border-gray-700 shadow-sm">
    <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
      <a href="/" className="flex items-center space-x-3">
        <span className="self-center text-2xl font-bold text-white">
          Meta Gallery
        </span>
      </a>
  
      <CampModal/>
    </div>
  </nav>
  

  );
};

export default Navbar;
