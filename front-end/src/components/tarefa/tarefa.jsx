import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import '../tarefa/tarefa.css';

// Configuração do Axios para enviar o token de autenticação em todas as requisições
const api = axios.create({
  baseURL: 'https://assistente-backend-auus.onrender.com/api',
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Tarefas = () => {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Define o valor inicial do filtro para o mês e ano atuais
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  // Efeito para buscar as tarefas quando o componente é montado ou o filtro de mês muda
  useEffect(() => {
    fetchTasks();
  }, [filterMonth]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks?month=${filterMonth}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas", error);
      // Adicionar lógica para lidar com token expirado, se necessário
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !date || !time) {
      alert("Descrição, data e horário são obrigatórios.");
      return;
    }
    const due_date = `${date}T${time}:00.000Z`;
    const taskData = { description, notes, due_date };

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, taskData);
      } else {
        await api.post('/tasks', taskData);
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Erro ao salvar tarefa", error);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setDescription(task.description);
    setNotes(task.notes || '');
    const taskDate = new Date(task.due_date);
    setDate(taskDate.toISOString().split('T')[0]);
    setTime(taskDate.toTimeString().split(' ')[0].slice(0, 5));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta tarefa?")) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error("Erro ao deletar tarefa", error);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setNotes('');
    setDate('');
    setTime('');
  };
  
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  return (
    <div className="page-content">
      <div className="back-to-dashboard-link">
        <Link to="/dashboard">
          <FaArrowLeft /> Menu
        </Link>
      </div>

      <div className="tasks-container">
        <section className="tasks-form-section">
          <h3>{editingId ? 'Editar Tarefa' : 'Tarefas'}</h3>
          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label>Descrição</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Observação</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            </div>
            <div className="date-time-group">
              <div className="form-group">
                  <label>Data</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="form-group">
                  <label>Horário</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>
            <button type="submit">{editingId ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}</button>
            {editingId && <button type="button" onClick={resetForm} style={{backgroundColor: '#6b7280', marginTop: '10px'}}>Cancelar Edição</button>}
          </form>
        </section>

        <section className="tasks-list-section">
          <div className="tasks-filter">
            <label>Filtrar por Mês:</label>
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          </div>
          <h3>Lista de Tarefas</h3>
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <div className="task-item-header">
                  <h4>{task.description}</h4>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(task)}><FaEdit /></button>
                    <button onClick={() => handleDelete(task.id)}><FaTrash /></button>
                  </div>
                </div>
                {task.notes && <div className="task-item-body"><p>{task.notes}</p></div>}
                <div className="task-item-footer">
                  <span><strong>Prazo:</strong> {formatDateTime(task.due_date)}</span>
                  <span><strong>Status:</strong> {task.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Tarefas;