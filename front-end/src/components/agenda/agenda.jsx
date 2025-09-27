import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowLeft, FaStar } from 'react-icons/fa';
import './agenda.css'; // Usando o CSS copiado

// Configuração do Axios para enviar o token
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Agenda = () => {
  const [appointments, setAppointments] = useState([]);
  const [commitment, setCommitment] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchAppointments();
  }, [filterMonth]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appointments?month=${filterMonth}`);
      setAppointments(response.data);
    } catch (error) {
      console.error("Erro ao buscar compromissos", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const appointment_date = `${date}T${time}:00.000Z`;
    const appointmentData = { commitment, notes, appointment_date, is_important: isImportant };

    try {
      if (editingId) {
        await api.put(`/appointments/${editingId}`, appointmentData);
      } else {
        await api.post('/appointments', appointmentData);
      }
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao salvar compromisso", error);
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setCommitment(appointment.commitment);
    setNotes(appointment.notes || '');
    setIsImportant(appointment.is_important);
    const appointmentDate = new Date(appointment.appointment_date);
    setDate(appointmentDate.toISOString().split('T')[0]);
    setTime(appointmentDate.toTimeString().split(' ')[0].slice(0, 5));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este compromisso?")) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchAppointments();
      } catch (error) {
        console.error("Erro ao deletar compromisso", error);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCommitment('');
    setNotes('');
    setDate('');
    setTime('');
    setIsImportant(false);
  };
  
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  return (
    <div className="page-content">
      <div className="back-to-dashboard-link">
        <Link to="/dashboard"><FaArrowLeft /> Menu </Link>
      </div>

      <div className="tasks-container">
        <section className="tasks-form-section">
          <h3>{editingId ? 'Editar Compromisso' : 'Agenda de Compromissos'}</h3>
          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label>Compromisso</label>
              <input type="text" value={commitment} onChange={(e) => setCommitment(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Observação</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            </div>
            <div className="date-time-group">
              <div className="form-group"><label>Data</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
              <div className="form-group"><label>Horário</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="isImportant" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} style={{ width: 'auto', height: 'auto' }} />
              <label htmlFor="isImportant" style={{ marginBottom: 0 }}>Marcar como importante</label>
            </div>
            <button type="submit">{editingId ? 'Atualizar' : 'Adicionar'}</button>
            {editingId && <button type="button" onClick={resetForm} style={{backgroundColor: '#6b7280', marginTop: '10px'}}>Cancelar Edição</button>}
          </form>
        </section>

        <section className="tasks-list-section">
          <div className="tasks-filter">
            <label>Filtrar por Mês:</label>
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          </div>
          <h3>Seus Compromissos</h3>
          <ul className="task-list">
            {appointments.map(item => (
              <li key={item.id} className="task-item">
                <div className="task-item-header">
                  <h4>
                    {item.is_important && <FaStar style={{ color: '#facc15', marginRight: '8px' }} />}
                    {item.commitment}
                  </h4>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(item)}><FaEdit /></button>
                    <button onClick={() => handleDelete(item.id)}><FaTrash /></button>
                  </div>
                </div>
                {item.notes && <div className="task-item-body"><p>{item.notes}</p></div>}
                <div className="task-item-footer">
                  <span><strong>Data:</strong> {formatDateTime(item.appointment_date)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Agenda;