import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, addDoc, onSnapshot, query,
    doc, updateDoc, deleteDoc, getDoc
} from 'firebase/firestore';
import { jsPDF } from 'jspdf';

// --- Ícones (SVG como componentes React) ---
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const Users = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const Archive = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>;
const ClipboardList = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;
const PlusCircle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const Edit = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const Trash2 = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <defs>
            <linearGradient id="logo-gradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#042f2e" />
            </linearGradient>
        </defs>
        <path d="M50 0 C20 45 20 70 50 100 C80 70 80 45 50 0 Z" fill="url(#logo-gradient)" />
    </svg>
);

// --- Configuração do Firebase (substitua com suas credenciais) ---
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Componente Principal ---
export default function App() {
    const [currentView, setCurrentView] = useState('dashboard');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard />;
            case 'clientes': return <ClientesModule />;
            case 'estoque': return <EstoqueModule />;
            case 'ordens': return <OrdensServicoModule />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar setCurrentView={setCurrentView} currentView={currentView} />
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                {renderView()}
            </main>
        </div>
    );
}

// --- Componentes de Layout ---
function Sidebar({ setCurrentView, currentView }) {
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
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${currentView === item.id ? 'bg-teal-600' : 'hover:bg-teal-700'}`}
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}

function Dashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="mt-2 text-gray-600">Bem-vindo ao sistema de gestão da Mutamba Cosmetics.</p>
        </div>
    );
}

// --- Módulo de Clientes ---
function ClientesModule() {
    const [clientes, setClientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "clientes"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setClientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleOpenModal = (client = null) => {
        setCurrentClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentClient(null);
        setIsModalOpen(false);
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
            await deleteDoc(doc(db, "clientes", id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Cadastro de Clientes</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Novo Cliente
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clientes.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.documento}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.contato}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenModal(c)} className="text-teal-600 hover:text-teal-800"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ClienteFormModal onClose={handleCloseModal} client={currentClient} />}
        </div>
    );
}

function ClienteFormModal({ onClose, client }) {
    const [formData, setFormData] = useState({
        nome: client?.nome || '',
        documento: client?.documento || '',
        contato: client?.contato || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (client) {
            await updateDoc(doc(db, "clientes", client.id), formData);
        } else {
            await addDoc(collection(db, "clientes"), formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="nome" placeholder="Nome / Razão Social" value={formData.nome} onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <input type="text" name="documento" placeholder="CPF / CNPJ" value={formData.documento} onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <input type="text" name="contato" placeholder="Telefone / Email" value={formData.contato} onChange={handleChange} className="w-full p-2 border rounded"/>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Módulo de Estoque de Matérias-Primas ---
function EstoqueModule() {
    const [materias, setMaterias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMateria, setCurrentMateria] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "materiasPrimas"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMaterias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleOpenModal = (materia = null) => {
        setCurrentMateria(materia);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setCurrentMateria(null);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta matéria-prima?")) {
            await deleteDoc(doc(db, "materiasPrimas", id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Estoque de Matérias-Primas</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nova Matéria-Prima
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque Atual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {materias.map(m => (
                            <tr key={m.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.unidade}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{m.estoque}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenModal(m)} className="text-teal-600 hover:text-teal-800"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <MateriaPrimaFormModal onClose={handleCloseModal} materia={currentMateria} />}
        </div>
    );
}

function MateriaPrimaFormModal({ onClose, materia }) {
    const [formData, setFormData] = useState({
        nome: materia?.nome || '',
        unidade: materia?.unidade || 'g',
        estoque: materia?.estoque || 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            estoque: Number(formData.estoque)
        };
        if (materia) {
            await updateDoc(doc(db, "materiasPrimas", materia.id), dataToSave);
        } else {
            await addDoc(collection(db, "materiasPrimas"), dataToSave);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{materia ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="nome" placeholder="Nome da Matéria-Prima" value={formData.nome} onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <select name="unidade" value={formData.unidade} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                        <option value="g">Gramas (g)</option>
                        <option value="kg">Quilogramas (kg)</option>
                        <option value="ml">Mililitros (ml)</option>
                        <option value="l">Litros (l)</option>
                    </select>
                    <input type="number" name="estoque" placeholder="Estoque" value={formData.estoque} onChange={handleChange} required className="w-full p-2 border rounded"/>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Módulo de Ordens de Serviço ---
function OrdensServicoModule() {
    const [ordens, setOrdens] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "ordensServico"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setOrdens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Ordens de Serviço</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nova Ordem de Serviço
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto Final</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ordens.map(o => (
                            <tr key={o.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.produtoFinal}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <OrdemServicoFormModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}

function OrdemServicoFormModal({ onClose }) {
    const [produtoFinal, setProdutoFinal] = useState('');
    const [ingredientes, setIngredientes] = useState([]);
    const [materiasDisponiveis, setMateriasDisponiveis] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "materiasPrimas"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMateriasDisponiveis(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const addIngrediente = () => {
        setIngredientes([...ingredientes, { materiaId: '', quantidade: 0 }]);
    };
    
    const handleIngredienteChange = (index, field, value) => {
        const novosIngredientes = [...ingredientes];
        novosIngredientes[index][field] = value;
        setIngredientes(novosIngredientes);
    };

    const generatePDF = (ordemData) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Ordem de Serviço - Mutamba Cosmetics", 14, 22);
        doc.setFontSize(12);
        doc.text(`Produto a ser Fabricado: ${ordemData.produtoFinal}`, 14, 32);
        doc.text(`Data: ${new Date(ordemData.createdAt.seconds * 1000).toLocaleDateString()}`, 14, 42);

        doc.setFontSize(14);
        doc.text("Receita / Matérias-Primas:", 14, 60);
        
        let y = 70;
        ordemData.ingredientes.forEach(ing => {
            const materia = materiasDisponiveis.find(m => m.id === ing.materiaId);
            if (materia) {
                doc.text(`- ${materia.nome}: ${ing.quantidade} ${materia.unidade}`, 20, y);
                y += 10;
            }
        });
        
        doc.save(`OS-${ordemData.produtoFinal}-${Date.now()}.pdf`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const ordemData = { produtoFinal, ingredientes, createdAt: new Date() };
        
        // Salvar a Ordem de Serviço no Firestore
        await addDoc(collection(db, "ordensServico"), ordemData);

        // Dar baixa no estoque
        const updates = ingredientes.map(async (ing) => {
            const materiaRef = doc(db, "materiasPrimas", ing.materiaId);
            const materiaSnap = await getDoc(materiaRef);
            if (materiaSnap.exists()) {
                const estoqueAtual = materiaSnap.data().estoque;
                const novoEstoque = estoqueAtual - Number(ing.quantidade);
                await updateDoc(materiaRef, { estoque: novoEstoque });
            }
        });

        await Promise.all(updates);
        
        // Gerar PDF
        const savedOrdem = { ...ordemData, createdAt: { seconds: Math.floor(Date.now() / 1000) } };
        generatePDF(savedOrdem);

        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Nova Ordem de Serviço</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nome do Produto Final (ex: Shampoo Hidratante)" value={produtoFinal} onChange={e => setProdutoFinal(e.target.value)} required className="w-full p-2 border rounded"/>
                    
                    <h3 className="font-bold">Ingredientes da Receita</h3>
                    {ingredientes.map((ing, index) => {
                        const materiaSelecionada = materiasDisponiveis.find(m => m.id === ing.materiaId);
                        return (
                            <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                                <select value={ing.materiaId} onChange={e => handleIngredienteChange(index, 'materiaId', e.target.value)} className="w-1/2 p-2 border rounded bg-white">
                                    <option value="">Selecione a matéria-prima...</option>
                                    {materiasDisponiveis.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                </select>
                                <input type="number" placeholder="Qtd" value={ing.quantidade} onChange={e => handleIngredienteChange(index, 'quantidade', e.target.value)} className="w-1/4 p-2 border rounded"/>
                                {materiaSelecionada && <span className="w-1/4 text-gray-600">Disp: {materiaSelecionada.estoque} {materiaSelecionada.unidade}</span>}
                            </div>
                        );
                    })}
                    <button type="button" onClick={addIngrediente} className="text-teal-600 font-semibold">+ Adicionar Ingrediente</button>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Salvar e Gerar PDF</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
