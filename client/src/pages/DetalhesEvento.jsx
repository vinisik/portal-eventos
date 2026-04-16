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

  if (loading) return <div className="text-center mt-20">A carregar detalhes...</div>;
  if (!evento) return <div className="text-center mt-20">Evento não encontrado.</div>;

  const agora = new Date();
  const dataAbertura = evento.dataAberturaInscricoes ? new Date(evento.dataAberturaInscricoes) : new Date(0);
  const dataEvento = new Date(evento.data);
  
  const vagasOcupadas = evento.vagasOcupadas || 0;
  const vagasTotais = evento.capacidadeMaxima;
  const vagasDisponiveis = vagasTotais - vagasOcupadas;
  const porcentagemOcupada = Math.min((vagasOcupadas / vagasTotais) * 100, 100);
  
  const porcentagemDisponivel = (vagasDisponiveis / vagasTotais) * 100;
  const isEscasso = vagasDisponiveis > 0 && (porcentagemDisponivel <= 20 || vagasDisponiveis <= 10);

  // Define o estado da inscrição com base nas condições do evento
  let statusInscricao = { ativo: false, texto: "", corBotao: "bg-gray-300 text-gray-500 cursor-not-allowed", mensagem: "" };

  if (agora > dataEvento) {
      statusInscricao = { ativo: false, texto: "Evento Encerrado", corBotao: "bg-gray-300 text-gray-500", mensagem: "Este evento já aconteceu." };
  } else if (agora < dataAbertura) {
      const formataData = dataAbertura.toLocaleString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
      statusInscricao = { ativo: false, texto: "Em Breve", corBotao: "bg-amber-100 text-amber-700", mensagem: `Inscrições abrem em ${formataData}` };
  } else if (vagasDisponiveis <= 0) {
      statusInscricao = { ativo: false, texto: "Esgotado", corBotao: "bg-red-100 text-red-700 font-bold", mensagem: "Infelizmente todas as vagas foram preenchidas." };
  } else {
      statusInscricao = { ativo: true, texto: "Inscrever-se", corBotao: "bg-blue-600 hover:bg-blue-700 text-white", mensagem: isEscasso ? `🔥 Restam apenas ${vagasDisponiveis} vagas.` : "Vagas disponíveis. Garanta o seu lugar." };
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
      
      {/* BANNER DO EVENTO */}
      <div className="h-64 md:h-96 w-full bg-gray-200 relative">
        {evento.imagemUrl ? (
          <img src={evento.imagemUrl} alt={evento.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Sem imagem de capa</div>
        )}
        
        {/* Badge de Idade */}
        <div className="absolute top-4 left-4 flex gap-2">
          {evento.idadeMinima === 0 ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Livre</span>
          ) : (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">+{evento.idadeMinima} Anos</span>
          )}
        </div>
      </div>

      {/* CONTEÚDO E INFORMAÇÕES */}
      <div className="p-8 md:p-12 max-w-4xl mx-auto">
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{evento.titulo}</h1>
        
        {/* Nova Etiqueta de Categoria */}
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
            {evento.categoria || 'Outros'}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-8 mb-8 border-b border-gray-100 pb-8">
          <div className="flex items-center text-gray-600">
            <span className="text-2xl mr-3">📅</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Data e Hora</p>
              <p className="font-medium text-gray-800">{new Date(evento.data).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          
          {/* Seção de Vagas e Barra de Progresso */}
          <div className="flex items-center text-gray-600 flex-grow max-w-xs">
            <span className="text-2xl mr-3">🎟️</span>
            <div className="w-full">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                <span>Lotação</span>
                <span>{vagasOcupadas} / {vagasTotais}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${isEscasso ? 'bg-orange-500' : 'bg-blue-500'} ${vagasDisponiveis === 0 ? 'bg-red-500' : ''}`} 
                  style={{ width: `${porcentagemOcupada}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-gray-600 mb-12 leading-relaxed">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Sobre este evento</h3>
          <p className="whitespace-pre-line">{evento.descricao}</p>
        </div>

        {/* ÁREA DE AÇÃO DINÂMICA */}
        <div className={`p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${statusInscricao.ativo ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-200'}`}>
          <div>
            <p className="font-bold text-gray-800">
              {statusInscricao.ativo ? 'Garanta seu ingresso agora' : 'Inscrições Indisponíveis'}
            </p>
            <p className={`text-sm font-medium mt-1 ${isEscasso && statusInscricao.ativo ? 'text-orange-600 animate-pulse' : 'text-gray-500'}`}>
              {statusInscricao.mensagem}
            </p>
          </div>
          
          <button 
            onClick={() => statusInscricao.ativo && navigate(`/evento/${evento.id}/inscricao`)}
            disabled={!statusInscricao.ativo}
            className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black text-lg transition ${statusInscricao.corBotao}`}
          >
            {statusInscricao.texto}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            &larr; Voltar para os eventos
          </Link>
        </div>
      </div>
    </div>
  );
}