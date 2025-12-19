
import React, { useState } from 'react';
import { 
  BookOpen, 
  Library, 
  Heart, 
  PlusCircle, 
  Search, 
  ShoppingCart, 
  Menu, 
  User as UserIcon, 
  LayoutDashboard, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  user: User | null;
  onLogout: () => void;
  role: 'buyer' | 'seller' | null;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  searchQuery, 
  setSearchQuery, 
  cartCount,
  user,
  onLogout,
  role
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getLinkClass = (view: ViewState) => {
    const isActive = currentView === view;
    return `flex flex-col md:flex-row items-center gap-1 transition cursor-pointer ${isActive ? 'text-yellow-300' : 'hover:text-slate-200 text-white'}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer gap-2 min-w-fit"
            onClick={() => setView(role === 'seller' ? 'dashboard' : 'store')}
          >
            <div className="italic font-bold text-xl tracking-tighter flex flex-col leading-none">
              <span className="text-lg">Emarket</span>
              <span className="text-[10px] text-yellow-400 font-medium not-italic flex items-center gap-0.5">
                {role === 'seller' ? 'Seller Hub' : 'Plus ✦'}
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <input
              type="text"
              className="w-full h-9 pl-4 pr-10 rounded-sm text-slate-900 focus:outline-none shadow-sm text-sm"
              placeholder="Search for books, authors and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2 text-[#2874f0]" size={20} />
          </div>

          <div className="flex items-center space-x-6 text-sm font-medium">
            
            {role === 'seller' && (
              <>
                <button 
                  onClick={() => setView('dashboard')}
                  className={getLinkClass('dashboard')}
                >
                  <LayoutDashboard size={20} />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                <button 
                  onClick={() => setView('sell')}
                  className={`hidden md:flex items-center gap-1 transition px-4 py-1 rounded-sm shadow-sm font-semibold ${currentView === 'sell' ? 'bg-slate-100 text-[#2874f0]' : 'bg-white text-[#2874f0] hover:bg-slate-50'}`}
                >
                  <PlusCircle size={16} />
                  Sell
                </button>
              </>
            )}

            {role === 'buyer' && (
              <>
                <button onClick={() => setView('library')} className={getLinkClass('library')}>
                  <Library size={20} />
                  <span className="hidden md:inline">Library</span>
                </button>
                <button onClick={() => setView('wishlist')} className={getLinkClass('wishlist')}>
                  <Heart size={20} />
                  <span className="hidden md:inline">Wishlist</span>
                </button>
                <button onClick={() => setView('cart')} className={`${getLinkClass('cart')} relative`}>
                  <div className="relative">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:inline">Cart</span>
                </button>
              </>
            )}

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:text-slate-200 transition"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={18} />
                  )}
                </div>
                <span className="hidden lg:inline">{user?.displayName?.split(' ')[0] || 'User'}</span>
                <ChevronDown size={14} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-400 font-bold uppercase">Role</p>
                      <p className="text-sm font-bold text-indigo-600 capitalize">{role}</p>
                    </div>
                    <button 
                      onClick={() => { onLogout(); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
