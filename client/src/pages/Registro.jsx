import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chamada para o AuthController.cs 
      await api.post('/auth/registrar', { nome, email, senha });
      
      alert("Conta criada com sucesso! Agora você pode fazer login.");
      navigate('/login'); // Redireciona para o login
    } catch (error) {
      const mensagem = error.response?.data || "Erro ao criar conta. Tente outro e-mail.";
      alert(mensagem);
    } finally {
      setLoading(false);
    }
  };

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
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-200'}`}
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