import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { PlusCircle } from '../components/Icons';

// Util: formatar datas que podem vir como Timestamp, Date ou undefined
const formatDate = (value) => {
  if (!value) return '-';
  if (typeof value.toDate === 'function') return value.toDate().toLocaleDateString();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000).toLocaleDateString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
};

function OrdemServicoFormModal({ onClose }) {
  const [produtoFinal, setProdutoFinal] = useState('');
  const [ingredientes, setIngredientes] = useState([]);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'materiasPrimas'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMateriasDisponiveis(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addIngrediente = () => {
    setIngredientes((prev) => [...prev, { materiaId: '', quantidade: 0 }]);
  };

  const handleIngredienteChange = (index, field, value) => {
    const novos = [...ingredientes];
    novos[index][field] = value;
    setIngredientes(novos);
  };

  const generatePDF = async (ordemData) => {
    const { default: jsPDF } = await import('jspdf');
    const docPdf = new jsPDF();

    const dataDoc = ordemData.createdAt?.seconds ? new Date(ordemData.createdAt.seconds * 1000) : new Date();

    docPdf.setFontSize(18);
    docPdf.text('Ordem de Serviço - Mutamba Cosmetics', 14, 22);
    docPdf.setFontSize(12);
    docPdf.text(`Produto a ser Fabricado: ${ordemData.produtoFinal}`, 14, 32);
    docPdf.text(`Data: ${dataDoc.toLocaleDateString()}`, 14, 42);
    docPdf.setFontSize(14);
    docPdf.text('Receita / Matérias-Primas:', 14, 60);

    let y = 70;
    ordemData.ingredientes.forEach((ing) => {
      const materia = materiasDisponiveis.find((m) => m.id === ing.materiaId);
      if (materia) {
        docPdf.text(`- ${materia.nome}: ${ing.quantidade} ${materia.unidade}`, 20, y);
        y += 10;
      }
    });

    docPdf.save(`OS-${ordemData.produtoFinal}-${Date.now()}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ordemData = { produtoFinal, ingredientes, createdAt: new Date() };
    await addDoc(collection(db, 'ordensServico'), ordemData);

    const updates = ingredientes.map(async (ing) => {
      if (!ing.materiaId || !ing.quantidade) return;
      const materiaRef = doc(db, 'materiasPrimas', ing.materiaId);
      const materiaSnap = await getDoc(materiaRef);
      if (materiaSnap.exists()) {
        const estoqueAtual = Number(materiaSnap.data().estoque) || 0;
        const novoEstoque = estoqueAtual - Number(ing.quantidade || 0);
        await updateDoc(materiaRef, { estoque: novoEstoque });
      }
    });
    await Promise.all(updates);

    const savedOrdem = { ...ordemData, createdAt: { seconds: Math.floor(Date.now() / 1000) } };
    await generatePDF(savedOrdem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Nova Ordem de Serviço</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome do Produto Final (ex: Shampoo Hidratante)" value={produtoFinal} onChange={(e) => setProdutoFinal(e.target.value)} required className="w-full p-2 border rounded" />
          <h3 className="font-bold">Ingredientes da Receita</h3>
          {ingredientes.map((ing, index) => {
            const materiaSelecionada = materiasDisponiveis.find((m) => m.id === ing.materiaId);
            return (
              <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                <select value={ing.materiaId} onChange={(e) => handleIngredienteChange(index, 'materiaId', e.target.value)} className="w-1/2 p-2 border rounded bg-white">
                  <option value="">Selecione a matéria-prima...</option>
                  {materiasDisponiveis.map((m) => (<option key={m.id} value={m.id}>{m.nome}</option>))}
                </select>
                <input type="number" placeholder="Qtd" value={ing.quantidade} onChange={(e) => handleIngredienteChange(index, 'quantidade', e.target.value)} className="w-1/4 p-2 border rounded" />
                {materiaSelecionada && (<span className="w-1/4 text-gray-600">Disp: {materiaSelecionada.estoque} {materiaSelecionada.unidade}</span>)}
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

export function OrdensServicoModule() {
  const [ordens, setOrdens] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'ordensServico'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrdens(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ordens de Serviço</h1>
        <button type="button" onClick={() => setIsModalOpen(true)} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-200">
          <PlusCircle className="h-5 w-5 mr-2" /> Nova Ordem de Serviço
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
            {ordens.map((o) => (
              <tr key={o.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.produtoFinal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <OrdemServicoFormModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
