
import React from 'react';
import { View } from '../types';
import Icon from './Icon';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  onImportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, onImportClick }) => {
  const NavButton: React.FC<{ view: View; label: string; icon: string }> = ({ view, label, icon }) => (
    <button
      onClick={() => setView(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
        currentView === view
          ? 'bg-primary text-white shadow'
          : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
      }`}
    >
      <Icon name={icon} className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icon name="sparkles" className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-800">Grocery Genius</h1>
          </div>

          <nav className="hidden md:flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            <NavButton view={View.Lists} label="Lists" icon="list" />
            <NavButton view={View.Recipes} label="Recipes" icon="book-open" />
          </nav>
          
          <button
            onClick={onImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-green-600 transition-colors shadow font-medium"
          >
            <Icon name="upload" className="w-5 h-5" />
            <span className="hidden sm:inline">Import Recipe</span>
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-center gap-2 p-2 bg-gray-50 border-t">
        <NavButton view={View.Lists} label="Lists" icon="list" />
        <NavButton view={View.Recipes} label="Recipes" icon="book-open" />
      </nav>
    </header>
  );
};

export default Header;
