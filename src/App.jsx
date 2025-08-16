import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './modules/Dashboard';
import { ClientesModule } from './modules/ClientesModule';
import { EstoqueModule } from './modules/EstoqueModule';
import { OrdensServicoModule } from './modules/OrdensServicoModule';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <ClientesModule />;
      case 'estoque':
        return <EstoqueModule />;
      case 'ordens':
        return <OrdensServicoModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar setCurrentView={setCurrentView} currentView={currentView} />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">{renderView()}</main>
    </div>
  );
}