import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function EditarEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 
  
  // 1. Estado atualizado com o campo dataAberturaInscricoes
  const [formData, setFormData] = useState({
    id: '', 
    titulo: '', 
    descricao: '', 
    data: '', 
    dataAberturaInscricoes: '', // Novo campo adicionado
    capacidadeMaxima: '',
    imagemUrl: '',    
    idadeMinima: '0'  
  });

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
            // Formata a data principal para o input datetime-local
            data: new Date(eventoEncontrado.data).toISOString().slice(0, 16),
            // Formata a data de abertura, validando se ela existe no banco de dados
            dataAberturaInscricoes: eventoEncontrado.dataAberturaInscricoes 
              ? new Date(eventoEncontrado.dataAberturaInscricoes).toISOString().slice(0, 16) 
              : '',
            capacidadeMaxima: eventoEncontrado.capacidadeMaxima,
            imagemUrl: eventoEncontrado.imagemUrl || '', 
            idadeMinima: eventoEncontrado.idadeMinima.toString() 
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
      await axios.put(`http://localhost:5065/api/eventos/${id}`, {
        ...formData,
        capacidadeMaxima: parseInt(formData.capacidadeMaxima),
        idadeMinima: parseInt(formData.idadeMinima),
        // Envia a data escolhida ou, se estiver vazia, define o momento atual
        dataAberturaInscricoes: formData.dataAberturaInscricoes || new Date().toISOString()
      });
      
      alert('Evento atualizado com sucesso!');
      navigate(`/evento/${id}`);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert('Erro ao atualizar o evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar Evento</h2>
        <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">Cancelar</Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {formData.imagemUrl && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Preview do Banner</p>
            <img 
              src={formData.imagemUrl} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded-lg border border-gray-200" 
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Banner)</label>
          <input 
            type="text" name="imagemUrl" value={formData.imagemUrl} onChange={handleChange} 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Cole o link da imagem (Ex: Unsplash, Imgur...)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input type="text" required name="titulo" value={formData.titulo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea required name="descricao" rows="4" value={formData.descricao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
        </div>

        {/* 2. Grid reestruturado para acomodar 4 elementos de forma equilibrada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora do Evento</label>
            <input type="datetime-local" required name="data" value={formData.data} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abertura das Inscrições</label>
            <input 
              type="datetime-local" name="dataAberturaInscricoes" 
              value={formData.dataAberturaInscricoes} onChange={handleChange} 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
            <p className="text-[10px] text-gray-400 mt-1">Deixe em branco para manter a abertura imediata.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade Total</label>
            <input type="number" required min="1" name="capacidadeMaxima" value={formData.capacidadeMaxima} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classificação Indicativa</label>
            <select
                name="idadeMinima" value={formData.idadeMinima} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
                <option value="0">Livre para todos</option>
                <option value="14">+14 Anos</option>
                <option value="16">+16 Anos</option>
                <option value="18">+18 Anos</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md mt-6 shadow-lg shadow-blue-100 transition-all">
          {loading ? 'Salvando Alterações...' : 'Confirmar Atualização'}
        </button>
      </form>
    </div>
  );
}