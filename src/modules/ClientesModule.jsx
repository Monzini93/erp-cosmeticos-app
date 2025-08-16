import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Edit, Trash2 } from '../components/Icons';

function ClienteFormModal({ onClose, client }) {
  const [formData, setFormData] = useState({
    nome: client?.nome || '',
    documento: client?.documento || '',
    contato: client?.contato || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (client) {
      await updateDoc(doc(db, 'clientes', client.id), formData);
    } else {
      await addDoc(collection(db, 'clientes'), formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{client ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="nome" placeholder="Nome / Razão Social" value={formData.nome} onChange={handleChange} required className="w-full p-2 border rounded" />
          <input type="text" name="documento" placeholder="CPF / CNPJ" value={formData.documento} onChange={handleChange} required className="w-full p-2 border rounded" />
          <input type="text" name="contato" placeholder="Telefone / Email" value={formData.contato} onChange={handleChange} className="w-full p-2 border rounded" />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClientesModule() {
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'clientes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClientes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
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
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteDoc(doc(db, 'clientes', id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cadastro de Clientes</h1>
        <button type="button" onClick={() => handleOpenModal()} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200">
          <PlusCircle className="h-5 w-5 mr-2" /> Novo Cliente
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
            {clientes.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.documento}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.contato}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button type="button" onClick={() => handleOpenModal(c)} className="text-teal-600 hover:text-teal-800"><Edit className="w-5 h-5" /></button>
                  <button type="button" onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
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
