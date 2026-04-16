import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ListaEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Busca e filtros
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  
  const categorias = ['Todas', 'Tecnologia', 'Negócios', 'Música', 'Educação', 'Esportes', 'Cultura' , 'Outros'];

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
      alert("Não foi possível carregar os eventos. Verifique se a API está em execução.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id, titulo) => {
    if (window.confirm(`Tem certeza que deseja apagar o evento "${titulo}"?`)) {
      try {
        await axios.delete(`http://localhost:5065/api/eventos/${id}`);
        setEventos(eventos.filter(e => e.id !== id));
      } catch (error) {
        alert("Erro ao excluir o evento.");
      }
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const analisarEstadoEvento = (evento) => {
    const agora = new Date();
    const dataAbertura = evento.dataAberturaInscricoes ? new Date(evento.dataAberturaInscricoes) : new Date(0);
    const dataEvento = new Date(evento.data);
    
    const vagasOcupadas = evento.vagasOcupadas || 0; 
    const vagasTotais = evento.capacidadeMaxima;
    const vagasDisponiveis = vagasTotais - vagasOcupadas;
    
    const porcentagemDisponivel = (vagasDisponiveis / vagasTotais) * 100;
    const isEscasso = vagasDisponiveis > 0 && (porcentagemDisponivel <= 20 || vagasDisponiveis <= 10);

    if (agora > dataEvento) return { status: "ENCERRADO", textoBadge: "Encerrado", corBadge: "bg-gray-200 text-gray-600", mostrarRestantes: false, vagasDisponiveis };
    if (agora < dataAbertura) return { status: "EM_BREVE", textoBadge: `Inscrições Abertas em ${dataAbertura.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`, corBadge: "bg-amber-100 text-amber-700", mostrarRestantes: false, vagasDisponiveis };
    if (vagasDisponiveis <= 0) return { status: "ESGOTADO", textoBadge: "Esgotado", corBadge: "bg-red-100 text-red-700", mostrarRestantes: false, vagasDisponiveis };

    return { status: "ABERTO", textoBadge: "Inscrições Abertas", corBadge: "bg-green-100 text-green-700", mostrarRestantes: isEscasso, vagasDisponiveis };
  };

  const eventosFiltrados = eventos.filter(evento => {
    const termoLower = termoBusca.toLowerCase();
    const matchBusca = evento.titulo.toLowerCase().includes(termoLower) || 
                       evento.descricao.toLowerCase().includes(termoLower);
    
    const catEvento = evento.categoria || 'Outros';
    const matchCategoria = categoriaAtiva === 'Todas' || catEvento === categoriaAtiva;
    
    return matchBusca && matchCategoria;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Descubra Eventos</h2>
        {isAdmin && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Modo Admin</span>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input 
            type="text" 
            placeholder="Pesquise por nome, tema ou descrição..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3 outline-none transition"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {categorias.map(categoria => (
            <button
              key={categoria}
              onClick={() => setCategoriaAtiva(categoria)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                categoriaAtiva === categoria 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>
      </div>

      {eventosFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          <p className="text-lg font-medium text-gray-800">Nenhum evento encontrado.</p>
          <p className="text-sm mt-1 mb-4">Tente usar outros termos ou limpe os filtros.</p>
          <button onClick={() => { setTermoBusca(''); setCategoriaAtiva('Todas'); }} className="text-blue-600 font-bold hover:underline">
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventosFiltrados.map((evento) => {
            const estado = analisarEstadoEvento(evento);

            return (
              <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                
                <Link to={`/evento/${evento.id}`} className="flex flex-col flex-grow">
                  
                  <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                    {evento.imagemUrl ? (
                      <img 
                        src={evento.imagemUrl} 
                        alt={evento.titulo} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sem Imagem</div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2 shadow-sm z-10">
                      <span className="bg-white/90 backdrop-blur text-gray-800 border border-gray-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-max shadow-sm">
                        {evento.categoria || 'Outros'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold w-max shadow-md ${estado.corBadge}`}>
                        {estado.textoBadge}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {evento.titulo}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {evento.descricao}
                    </p>
                    
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="bg-gray-100 p-1.5 rounded mr-3">📅</span>
                        <span>{formatarData(evento.data)}</span>
                      </div>
                    </div>

                    {estado.mostrarRestantes && (
                      <div className="mb-2 bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                          <span className="text-orange-600 text-xs font-black uppercase tracking-widest">Restam {estado.vagasDisponiveis} vagas!</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Área do Admin */}
                {isAdmin && (
                  <div className="px-6 pb-6 pt-0 bg-white relative z-20">
                    <div className="pt-4 border-t border-gray-100 flex gap-2">
                      <Link 
                        to={`/admin/evento/${evento.id}/editar`} 
                        className="flex-1 text-center text-xs font-bold text-amber-600 border border-amber-200 py-2 rounded-md bg-amber-50 transition-colors"
                      >
                        Editar
                      </Link>
                      <button 
                        onClick={() => handleExcluir(evento.id, evento.titulo)} 
                        className="flex-1 text-center text-xs font-bold text-red-500 border border-red-100 py-2 rounded-md bg-red-50 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}         
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}