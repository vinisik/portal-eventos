import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  // Captura os dados do novo sistema de autenticação
  const token = localStorage.getItem('token');
  const nomeUsuario = localStorage.getItem('nomeUser');
  const perfil = localStorage.getItem('roleUser');

  const handleLogout = () => {
    // Limpa todos os dados de sessão
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 mb-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Home */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
              PORTAL<span className="text-gray-900">EVENTOS</span>
            </Link>
          </div>

          {/* Links de Navegação */}
          <div className="flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-6">
                {/* Menu de Admin */}
                {perfil === 'Admin' && (
                  <div className="flex gap-4 border-r border-gray-200 pr-6">
                    <Link to="/admin/novo" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                      + Criar Evento
                    </Link>
                    <Link to="/admin/usuarios" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                      Gerenciar Usuários
                    </Link>
                  </div>
                )}

                {/* Info do Usuário */}
                <div className="flex items-center gap-4 border-l border-gray-200 pl-6 ml-2">
                  
                  {/* Link para a página de perfil/ingressos do usuário */}
                  {perfil !== 'Admin' && (
                    <Link 
                      to="/perfil" 
                      className="text-sm font-bold text-gray-600 hover:text-blue-600 transition"
                    >
                      Meus Ingressos
                    </Link>
                  )}

                  <div className="text-right hidden sm:block ml-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bem-vindo</p>
                    <p className="text-sm font-bold text-gray-800">{nomeUsuario}</p>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-100 transition ml-2"
                  >
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              /* Menu Deslogado */
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-3 py-2">
                  Entrar
                </Link>
                <Link 
                  to="/registrar" 
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 "
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}