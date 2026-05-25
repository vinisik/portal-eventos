import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import { QRCodeSVG } from 'qrcode.react';

export default function VisualizarIngresso() {
  const { hash } = useParams();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await api.get(`/participantes/ingresso/${hash}`);
        setDados(res.data);
      } catch (e) { 
        console.error("Erro na API:", e);
        setErro(true); 
      }
    };
    carregarDados();
  }, [hash]);

  const handleImprimir = () => {
    window.print();
  };

  if (erro) return <div className="p-10 text-center text-red-500 font-bold mt-20">Ingresso inválido ou não encontrado.</div>;
  if (!dados) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500">Buscando documento oficial...</p>
    </div>
  );

  const urlTicket = `${window.location.origin}/ticket/${hash}`;
  const isGratuito = dados.valorIngresso === 0;

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center print:bg-white print:py-0">
      
      {/* Botões de Ação */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 print:hidden">
        <Link to="/" className="text-gray-500 hover:text-gray-800 font-medium transition">
          &larr; Voltar aos Eventos
        </Link>
        <button 
          onClick={handleImprimir}
          className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Salvar em PDF
        </button>
      </div>

      {/* DOCUMENTO ESTILO A4 */}
      <div className="bg-white w-full max-w-3xl min-h-[800px] p-12 border border-gray-200 print:border-none print:p-0">
        
        {/* Cabeçalho Oficial  */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-blue-600 tracking-tighter">
              PORTAL<span className="text-gray-900">EVENTOS</span>
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Comprovante Oficial de Inscrição</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">Documento Nº</p>
            <p className="text-xs text-gray-500 font-mono mt-1">{dados.ticketHash.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Corpo do Documento */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Evento</h2>
                <p className="text-3xl font-bold text-gray-900">{dados.nomeEvento}</p>
            </div>
            
            {/* Tag de Preço no PDF */}
            <div className="text-right">
                <span className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest border ${isGratuito ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {isGratuito ? 'GRATUITO' : `R$ ${dados.valorIngresso.toFixed(2).replace('.', ',')}`}
                </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Data e Hora</p>
              <p className="font-semibold text-gray-800">
                {new Date(dados.dataEvento).toLocaleString('pt-BR', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status da Inscrição</p>
              <p className="font-bold text-green-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Pagamento Aprovado
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Participante */}
        <div className="mb-16">
          <h2 className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-4 border-b border-gray-100 pb-2">Detalhes do Participante</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nome Completo</p>
              <p className="font-bold text-gray-900 text-lg">{dados.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">E-mail Registrado</p>
              <p className="font-semibold text-gray-800">{dados.email}</p>
            </div>
          </div>
        </div>

        {/* Rodapé e Autenticação de QR Code */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-8 mt-auto">
          <div className="max-w-sm">
            <p className="text-xs text-gray-500 leading-relaxed mb-2">
              Este documento garante o seu acesso ao evento. Apresente este QR Code na portaria, impresso ou na tela do celular.
            </p>
            <p className="text-[10px] text-gray-400 font-mono break-all">
              Chave de Autenticação:<br/>{dados.ticketHash}
            </p>
          </div>
          
          <div className="bg-white p-2 border-2 border-gray-900 rounded-lg">
            <QRCodeSVG value={urlTicket} size={120} level="H" />
          </div>
        </div>

      </div>
    </div>
  );
}