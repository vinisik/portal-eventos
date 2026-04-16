import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [contaCriada, setContaCriada] = useState(false); 
  
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Monta o objeto com os dados dos estados
    const dadosRegistro = {
      nome,
      email,
      senha,
      dataNascimento
    };

    try {
      const response = await api.post('/auth/registrar', dadosRegistro);
      
      setContaCriada(true);
      
    } catch (error) {
      console.error("Erro no registro:", error);
      alert(error.response?.data || "Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  // Se a conta foi criada, mostra a mensagem de ativação de e-mail
  if (contaCriada) {
    return (
      <div className="max-w-md mx-auto mt-16 p-10 bg-white rounded-2xl shadow-xl border border-blue-100 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifique seu e-mail!</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Quase lá! Enviamos um link de ativação para <strong>{email}</strong>. 
          Acesse sua caixa de entrada para liberar seu acesso.
        </p>
        <Link 
          to="/login" 
          className="inline-block w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-xl border border-gray-50">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Criar Conta</h2>
        <p className="text-gray-500 mt-2">Junte-se ao Portal de Eventos</p>
      </div>

      <form onSubmit={handleRegistro} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input 
            type="text" placeholder="Seu Nome" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={nome} onChange={(e) => setNome(e.target.value)} required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input 
            type="email" placeholder="seu@email.com" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
          <input 
            type="date" required 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input 
            type="password" placeholder="••••••••" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={senha} onChange={(e) => setSenha(e.target.value)} required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-200'}`}
        >
          {loading ? 'Processando...' : 'Cadastrar agora'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Já tem uma conta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Faça login</Link>
      </p>
    </div>
  );
}