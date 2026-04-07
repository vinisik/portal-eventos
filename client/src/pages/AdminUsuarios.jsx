import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const res = await api.get('/auth/usuarios');
        setUsuarios(res.data);
      } catch (err) {
        console.error("Erro ao carregar usuários", err);
      }
    };
    carregarUsuarios();
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Usuários do Sistema</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {usuarios.map(u => (
            <tr key={u.id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.nome}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
              <td className="px-6 py-4 text-sm text-gray-500 font-bold">{u.perfil}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}