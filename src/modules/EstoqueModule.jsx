import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Edit, Trash2 } from '../components/Icons';

function MateriaPrimaFormModal({ onClose, materia }) {
  const [formData, setFormData] = useState({
    nome: materia?.nome || '',
    unidade: materia?.unidade || 'g',
    estoque: materia?.estoque || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, estoque: Number(formData.estoque) };
    if (materia) {
      await updateDoc(doc(db, 'materiasPrimas', materia.id), dataToSave);
    } else {
      await addDoc(collection(db, 'materiasPrimas'), dataToSave);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{materia ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="nome" placeholder="Nome da Matéria-Prima" value={formData.nome} onChange={handleChange} required className="w-full p-2 border rounded" />
          <select name="unidade" value={formData.unidade} onChange={handleChange} className="w-full p-2 border rounded bg-white">
            <option value="g">Gramas (g)</option>
            <option value="kg">Quilogramas (kg)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="l">Litros (l)</option>
          </select>
          <input type="number" name="estoque" placeholder="Estoque" value={formData.estoque} onChange={handleChange} required className="w-full p-2 border rounded" />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EstoqueModule() {
  const [materias, setMaterias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMateria, setCurrentMateria] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'materiasPrimas'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterias(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
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
    if (window.confirm('Tem certeza que deseja excluir esta matéria-prima?')) {
      await deleteDoc(doc(db, 'materiasPrimas', id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Estoque de Matérias-Primas</h1>
        <button type="button" onClick={() => handleOpenModal()} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200">
          <PlusCircle className="h-5 w-5 mr-2" /> Nova Matéria-Prima
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
            {materias.map((m) => (
              <tr key={m.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.unidade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{m.estoque}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button type="button" onClick={() => handleOpenModal(m)} className="text-teal-600 hover:text-teal-800"><Edit className="w-5 h-5" /></button>
                  <button type="button" onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
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