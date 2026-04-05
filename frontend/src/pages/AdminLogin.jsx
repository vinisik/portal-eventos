import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Senha fictícia para desenvolvimento
    if (senha === 'admin123') {
      localStorage.setItem('isAdmin', 'true'); 
      window.location.href = '/'; // Redireciona e recarrega a página para atualizar o menu
    } else {
      setErro('Senha incorreta. Acesso negado.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 mt-20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Área de Admin</h2>
      </div>

      {erro && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm text-center border border-red-100">
          {erro}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input 
            type="password" required 
            value={senha} onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Introduza a senha de admin"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-md transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}