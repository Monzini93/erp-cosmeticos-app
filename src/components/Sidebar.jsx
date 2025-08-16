import React from 'react';
import { Home, Users, Archive, ClipboardList, Logo } from './Icons';

export function Sidebar({ setCurrentView, currentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'estoque', label: 'Estoque', icon: Archive },
    { id: 'ordens', label: 'Ordens de Serviço', icon: ClipboardList },
  ];

  return (
    <aside className="w-64 bg-[#042f2e] text-white flex flex-col">
      <div className="h-20 flex items-center justify-center border-b border-teal-800">
        <Logo />
        <span className="text-xl font-bold text-teal-100">Mutamba ERP</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
              currentView === item.id ? 'bg-teal-600' : 'hover:bg-teal-700'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}