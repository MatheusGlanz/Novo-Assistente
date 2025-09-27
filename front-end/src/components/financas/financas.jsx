import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './financas.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const api = axios.create({ baseURL: 'https://assistente-backend-auus.onrender.com/api' });
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const categories = ["Cartão de crédito", "Casa", "Carro", "Viagem", "Lazer", "Outros"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }) }));

const Financas = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, byCategory: [] });
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(currentYear.toString());

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterMonth, filterYear]);

  const fetchData = () => {
    fetchTransactions();
    fetchSummary();
  };
  
  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/finances', { params: { category: filterCategory, month: filterMonth, year: filterYear } });
      setTransactions(data);
    } catch (error) { console.error("Erro ao buscar transações", error); }
  };
  
  // ATUALIZAÇÃO 1: A função agora envia o filtro de categoria
  const fetchSummary = async () => {
    try {
        const { data } = await api.get('/finances/summary', { 
            params: { 
                category: filterCategory, 
                month: filterMonth, 
                year: filterYear 
            } 
        });
        setSummary(data);
    } catch (error) { console.error("Erro ao buscar resumo", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transactionData = { name, amount: parseFloat(amount), category, transaction_date: date };
    try {
      if (editingId) {
        await api.put(`/finances/${editingId}`, transactionData);
      } else {
        await api.post('/finances', transactionData);
      }
      resetForm();
      fetchData();
    } catch (error) { console.error("Erro ao salvar transação", error); }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setName(t.name);
    setAmount(t.amount);
    setCategory(t.category);
    setDate(new Date(t.transaction_date).toISOString().slice(0, 10));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza?")) {
      try {
        await api.delete(`/finances/${id}`);
        fetchData();
      } catch (error) { console.error("Erro ao deletar transação", error); }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setCategory(categories[0]);
    setDate(new Date().toISOString().slice(0, 10));
  };
  
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const chartData = {
    labels: summary.byCategory.map(c => c.category),
    datasets: [{
        data: summary.byCategory.map(c => c.total),
        backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#6b7280'],
        borderColor: '#1e293b',
        borderWidth: 2,
    }],
  };

  return (
    <div className="page-content">
      <div className="back-to-dashboard-link">
        <Link to="/dashboard"><FaArrowLeft /> Menu </Link>
      </div>

      <div className="finance-summary">
        <div className="summary-total">
            {/* ATUALIZAÇÃO 2: O título agora é dinâmico */}
            <h3>
              {filterCategory ? `Total: ${filterCategory}` : 'Total de Gastos'}
            </h3>
            <p>{formatCurrency(summary.total)}</p>
        </div>
        <div className="summary-chart">
            {summary.byCategory.length > 0 ? (
                <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }} />
            ) : <p style={{color: '#a0aec0'}}>Sem dados para exibir no gráfico.</p>}
        </div>
      </div>

      <div className="tasks-container">
        <section className="tasks-form-section">
          <h3>{editingId ? 'Editar Gasto' : 'Adicionar Gasto'}</h3>
          <form onSubmit={handleSubmit} className="task-form">
            <input type="text" placeholder="Nome do gasto" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="number" step="0.01" placeholder="Valor (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <button type="submit">{editingId ? 'Atualizar' : 'Adicionar'}</button>
            {editingId && <button type="button" onClick={resetForm} style={{backgroundColor: '#6b7280'}}>Cancelar</button>}
          </form>
        </section>

        <section className="tasks-list-section">
          <div className="tasks-filter" style={{justifyContent: 'space-between'}}>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}><option value="">Todas as Categorias</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}><option value="">Todos os Meses</option>{months.map(m=><option key={m.value} value={m.value}>{m.name}</option>)}</select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}><option value="">Todos os Anos</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select>
          </div>
          <h3>Histórico de Gastos</h3>
          <ul className="task-list">
            {transactions.map(t => (
              <li key={t.id} className="task-item">
                <div className="task-item-header">
                  <h4>{t.name}</h4>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(t)}><FaEdit /></button>
                    <button onClick={() => handleDelete(t.id)}><FaTrash /></button>
                  </div>
                </div>
                <div className="task-item-body"><p><strong>{formatCurrency(t.amount)}</strong></p></div>
                <div className="task-item-footer">
                  <span>{t.category}</span>
                  <span>{new Date(t.transaction_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Financas;