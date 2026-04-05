import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function Inscricao() {
  const { id } = useParams(); // Pega o ID do evento da URL
  const [formData, setFormData] = useState({ nome: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null); 
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      // Envia os dados para a API e recebe o ingresso gerado
      const response = await axios.post('http://localhost:5065/api/participantes', {
        nome: formData.nome,
        email: formData.email,
        eventoId: parseInt(id) 
      });
      
      setTicket(response.data);
    } catch (error) {
      console.error("Erro na inscrição:", error);
      if (error.response && error.response.data) {
        setErro(error.response.data); // Exibe mensagem da API 
      } else {
        setErro("Erro ao realizar a inscrição. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Tela de confirmação com QR Code
  if (ticket) {
    const payloadQrCode = JSON.stringify({
      Participante: ticket.nome,
      Email: ticket.email,
      EventoId: ticket.eventoId,
      Ticket: ticket.ticketHash
    });
    const urlTicket = `${window.location.origin}/ticket/${ticket.ticketHash}`;

    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center mt-10">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inscrição Confirmada!</h2>
        <p className="text-gray-600 mb-6">Aqui está o seu ingresso</p>
        
        {/* QR Code */}
        <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 flex flex-col items-center mb-8">
          
          <QRCodeSVG value={urlTicket} size={200} level="H" includeMargin={true} />
          
          {/* Exibir os dados abaixo do QR Code */}
          <div className="mt-6 text-left w-full bg-white p-4 rounded border border-gray-200 text-sm">
            <p className="text-gray-500 mb-1">Nome: <span className="font-semibold text-gray-800">{ticket.nome}</span></p>
            <p className="text-gray-500 mb-1">E-mail: <span className="font-semibold text-gray-800">{ticket.email}</span></p>
            <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-gray-100 break-all">
              Hash: {ticket.ticketHash}
            </p>
          </div>

        </div>

        <Link to="/" className="text-blue-600 font-medium hover:text-blue-800 transition">
          Voltar para os eventos
        </Link>
      </div>
    );
  }

  // Formulário de inscrição
  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inscrever-se</h2>
      
      {erro && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-100">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input 
            type="text" required name="nome"
            value={formData.nome} onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Introduza o seu nome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input 
            type="email" required name="email"
            value={formData.email} onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="seu.email@exemplo.com"
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition disabled:bg-blue-400 mt-4"
        >
          {loading ? 'Processando...' : 'Confirmar Inscrição'}
        </button>
        
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-800 transition">
            Cancelar e voltar
          </Link>
        </div>
      </form>
    </div>
  );
}