import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ListaEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário logou como administrador
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    buscarEventos();
  }, []);

  const buscarEventos = async () => {
    try {
      // GET 
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
        <h2 className="text-3xl font-extrabold text-gray-900">Próximos Eventos</h2>
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
            <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
              
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{evento.titulo}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {evento.descricao}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 p-1.5 rounded mr-3">📅</span>
                    <span>{formatarData(evento.data)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 p-1.5 rounded mr-3">🎟️</span>
                    <span>Capacidade: <span className="font-semibold text-gray-700">{evento.capacidadeMaxima} pessoas</span></span>
                  </div>
                </div>
              </div>

              {/* Inscrição */}
              <Link 
                to={`/evento/${evento.id}/inscricao`}
                className="block text-center w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                Inscrever-se
              </Link> 

              {isAdmin && (
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                <Link 
                  to={`/admin/evento/${evento.id}/participantes`}
                  className="block text-center w-full text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 py-2 rounded-md hover:bg-blue-100 transition"
                >
                  Lista de Inscritos
                </Link>
                
                <div className="flex gap-2">
                  <Link 
                    to={`/admin/evento/${evento.id}/editar`}
                    className="flex-1 text-center text-xs font-bold text-amber-600 border border-amber-200 py-2 rounded-md hover:bg-amber-50"
                  >
                    Editar
                  </Link>
                  
                  <button 
                    onClick={() => handleExcluir(evento.id, evento.titulo)}
                    className="flex-1 text-center text-xs font-bold text-red-500 border border-red-100 py-2 rounded-md hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}         
          </div>
          ))}
        </div>
      )}
    </div>
  );
}