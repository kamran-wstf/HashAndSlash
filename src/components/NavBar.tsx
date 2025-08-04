import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, BarChart, HelpCircle } from 'lucide-react';

import {WalletConnect }from './WalletConnect';
import { playSound } from '../utils/audio';

const NavBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = () => {
    playSound('navigate');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-xl font-bold text-ink-800 flex items-center gap-2"
            onClick={handleNavClick}
          >
            Sudoku
          </Link>
          <nav className="flex gap-1">
            <Link
              to="/"
              className={`p-2 rounded-md ${isActive('/') ? 'bg-paper-200' : 'hover:bg-paper-200'}`}
              onClick={handleNavClick}
              aria-label="Home"
            >
              <Home size={20} />
            </Link>
            <Link
              to="/how-to-play"
              className={`p-2 rounded-md ${isActive('/how-to-play') ? 'bg-paper-200' : 'hover:bg-paper-200'}`}
              onClick={handleNavClick}
              aria-label="How to Play"
            >
              <HelpCircle size={20} />
            </Link>
            <Link
              to="/statistics"
              className={`p-2 rounded-md ${isActive('/statistics') ? 'bg-paper-200' : 'hover:bg-paper-200'}`}
              onClick={handleNavClick}
              aria-label="Statistics"
            >
              <BarChart size={20} />
            </Link>
            <Link
              to="/settings"
              className={`p-2 rounded-md ${isActive('/settings') ? 'bg-paper-200' : 'hover:bg-paper-200'}`}
              onClick={handleNavClick}
              aria-label="Settings"
            >
              <Settings size={20} />
            </Link>
          </nav>
        </div>
        <div className="flex justify-end">
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};

export default NavBar;