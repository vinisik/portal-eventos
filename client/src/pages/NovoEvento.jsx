import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function NovoEvento() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        data: '',
        dataAberturaInscricoes: '',
        capacidadeMaxima: '',
        imagemUrl: '',   
        idadeMinima: '0',
        categoria: 'Outros',
        valorIngresso: '0',
        destaque: false 
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://localhost:5065/api/eventos', {
                ...formData,
                capacidadeMaxima: parseInt(formData.capacidadeMaxima),
                idadeMinima: parseInt(formData.idadeMinima),
                valorIngresso: parseFloat(formData.valorIngresso),
                destaque: formData.destaque,
                dataAberturaInscricoes: formData.dataAberturaInscricoes || new Date().toISOString()
            });

            alert('Evento criado com sucesso!');
            navigate('/'); 

        } catch (error) {
            console.error("Erro ao criar evento:", error);
            const msgErro = error.response?.data?.title || error.response?.data || "Erro ao guardar o evento.";
            alert(`Erro 400: Verifique os dados. Detalhe: ${JSON.stringify(msgErro)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100 mb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Criar Novo Evento</h2>
                <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">Cancelar</Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Preview da Imagem por URL */}
                {formData.imagemUrl && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Preview do Banner</p>
                    <img 
                      src={formData.imagemUrl} 
                      alt="Preview" 
                      className="w-full h-40 object-cover rounded-lg border border-gray-200 shadow-sm" 
                    />
                  </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Banner)</label>
                    <input
                        type="url" name="imagemUrl"
                        value={formData.imagemUrl} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Ex: https://suaimagem.com/foto.jpg"
                    />
                </div>

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
                        required name="descricao" rows="4"
                        value={formData.descricao} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Detalhes do evento..."
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora do Evento</label>
                        <input
                            type="datetime-local" required name="data"
                            value={formData.data} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Abertura das Inscrições</label>
                        <input
                            type="datetime-local" name="dataAberturaInscricoes"
                            value={formData.dataAberturaInscricoes} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Deixe em branco para abrir imediatamente.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço do Ingresso (R$)</label>
                        <input
                            type="number" min="0" step="0.01" required name="valorIngresso"
                            value={formData.valorIngresso} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="0,00"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Deixe 0 para eventos gratuitos.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
                        <input
                            type="number" required min="1" name="capacidadeMaxima"
                            value={formData.capacidadeMaxima} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Ex: 100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Classificação</label>
                        <select
                            required name="idadeMinima"
                            value={formData.idadeMinima} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                        >
                            <option value="0">Livre</option>
                            <option value="14">+14 Anos</option>
                            <option value="16">+16 Anos</option>
                            <option value="18">+18 Anos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria do Evento</label>
                        <select 
                            name="categoria" value={formData.categoria} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="Tecnologia">Tecnologia</option>
                            <option value="Negócios">Negócios</option>
                            <option value="Música">Música</option>
                            <option value="Educação">Educação</option>
                            <option value="Esportes">Esportes</option>
                            <option value="Cultura">Cultura</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    {/* Toggle de Evento em Destaque */}
                    <div className="md:col-span-2 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between mt-2">
                        <div>
                            <label className="font-bold text-blue-900 block">⭐ Marcar como Evento em Destaque</label>
                            <p className="text-xs text-blue-700 mt-1">Este evento aparecerá com um banner gigante no topo da página inicial.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" name="destaque"
                                checked={formData.destaque} 
                                onChange={(e) => setFormData({...formData, destaque: e.target.checked})}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition disabled:bg-gray-400 mt-4 shadow-lg shadow-blue-100"
                >
                    {loading ? 'Salvando alterações...' : 'Criar Evento'}
                </button>
            </form>
        </div>
    );
}