// --- ARQUIVO: src/App.jsx ---
// Arquivo principal que monta a aplicação e gerencia a autenticação.

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './modules/Dashboard';
import { ClientesModule } from './modules/ClientesModule';
import { EstoqueModule } from './modules/EstoqueModule';
import { OrdensServicoModule } from './modules/OrdensServicoModule';
import { LoginModule } from './modules/LoginModule';
import { LogOut } from './components/Icons'; // Importando o ícone de logout

// Componente para o layout principal do ERP (quando o usuário está logado)
function MainLayout({ user }) {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

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
      <main className="flex-1 flex flex-col p-6 lg:p-10 overflow-hidden">
        <div className="flex justify-between items-center mb-8">
            <div/> {/* Div vazia para empurrar o botão para a direita */}
            <button 
                onClick={handleLogout} 
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
            >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
            </button>
        </div>
        <div className="flex-1 overflow-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}


// Componente principal que gerencia o estado de autenticação
export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é um "ouvinte" que notifica sobre mudanças no login/logout
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  // Mostra uma tela de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-500">Carregando...</p>
      </div>
    );
  }

  // Renderiza a tela de Login ou o Painel Principal
  return (
    <div>
      {user ? <MainLayout user={user} /> : <LoginModule />}
    </div>
  );
}