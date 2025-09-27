import { Link, Outlet, useNavigate } from "react-router-dom";
// Ícones atualizados para incluir todas as seções
import { 
    FaTasks, 
    FaCalendarAlt, 
    FaPiggyBank, 
    FaChartLine, 
    FaBook, 
    FaSignOutAlt,
    FaShoppingCart 
} from "react-icons/fa";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    // Limpa todos os dados de sessão do usuário
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    // Redireciona para a página de login
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Barra de Navegação Lateral */}
      <nav className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3>Meu Painel</h3>
        </div>
        {/* Lista de menu completa e corrigida */}
        <ul className="sidebar-menu">
          <li><Link to="/dashboard/tarefas"><FaTasks /> Tarefas</Link></li>
          <li><Link to="/dashboard/agenda"><FaCalendarAlt /> Agenda</Link></li>
          <li><Link to="/dashboard/financas"><FaPiggyBank /> Finanças</Link></li>
          <li><Link to="/dashboard/investimentos"><FaChartLine /> Investimentos</Link></li>
          <li><Link to="/dashboard/lista-de-mercado"><FaShoppingCart /> Lista de Mercado</Link></li>
         
        </ul>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> Sair
        </button>
      </nav>

      {/* Área de Conteúdo Principal */}
      <main className="dashboard-content">
        <header className="content-header">
          <h1>Olá, {userName || 'Usuário'}!</h1>
          <p>Hoje é {new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}.</p>
        </header>
        
        {/* O Outlet renderiza o componente da rota aninhada selecionada */}
        <Outlet />
      </main>
    </div>
  );
};


export default Dashboard;
