import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NovoEvento() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado para guardar os dados do formulário
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        data: '',
        capacidadeMaxima: ''
    });

    // Atualiza o estado enquanto o usuário digita
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // POST 
            await axios.post('http://localhost:5065/api/eventos', {
                titulo: formData.titulo,
                descricao: formData.descricao,
                data: formData.data,
                capacidadeMaxima: parseInt(formData.capacidadeMaxima) 
            });

            alert('Evento criado com sucesso!');
            navigate('/'); 

        } catch (error) {
            console.error("Erro ao criar evento:", error);
            alert('Erro ao salvar o evento. Verifique se a API está rodando.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Evento</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Evento</label>
                    <input
                        type="text" required name="titulo"
                        value={formData.titulo} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Ex: Workshop de React"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        required name="descricao" rows="3"
                        value={formData.descricao} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Detalhes do evento..."
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                        <input
                            type="datetime-local" required name="data"
                            value={formData.data} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade Máxima</label>
                        <input
                            type="number" required min="1" name="capacidadeMaxima"
                            value={formData.capacidadeMaxima} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Ex: 100"
                        />
                    </div>
                </div>

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition disabled:bg-blue-400 mt-4"
                >
                    {loading ? 'Salvando...' : 'Salvar Evento'}
                </button>
            </form>
        </div>
    );
}