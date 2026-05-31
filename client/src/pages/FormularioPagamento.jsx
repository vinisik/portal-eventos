import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { QRCodeSVG } from 'qrcode.react'; 

export default function FormularioPagamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  // Estados de Pagamento
  const [metodoPagamento, setMetodoPagamento] = useState('cartao'); 
  
  // Estados do Cartão
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');

  // Estados do PIX
  const [tempoPix, setTempoPix] = useState(600); 
  const [chaveCopiada, setChaveCopiada] = useState(false);
  const chavePixFicticia = "00020126580014br.gov.bcb.pix0136portal-eventos-pix-simulado-123456789";

  // Busca o Evento
  useEffect(() => {
    const buscarEvento = async () => {
      try {
        const res = await api.get('/eventos');
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

  // Temporizador do PIX
  useEffect(() => {
    let intervalo;
    if (metodoPagamento === 'pix' && tempoPix > 0 && !processandoPagamento) {
      intervalo = setInterval(() => {
        setTempoPix((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [metodoPagamento, tempoPix, processandoPagamento]);

  // Formatador do Tempo do PIX 
  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  // Copiar Chave PIX
  const handleCopiarPix = () => {
    navigator.clipboard.writeText(chavePixFicticia);
    setChaveCopiada(true);
    setTimeout(() => setChaveCopiada(false), 2000); 
  };

  // Funções de Máscara do Cartão
  const handleCartaoChange = (e) => {
    let valor = e.target.value.replace(/\D/g, '').substring(0, 16);
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumeroCartao(valor);
  };

  const handleValidadeChange = (e) => {
    let valor = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (valor.length >= 3) valor = `${valor.substring(0, 2)}/${valor.substring(2)}`;
    setValidade(valor);
  };

  const handleCvvChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(valor);
  };

  // Envio do Formulário de Pagamento
  const finalizarInscricao = async () => {
    setProcessandoPagamento(true);
    
    // Simula o tempo de processamento bancário
    if (evento.valorIngresso > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      await api.post('/participantes', { eventoId: evento.id });
      alert("Pagamento confirmado com sucesso! O ingresso foi enviado para o seu e-mail.");
      navigate(`/evento/${evento.id}`); 
    } catch (error) {
      alert(error.response?.data || "Erro ao processar inscrição.");
      setProcessandoPagamento(false);
    }
  };

  const handleSubmitCartao = (e) => {
    e.preventDefault();
    finalizarInscricao();
  };

  if (loading) return <div className="text-center mt-20">Carregando checkout...</div>;
  if (!evento) return <div className="text-center mt-20">Evento não encontrado.</div>;

  const isGratuito = evento.valorIngresso === 0;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 mb-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Resumo da Inscrição</h2>
      
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-blue-900">{evento.titulo}</h3>
          <p className="text-sm text-blue-700">{new Date(evento.data).toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-700 uppercase font-bold tracking-wider">Total a pagar</p>
          <p className="text-2xl font-black text-blue-900">
            {isGratuito ? 'GRÁTIS' : `R$ ${evento.valorIngresso.toFixed(2).replace('.', ',')}`}
          </p>
        </div>
      </div>

      {isGratuito ? (
        <div className="text-center">
          <p className="text-gray-600 mb-6">Este evento é totalmente gratuito. Nenhuma cobrança será feita.</p>
          <button 
            onClick={finalizarInscricao} disabled={processandoPagamento}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg"
          >
            {processandoPagamento ? 'Confirmando...' : 'Concluir Inscrição Gratuita'}
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          
          {/* ABAS DE SELEÇÃO DE PAGAMENTO */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMetodoPagamento('cartao')}
              className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${metodoPagamento === 'cartao' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              💳 Cartão de Crédito
            </button>
            <button
              type="button"
              onClick={() => setMetodoPagamento('pix')}
              className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${metodoPagamento === 'pix' ? 'bg-teal-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.0003 4.29828L5.27539 10.9633L12.0003 17.6283L18.7251 10.9633L12.0003 4.29828ZM12.0003 0L24 10.9633L12.0003 21.9265L0 10.9633L12.0003 0Z"/></svg>
              PIX
            </button>
          </div>

          {/* ÁREA DO CARTÃO DE CRÉDITO */}
          {metodoPagamento === 'cartao' && (
            <form onSubmit={handleSubmitCartao} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão (Simulação)</label>
                <input 
                  type="text" placeholder="0000 0000 0000 0000" required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
                  value={numeroCartao} onChange={handleCartaoChange} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Impresso no Cartão</label>
                <input 
                  type="text" placeholder="NOME DO TITULAR" required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                  value={nomeCartao} onChange={(e) => setNomeCartao(e.target.value.toUpperCase())}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                  <input 
                    type="text" placeholder="MM/AA" required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                    value={validade} onChange={handleValidadeChange} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input 
                    type="text" placeholder="123" required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                    value={cvv} onChange={handleCvvChange} 
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={processandoPagamento}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2"
              >
                {processandoPagamento ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    A processar...
                  </>
                ) : (
                  `Pagar R$ ${evento.valorIngresso.toFixed(2).replace('.', ',')} e Inscrever-se`
                )}
              </button>
            </form>
          )}

          {/* ÁREA DO PIX */}
          {metodoPagamento === 'pix' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center animate-fade-in shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">Escaneie o QR Code abaixo</h3>
              <p className="text-sm text-gray-500 mb-6">Abra o aplicativo do seu banco e escolha a opção pagar via QR Code PIX.</p>
              
              {/* QR Code gerado */}
              <div className="flex justify-center mb-6">
                <div className="p-3 border-2 border-teal-500 rounded-xl bg-white shadow-md">
                  <QRCodeSVG value={chavePixFicticia} size={180} level="M" />
                </div>
              </div>

              {/* Temporizador */}
              <div className="mb-6">
                {tempoPix > 0 ? (
                  <p className="text-sm font-medium text-gray-600">
                    O código expira em: <span className="text-red-500 font-mono font-bold text-lg">{formatarTempo(tempoPix)}</span>
                  </p>
                ) : (
                  <p className="text-sm font-bold text-red-600">O código expirou. Atualize a página.</p>
                )}
              </div>

              {/* PIX Copia e Cola */}
              <div className="text-left mb-8">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ou use o PIX Copia e Cola</label>
                <div className="flex gap-2">
                  <input 
                    type="text" readOnly value={chavePixFicticia}
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 text-sm rounded-lg p-3 outline-none font-mono truncate"
                  />
                  <button 
                    onClick={handleCopiarPix}
                    className={`px-4 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${chaveCopiada ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {chaveCopiada ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Botão de Simulação  */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400 mb-3 block">Ambiente de Simulação</p>
                <button 
                  onClick={finalizarInscricao} disabled={processandoPagamento || tempoPix === 0}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2"
                >
                  {processandoPagamento ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Verificando Pagamento...
                    </>
                  ) : (
                    'Concluir Inscrição'
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}