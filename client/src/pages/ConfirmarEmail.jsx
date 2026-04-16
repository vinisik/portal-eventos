import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function ConfirmarEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('carregando'); 
  const [mensagem, setMensagem] = useState('Verificando o seu token de ativação...');

  // Trava de segurança
  const requisicaoFeita = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('erro');
      setMensagem('Nenhum token de ativação foi encontrado na URL.');
      return;
    }

    // Aborta a segunda tentativa de chamada 
    if (requisicaoFeita.current) return;
    requisicaoFeita.current = true;

    const ativarConta = async () => {
      try {
        const response = await api.get(`/auth/confirmar-email?token=${token}`);
        setStatus('sucesso');
        setMensagem(response.data.mensagem || 'E-mail confirmado com sucesso!');
      } catch (error) {
        setStatus('erro');
        setMensagem(error.response?.data || 'Token inválido ou expirado. Tente se cadastrar novamente.');
      }
    };

    ativarConta();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        
        {status === 'carregando' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Validando e-mail...</h2>
            <p className="text-gray-500 text-sm">{mensagem}</p>
          </div>
        )}

        {status === 'sucesso' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta Ativada!</h2>
            <p className="text-gray-600 mb-8">{mensagem}</p>
            <Link 
              to="/login" 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
            >
              Fazer Login Agora
            </Link>
          </div>
        )}

        {status === 'erro' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-600 mb-8">{mensagem}</p>
            <Link 
              to="/registrar" 
              className="w-full bg-gray-100 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
            >
              Voltar para o Cadastro
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}