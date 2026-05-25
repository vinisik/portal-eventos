import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function InscricaoPagamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  // Estados do Cartão
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');

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

  // 👇 FUNÇÕES DE MÁSCARA (FORMATADORES) 👇
  
  const handleCartaoChange = (e) => {
    // Remove tudo que não for número e limita a 16 dígitos
    let valor = e.target.value.replace(/\D/g, '').substring(0, 16);
    // Adiciona um espaço a cada 4 números
    valor = valor.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumeroCartao(valor);
  };

  const handleValidadeChange = (e) => {
    // Remove tudo que não for número e limita a 4 dígitos
    let valor = e.target.value.replace(/\D/g, '').substring(0, 4);
    // Adiciona a barra "/" após o segundo dígito (Mês)
    if (valor.length >= 3) {
      valor = `${valor.substring(0, 2)}/${valor.substring(2)}`;
    }
    setValidade(valor);
  };

  const handleCvvChange = (e) => {
    // Permite apenas números e limita a 3 dígitos (ou 4 para Amex)
    const valor = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(valor);
  };

  const finalizarInscricao = async () => {
    setProcessandoPagamento(true);
    
    if (evento.valorIngresso > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      await api.post('/participantes', { eventoId: evento.id });
      alert("Inscrição e pagamento confirmados! O ingresso foi enviado para o seu e-mail.");
      navigate(`/evento/${evento.id}`); 
    } catch (error) {
      alert(error.response?.data || "Erro ao processar inscrição.");
      setProcessandoPagamento(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    finalizarInscricao();
  };

  if (loading) return <div className="text-center mt-20">Carregando checkout...</div>;
  if (!evento) return <div className="text-center mt-20">Evento não encontrado.</div>;

  const isGratuito = evento.valorIngresso === 0;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
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
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="font-bold text-gray-800">🔒 Ambiente de Pagamento</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
            <input 
              type="text" placeholder="0000 0000 0000 0000" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
              value={numeroCartao} onChange={handleCartaoChange} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Titular</label>
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
                Processando Cartão...
              </>
            ) : (
              `Pagar R$ ${evento.valorIngresso.toFixed(2).replace('.', ',')} e Inscrever-se`
            )}
          </button>
        </form>
      )}
    </div>
  );
}