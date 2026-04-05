import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function VisualizarIngresso() {
  const { hash } = useParams();
  const [dados, setDados] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        console.log("Iniciando busca para o hash:", hash);
        const res = await axios.get('http://localhost:5065/api/eventos');
        
        let encontrado = null;

        // Percorre os eventos vindos da API
        for (let evento of res.data) {
          if (evento.participantes && evento.participantes.length > 0) {
            const p = evento.participantes.find(part => part.ticketHash === hash);
            if (p) {
              encontrado = { 
                ...p, 
                nomeEvento: evento.titulo, 
                dataEvento: evento.data 
              };
              break;
            }
          }
        }

        if (encontrado) {
          setDados(encontrado);
        } else {
          console.warn("Bilhete não encontrado na lista da API.");
          // setDados({ erro: "Não encontrado" });
        }
      } catch (e) { 
        console.error("Erro na API:", e);
      }
    };
    carregarDados();
  }, [hash]);

  if (!dados) return <div className="p-10 text-center">Validando bilhete...</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 flex items-center justify-center">
      <div className="max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Cabeçalho do Ingresso */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="text-xs uppercase tracking-widest opacity-80 mb-1">Bilhete Digital</div>
          <h2 className="text-xl font-bold">{dados.nomeEvento}</h2>
        </div>

        {/* Corpo do Ingresso */}
        <div className="p-8 relative">
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Participante</p>
              <p className="text-lg font-semibold text-gray-800">{dados.nome}</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Data</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(dados.dataEvento).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase font-bold">Status</p>
                <p className="text-sm font-bold text-green-500">✓ Confirmado</p>
              </div>
            </div>
          </div>

          {/* Efeito de recorte de Ingresso */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 w-8 h-8 bg-gray-900 rounded-full"></div>
          <div className="absolute right-0 top-1/2 translate-x-1/2 w-8 h-8 bg-gray-900 rounded-full"></div>
        </div>

        {/* Rodapé com ID */}
        <div className="bg-gray-50 p-6 border-t-2 border-dashed border-gray-200 text-center">
           <p className="text-[10px] font-mono text-gray-400 break-all">{hash}</p>
           <p className="mt-2 text-xs text-blue-600 font-bold">Apresente este código na entrada</p>
        </div>
      </div>
    </div>
  );
}