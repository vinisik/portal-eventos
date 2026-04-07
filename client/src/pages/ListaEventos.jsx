import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ListaEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário logou como administrador
  const isAdmin = localStorage.getItem('roleUser') === 'Admin';

  useEffect(() => {
    buscarEventos();
  }, []);

  const buscarEventos = async () => {
    try {
      const response = await axios.get('http://localhost:5065/api/eventos');
      setEventos(response.data);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      alert("Não foi possível carregar os eventos. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id, titulo) => {
    if (window.confirm(`Tem certeza que deseja apagar o evento "${titulo}"? Todas as inscrições serão perdidas.`)) {
      try {
        await axios.delete(`http://localhost:5065/api/eventos/${id}`);
        setEventos(eventos.filter(e => e.id !== id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir o evento.");
      }
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500 font-medium">Carregando eventos...</span>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Eventos Disponíveis</h2>
        {isAdmin && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Modo Administrador
          </span>
        )}
      </div>

      {eventos.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          <p className="text-lg">Nenhum evento programado no momento.</p>
          {isAdmin && (
            <Link to="/admin/novo" className="text-blue-600 hover:underline mt-2 inline-block">
              Clique aqui para criar o primeiro.
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.map((evento) => (
            <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              
              {/* Miniatura da Imagem do Evento */}
              <div className="h-48 w-full bg-gray-100 relative">
                {evento.imagemUrl ? (
                  <img src={evento.imagemUrl} alt={evento.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sem Imagem</div>
                )}
                
                {/* Badge de Idade sobreposto na imagem */}
                <div className="absolute top-3 left-3 flex items-center text-sm font-bold mt-2 shadow-sm">
                  {evento.idadeMinima === 0 ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                      ✅ Livre
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                      🔞 +{evento.idadeMinima} Anos
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{evento.titulo}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {evento.descricao}
                </p>
                
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 p-1.5 rounded mr-3">📅</span>
                    <span>{formatarData(evento.data)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 p-1.5 rounded mr-3">🎟️</span>
                    <span>Capacidade: <span className="font-semibold text-gray-700">{evento.capacidadeMaxima}</span></span>
                  </div>
                </div>

                {/* Botão Principal redirecionando para a página de Detalhes */}
                <Link 
                  to={`/evento/${evento.id}`}
                  className="block text-center w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-black transition-colors mb-4"
                >
                  Ver Detalhes
                </Link> 

                {/* Controles Administrativos */}
                {isAdmin && (
                  <div className="mt-2 pt-5 border-t border-gray-100 space-y-3">
                    <Link 
                      to={`/admin/evento/${evento.id}/participantes`}
                      className="block text-center w-full text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 py-2 rounded-md hover:bg-blue-100 transition"
                    >
                      Lista de Inscritos
                    </Link>
                    
                    <div className="flex gap-2">
                      <Link 
                        to={`/admin/evento/${evento.id}/editar`}
                        className="flex-1 text-center text-xs font-bold text-amber-600 border border-amber-200 py-2 rounded-md hover:bg-amber-50 transition"
                      >
                        Editar
                      </Link>
                      
                      <button 
                        onClick={() => handleExcluir(evento.id, evento.titulo)}
                        className="flex-1 text-center text-xs font-bold text-red-500 border border-red-100 py-2 rounded-md hover:bg-red-50 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}         
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}