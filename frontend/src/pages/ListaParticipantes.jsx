import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ListaParticipantes() {
  const { id } = useParams(); 
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarParticipantes();
  }, [id]);

  const buscarParticipantes = async () => {
    try {
      // GET para buscar os participantes do evento específico
      const response = await axios.get(`http://localhost:5065/api/eventos/${id}/participantes`);
      setParticipantes(response.data);
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
      setErro("Não foi possível carregar a lista de participantes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-500 font-medium">A carregar participantes...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Participantes do Evento</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition">
          &larr; Voltar aos Eventos
        </Link>
      </div>

      {erro && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-100">
          {erro}
        </div>
      )}

      {/* Tabela */}
      {participantes.length === 0 && !erro ? (
        <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          Ainda não há inscritos para este evento.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código do Bilhete (Hash)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participantes.map((participante, index) => (
                <tr key={participante.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {participante.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {participante.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {participante.ticketHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-sm text-gray-500 text-right">
            Total de inscritos: <span className="font-bold text-gray-800">{participantes.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}