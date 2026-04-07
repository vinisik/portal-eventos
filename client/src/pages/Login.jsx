import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      // Salva o Token e as infos no localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('nomeUser', response.data.nome);
      localStorage.setItem('roleUser', response.data.perfil);

      // Redireciona para o painel ou home
      navigate(response.data.perfil === 'Admin' ? '/admin/eventos' : '/');
    } catch (error) {
      alert("Falha no login. Verifique suas credenciais.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acesso ao Portal</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input 
          type="email" placeholder="Seu e-mail" 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <input 
          type="password" placeholder="Sua senha" 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={senha} onChange={(e) => setSenha(e.target.value)} required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Entrar
        </button>
      </form>
    </div>
  );
}