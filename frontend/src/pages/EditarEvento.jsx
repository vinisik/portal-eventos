import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function EditarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '', titulo: '', descricao: '', data: '', capacidadeMaxima: ''
  });

  // Busca os dados do evento para preencher o formulário
  useEffect(() => {
    const buscarEvento = async () => {
      try {
        const response = await axios.get('http://localhost:5065/api/eventos');
        const eventoEncontrado = response.data.find(e => e.id === parseInt(id));
        
        if (eventoEncontrado) {
          setFormData({
            id: eventoEncontrado.id,
            titulo: eventoEncontrado.titulo,
            descricao: eventoEncontrado.descricao,
            // Formatar data 
            data: new Date(eventoEncontrado.data).toISOString().slice(0, 16),
            capacidadeMaxima: eventoEncontrado.capacidadeMaxima
          });
        }
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
      }
    };
    buscarEvento();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PUT
      await axios.put(`http://localhost:5065/api/eventos/${id}`, {
        ...formData,
        capacidadeMaxima: parseInt(formData.capacidadeMaxima)
      });
      alert('Evento atualizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert('Erro ao atualizar o evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar Evento</h2>
        <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">Cancelar</Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input type="text" required name="titulo" value={formData.titulo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea required name="descricao" rows="3" value={formData.descricao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
            <input type="datetime-local" required name="data" value={formData.data} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
            <input type="number" required min="1" name="capacidadeMaxima" value={formData.capacidadeMaxima} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md mt-4">
          {loading ? 'Salvando' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}