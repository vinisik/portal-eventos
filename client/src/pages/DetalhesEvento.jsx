import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DetalhesEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarEvento = async () => {
      try {
        // Busca a lista e filtra pelo ID
        const res = await axios.get('http://localhost:5065/api/eventos');
        const encontrado = res.data.find(e => e.id === parseInt(id));
        setEvento(encontrado);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    buscarEvento();
  }, [id]);

  if (loading) return <div className="text-center mt-20">Carregando detalhes...</div>;
  if (!evento) return <div className="text-center mt-20">Evento não encontrado.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
      
      {/* BANNER DO EVENTO */}
      <div className="h-64 md:h-96 w-full bg-gray-200 relative">
        {evento.imagemUrl ? (
          <img 
            src={evento.imagemUrl} 
            alt={evento.titulo} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span>Sem imagem de capa</span>
          </div>
        )}
        
        {/* Badge de Idade por cima da imagem */}
        <div className="absolute top-4 left-4">
          {evento.idadeMinima === 0 ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ✅ Livre
            </span>
          ) : (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              🔞 +{evento.idadeMinima} Anos
            </span>
          )}
        </div>
      </div>

      {/* CONTEÚDO E INFORMAÇÕES */}
      <div className="p-8 md:p-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{evento.titulo}</h1>
        
        <div className="flex flex-wrap gap-6 mb-8 border-b border-gray-100 pb-8">
          <div className="flex items-center text-gray-600">
            <span className="text-2xl mr-2">📅</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Data e Hora</p>
              <p className="font-medium">{new Date(evento.data).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <span className="text-2xl mr-2">🎟️</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Capacidade</p>
              <p className="font-medium">{evento.capacidadeMaxima} pessoas</p>
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-gray-600 mb-10 leading-relaxed">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Sobre este evento</h3>
          <p className="whitespace-pre-line">{evento.descricao}</p>
        </div>

        {/* ÁREA DE AÇÃO */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-800">Faça sua inscrição nesse evento!</p>
            <p className="text-sm text-gray-500">As vagas são limitadas.</p>
          </div>
          <button 
            onClick={() => navigate(`/evento/${evento.id}/inscricao`)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black text-lg transition  "
          >
            Inscrever-se
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            &larr; Voltar para a lista de eventos
          </Link>
        </div>
      </div>
    </div>
  );
}