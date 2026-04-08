import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig'; 

export default function Perfil() {
    const [ingressos, setIngressos] = useState([]);
    const [filtro, setFiltro] = useState('futuros'); // Controle da aba ativa
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const buscarIngressos = async () => {
            try {
                const res = await api.get('/auth/meus-ingressos');
                setIngressos(res.data);
            } catch (error) {
                console.error("Erro ao buscar ingressos", error);
            } finally {
                setLoading(false);
            }
        };
        buscarIngressos();
    }, []);

    // Lógica de Filtro com base na data atual
    const agora = new Date();
    const ingressosFiltrados = ingressos.filter(item => {
        const dataEvento = new Date(item.data);
        return filtro === 'futuros' ? dataEvento >= agora : dataEvento < agora;
    });

    if (loading) return <div className="text-center mt-20 text-gray-500">A carregar seu perfil...</div>;

    return (
        <div className="max-w-5xl mx-auto mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Meus Ingressos</h2>

            {/* Navegação de Abas */}
            <div className="flex gap-6 border-b border-gray-200 mb-8">
                <button
                    onClick={() => setFiltro('futuros')}
                    className={`pb-3 font-bold transition-colors ${filtro === 'futuros' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
                >
                    Próximos Eventos
                </button>
                <button
                    onClick={() => setFiltro('passados')}
                    className={`pb-3 font-bold transition-colors ${filtro === 'passados' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
                >
                    Histórico
                </button>
            </div>

            {/* Lista Renderizada */}
            {ingressosFiltrados.length === 0 ? (
                <div className="bg-gray-50 p-12 rounded-xl text-center text-gray-500 border border-dashed border-gray-300">
                    <p className="text-lg">Você não possui eventos {filtro === 'futuros' ? 'programados' : 'no histórico'}.</p>
                    {filtro === 'futuros' && (
                        <Link to="/" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
                            Explorar novos eventos
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ingressosFiltrados.map((ingresso) => (
                        <div key={ingresso.ticketHash} className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition">
                            
                            {/* Miniatura Quadrada */}
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                {ingresso.imagemUrl ? (
                                    <img src={ingresso.imagemUrl} alt={ingresso.titulo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs uppercase font-bold tracking-widest">Capa</div>
                                )}
                            </div>

                            <div className="flex-grow">
                                <h3 className="font-bold text-gray-800 line-clamp-1">{ingresso.titulo}</h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    {new Date(ingresso.data).toLocaleString('pt-BR')}
                                </p>
                                
                                <Link
                                    to={`/ticket/${ingresso.ticketHash}`}
                                    className="inline-block bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded hover:bg-black transition"
                                >
                                    Ver Ingresso
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}