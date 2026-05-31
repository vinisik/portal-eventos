import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ListaEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const categorias = ['Todas', 'Tecnologia', 'Negócios', 'Música', 'Educação', 'Esportes', 'Cultura' , 'Outros', 'afasfasf'];
  const isAdmin = localStorage.getItem('roleUser') === 'Admin';

  useEffect(() => {
    buscarEventos();
  }, []);

  const buscarEventos = async () => {
    try {
      const response = await axios.get('http://localhost:5065/api/eventos');
      // Organiza por data de forma decrescente
      const eventosOrdenados = response.data.sort((a, b) => new Date(b.data) - new Date(a.data));
      setEventos(eventosOrdenados);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      alert("Não foi possível carregar os eventos.");
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

  // Lógica de separação do Destaque
  const semFiltrosAtivos = termoBusca === '' && categoriaAtiva === 'Todas';
  const eventoDestaque = eventos.find(e => e.destaque === true || e.Destaque === true);

  const eventosFiltrados = eventos.filter(evento => {
    // Esconde o destaque do grid se o banner já estiver sendo exibido e nenhum filtro estiver ativo
    if (semFiltrosAtivos && eventoDestaque && evento.id === eventoDestaque.id) return false;

    const termoLower = termoBusca.toLowerCase();
    const matchBusca = evento.titulo.toLowerCase().includes(termoLower) || evento.descricao.toLowerCase().includes(termoLower);
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
    <div className="pb-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Descubra Eventos</h2>
        {isAdmin && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Modo Admin</span>}
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 transition-all">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" placeholder="Pesquise por nome, tema ou descrição..." 
              value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3 outline-none"
            />
          </div>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg border font-medium text-sm transition-all duration-200 ${mostrarFiltros ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            <span className="hidden sm:inline">Filtros</span>
            
            {!mostrarFiltros && categoriaAtiva !== 'Todas' && (
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Filtrar por Categoria</p>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {categorias.map(categoria => (
                <button
                  key={categoria} onClick={() => setCategoriaAtiva(categoria)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${categoriaAtiva === categoria ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Evento em Destaque */}
      {semFiltrosAtivos && eventoDestaque && (
        <div className="mb-12 relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 group">
          <div className="absolute inset-0">
            <img 
              src={eventoDestaque.imagemUrl || 'https://picsum.photos/1200/600'} 
              alt={eventoDestaque.titulo} 
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
          </div>
          
          <div className="relative p-8 md:p-12 flex flex-col justify-end min-h-[400px]">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-max mb-4 shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              Destaque Principal
            </span>
            
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              {eventoDestaque.titulo}
            </h3>
            <p className="text-gray-300 max-w-2xl text-base md:text-lg mb-8 line-clamp-2">
              {eventoDestaque.descricao}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 w-full">
              <Link to={`/evento/${eventoDestaque.id}`} className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg">
                Garantir o Ingresso
              </Link>
              <div className="text-white text-sm font-medium flex items-center gap-2 bg-black/40 px-4 py-3 rounded-lg backdrop-blur">
                <span>📅 {formatarData(eventoDestaque.data)}</span>
                <span className="opacity-50">|</span>
                <span className="font-bold text-green-400">
                  {eventoDestaque.valorIngresso === 0 ? 'GRATUITO' : `R$ ${eventoDestaque.valorIngresso.toFixed(2).replace('.', ',')}`}
                </span>
              </div>

              {isAdmin && (
                <div className="flex gap-2 sm:ml-auto mt-2 sm:mt-0">
                  <Link 
                    to={`/admin/evento/${eventoDestaque.id}/editar`} 
                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-lg font-bold transition-colors shadow-lg text-sm"
                  >
                    Editar Destaque
                  </Link>
                  <button 
                    onClick={() => handleExcluir(eventoDestaque.id, eventoDestaque.titulo)} 
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-bold transition-colors shadow-lg text-sm"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {eventosFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          <p className="text-lg font-medium text-gray-800">Nenhum evento encontrado.</p>
          <button onClick={() => { setTermoBusca(''); setCategoriaAtiva('Todas'); }} className="text-blue-600 font-bold mt-2 hover:underline">
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {eventosFiltrados.map((evento) => {
            const estado = analisarEstadoEvento(evento);

            return (
              <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                <Link to={`/evento/${evento.id}`} className="flex flex-col flex-grow">
                  <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                    {evento.imagemUrl ? (
                      <img src={evento.imagemUrl} alt={evento.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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

                {isAdmin && (
                  <div className="px-6 pb-6 pt-0 bg-white relative z-20">
                    <div className="pt-4 border-t border-gray-100 flex gap-2">
                      <Link to={`/admin/evento/${evento.id}/editar`} className="flex-1 text-center text-xs font-bold text-amber-600 border border-amber-200 py-2 rounded-md bg-amber-50">Editar</Link>
                      <button onClick={() => handleExcluir(evento.id, evento.titulo)} className="flex-1 text-center text-xs font-bold text-red-500 border border-red-100 py-2 rounded-md bg-red-50">Excluir</button>
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