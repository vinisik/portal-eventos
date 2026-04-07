import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ListaEventos from './pages/ListaEventos';
import Inscricao from './pages/Inscricao';
import VisualizarIngresso from './pages/VisualizarIngresso';
import Login from './pages/Login';
import Registro from './pages/Registro';
import NovoEvento from './pages/NovoEvento';
import EditarEvento from './pages/EditarEvento';
import ListaParticipantes from './pages/ListaParticipantes';

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('roleUser');
  
  if (role === 'Admin') {
    return children;
  }
  
  // Se não for admin retorna para a tela de login
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <Routes>
          <Route path="/" element={<ListaEventos />} />
          <Route path="/evento/:id/inscricao" element={<Inscricao />} />
          <Route path="/ticket/:hash" element={<VisualizarIngresso />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/registrar" element={<Registro />} />

          <Route 
            path="/admin/novo" 
            element={
              <AdminRoute>
                <NovoEvento />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/evento/:id/editar" 
            element={
              <AdminRoute>
                <EditarEvento />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/evento/:id/participantes" 
            element={
              <AdminRoute>
                <ListaParticipantes />
              </AdminRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}