import React from 'react';
import { Menu, Search, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-green-600 focus:outline-none focus:text-green-600 md:hidden"
              onClick={onMenuClick}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-gray-800">
                Cabinet de Kinésiologie
              </h1>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-4 md:mx-8">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="text-gray-500 hover:text-green-600 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-green-600 focus:outline-none"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                KT
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;