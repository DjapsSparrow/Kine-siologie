import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, FileText, Users, Calendar, PenTool as Tool, BookOpen, FileEdit, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Accueil' },
    { to: '/protocols', icon: <FileText size={20} />, label: 'Protocoles' },
    { to: '/clients', icon: <Users size={20} />, label: 'Clients' },
    { to: '/appointments', icon: <Calendar size={20} />, label: 'Rendez-vous' },
    { to: '/tools', icon: <Tool size={20} />, label: 'Mes outils' },
    { to: '/journal', icon: <BookOpen size={20} />, label: 'Journal' },
    { to: '/reports', icon: <FileEdit size={20} />, label: 'Rapports' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Réglages' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:sticky top-0 h-full z-50 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:translate-x-0 w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-green-700">Cabinet de Kinésiologie</h2>
            <button
              className="md:hidden text-gray-500 hover:text-gray-800"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => onClose()}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
              KT
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Thérapeute</p>
              <p className="text-xs text-gray-500">Cabinet de Kinésiologie</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;