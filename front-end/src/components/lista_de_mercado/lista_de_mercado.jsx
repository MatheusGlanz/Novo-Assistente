import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import './lista_de_mercado.css'; // Usando o CSS copiado

const api = axios.create({ baseURL: 'https://assistente-backend-auus.onrender.com/api' });
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const categories = ["Hortifruti", "Alimento", "Fruta", "Carne", "Guloseimas", "Frios", "Princesa", "Limpeza", "Bebida"];

const ListaDeMercado = () => {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchItems();
  }, [filterCategory]);

  const fetchItems = async () => {
    try {
      const params = filterCategory ? { category: filterCategory } : {};
      const { data } = await api.get('/grocery', { params });
      setItems(data);
    } catch (error) { console.error("Erro ao buscar itens", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = { item_name: itemName, quantity, category };
    try {
      if (editingId) {
        const originalItem = items.find(i => i.id === editingId);
        await api.put(`/grocery/${editingId}`, { ...originalItem, ...itemData });
      } else {
        await api.post('/grocery', itemData);
      }
      resetForm();
      fetchItems();
    } catch (error) { console.error("Erro ao salvar item", error); }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setItemName(item.item_name);
    setQuantity(item.quantity || '');
    setCategory(item.category);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este item?")) {
      try {
        await api.delete(`/grocery/${id}`);
        fetchItems();
      } catch (error) { console.error("Erro ao deletar item", error); }
    }
  };

  const handleCheck = async (item) => {
    try {
        await api.put(`/grocery/${item.id}`, { ...item, is_checked: !item.is_checked });
        fetchItems();
    } catch(error) {
        console.error("Erro ao marcar item", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setItemName('');
    setQuantity('');
    setCategory(categories[0]);
  };

  return (
    <div className="page-content">
      <div className="back-to-dashboard-link">
        <Link to="/dashboard"><FaArrowLeft /> Menu </Link>
      </div>

      <div className="tasks-container">
        <section className="tasks-form-section">
          <h3>{editingId ? 'Editar Item' : 'Lista de Mercado'}</h3>
          <form onSubmit={handleSubmit} className="task-form">
            <input type="text" placeholder="Nome do Item" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            <input type="text" placeholder="Quantidade (ex: 1kg, 2 pacotes)" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button type="submit">{editingId ? 'Atualizar Item' : 'Adicionar Item'}</button>
            {editingId && <button type="button" onClick={resetForm} style={{backgroundColor: '#6b7280'}}>Cancelar</button>}
          </form>
        </section>

        <section className="tasks-list-section">
          <div className="tasks-filter">
            <label>Filtrar por Categoria:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">Todas</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <h3>Sua Lista</h3>
          <ul className="task-list">
            {items.map(item => (
              <li key={item.id} className="task-item" style={{opacity: item.is_checked ? 0.5 : 1}}>
                <div className="task-item-header" style={{ alignItems: 'center' }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <input type="checkbox" checked={item.is_checked} onChange={() => handleCheck(item)} style={{width: '20px', height: '20px'}}/>
                    <h4 style={{textDecoration: item.is_checked ? 'line-through' : 'none'}}>{item.item_name}</h4>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(item)}><FaEdit /></button>
                    <button onClick={() => handleDelete(item.id)}><FaTrash /></button>
                  </div>
                </div>
                <div className="task-item-footer" style={{ justifyContent: 'flex-start', gap: '20px', marginLeft: '35px' }}>
                  <span><strong>Qtde:</strong> {item.quantity}</span>
                  <span><strong>Categoria:</strong> {item.category}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ListaDeMercado;