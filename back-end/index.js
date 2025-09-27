const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Inicialização do App
const app = express();
const PORT = process.env.PORT || 3000; // Alterei a porta para 4000 para evitar conflito com o frontend

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o Banco de Dados
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
   family: 4,
});

// Configuração do SendGrid para envio de e-mails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false, // true para 465, false para outras portas como 587
  auth: {
    user: process.env.EMAIL_USER, // Literalmente a palavra 'apikey'
    pass: process.env.EMAIL_PASS, // Sua chave de API do SendGrid
  },
});

// --- Middleware para verificar o Token JWT ---
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1]; // Pega o token do formato "Bearer <token>"
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        return res.sendStatus(403); // Forbidden (Token inválido)
      }
      req.user = authData; // Salva os dados do usuário (ex: { userId: 1 }) no objeto da requisição
      next(); // Continua para a próxima função
    });
  } else {
    res.sendStatus(401); // Unauthorized (Token não fornecido)
  }
};


// --- ROTAS DE AUTENTICAÇÃO E USUÁRIO ---

// Rota de Registro
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );
    res.status(201).json({ user: newUser.rows[0], message: 'Usuário criado com sucesso!' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// backend/index.js

// Rota para solicitar redefinição de senha (CORRIGIDA)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const resetUrl = `https://assistente-backend-auus.onrender.com/api${resetToken}`;

      // CORREÇÃO: Altere o 'from' para o e-mail que você verificou no SendGrid
      const info = await transporter.sendMail({
        from: '"Seu Assistente Pessoal" <glanzdev@gmail.com>',
        to: user.email,
        subject: 'Redefinição de Senha',
        html: `<p>Para redefinir sua senha, clique no link a seguir: <a href="${resetUrl}">${resetUrl}</a></p>`,
      });
      console.log("Pré-visualização do e-mail (se aplicável): %s", nodemailer.getTestMessageUrl(info));
    }
    res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de redefinição foi enviado.' });
  } catch (error) {
    console.error('Erro ao enviar e-mail de redefinição:', error); // O erro detalhado aparecerá aqui
    res.status(500).json({ message: 'Erro no servidor ao processar o pedido.' });
  }
});

// Rota para efetivar a redefinição de senha
app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, decoded.userId]);
    res.status(200).json({ message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: 'Token inválido ou expirado. Por favor, solicite um novo link.' });
  }
});


// --- ROTAS DA API DE TAREFAS (PROTEGIDAS PELO MIDDLEWARE verifyToken) ---

// Listar todas as tarefas de um usuário
app.get('/api/tasks', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { month } = req.query;
  try {
    let query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC';
    const params = [userId];
    if (month) {
      query = 'SELECT * FROM tasks WHERE user_id = $1 AND TO_CHAR(due_date, \'YYYY-MM\') = $2 ORDER BY due_date ASC';
      params.push(month);
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar tarefas.' });
  }
});

// Criar uma nova tarefa
app.post('/api/tasks', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { description, notes, due_date } = req.body;
  if (!description || !due_date) {
    return res.status(400).json({ message: 'Descrição e data/hora são obrigatórias.' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (user_id, description, notes, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, description, notes, due_date]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar tarefa.' });
  }
});

// Atualizar uma tarefa
app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;
  const { description, notes, due_date, status } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE tasks SET description = $1, notes = $2, due_date = $3, status = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [description, notes, due_date, status || 'pendente', taskId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada ou não pertence ao usuário.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa.' });
  }
});

// Deletar uma tarefa
app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada ou não pertence ao usuário.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar tarefa.' });
  }
});


// --- ROTAS DA API DE AGENDA (PROTEGIDAS) ---
// NOVO BLOCO DE CÓDIGO ADICIONADO ABAIXO

// Listar todos os compromissos de um usuário (com filtro de mês)
app.get('/api/appointments', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { month } = req.query;
  try {
    let query = 'SELECT * FROM appointments WHERE user_id = $1 ORDER BY appointment_date ASC';
    const params = [userId];
    if (month) {
      query = 'SELECT * FROM appointments WHERE user_id = $1 AND TO_CHAR(appointment_date, \'YYYY-MM\') = $2 ORDER BY appointment_date ASC';
      params.push(month);
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar compromissos.' });
  }
});

// Criar um novo compromisso
app.post('/api/appointments', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { commitment, notes, appointment_date, is_important } = req.body;
  if (!commitment || !appointment_date) {
    return res.status(400).json({ message: 'Compromisso e data/hora são obrigatórios.' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO appointments (user_id, commitment, notes, appointment_date, is_important) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, commitment, notes, appointment_date, is_important || false]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar compromisso.' });
  }
});

// Atualizar um compromisso
app.put('/api/appointments/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const appointmentId = req.params.id;
  const { commitment, notes, appointment_date, is_important } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE appointments SET commitment = $1, notes = $2, appointment_date = $3, is_important = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [commitment, notes, appointment_date, is_important, appointmentId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado ou não pertence ao usuário.' });
    }
    res.json(rows[0]);
  } catch (error)
 {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar compromisso.' });
  }
});

// Deletar um compromisso
app.delete('/api/appointments/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const appointmentId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 AND user_id = $2',
      [appointmentId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Compromisso não encontrado ou não pertence ao usuário.' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar compromisso.' });
  }
});


// --- ROTAS DA API DE FINANÇAS (PROTEGIDAS) ---

// Listar transações com filtros
app.get('/api/finances', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { category, month, year } = req.query;

  try {
    let query = 'SELECT * FROM finances WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (year) {
      query += ` AND EXTRACT(YEAR FROM transaction_date) = $${paramIndex++}`;
      params.push(year);
    }
    if (month) {
      query += ` AND EXTRACT(MONTH FROM transaction_date) = $${paramIndex++}`;
      params.push(month);
    }

    query += ' ORDER BY transaction_date DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar finanças.' });
  }
});

// Obter resumo financeiro (total e por categoria)
app.get('/api/finances/summary', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const { month, year } = req.query;

    try {
        let baseQuery = ' FROM finances WHERE user_id = $1';
        const params = [userId];
        let paramIndex = 2;

        if (year) {
            baseQuery += ` AND EXTRACT(YEAR FROM transaction_date) = $${paramIndex++}`;
            params.push(year);
        }
        if (month) {
            baseQuery += ` AND EXTRACT(MONTH FROM transaction_date) = $${paramIndex++}`;
            params.push(month);
        }

        // Calcula o total
        const totalResult = await pool.query('SELECT SUM(amount) as total' + baseQuery, params);
        const total = totalResult.rows[0].total || 0;

        // Calcula o total por categoria
        const byCategoryResult = await pool.query('SELECT category, SUM(amount) as total' + baseQuery + ' GROUP BY category', params);
        const byCategory = byCategoryResult.rows;

        res.json({ total, byCategory });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar resumo financeiro.' });
    }
});


// Criar uma nova transação
app.post('/api/finances', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { name, amount, category, transaction_date } = req.body;

  try {
    const { rows } = await pool.query(
      'INSERT INTO finances (user_id, name, amount, category, transaction_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name, amount, category, transaction_date]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar transação.' });
  }
});

// Atualizar uma transação
app.put('/api/finances/:id', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, amount, category, transaction_date } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE finances SET name = $1, amount = $2, category = $3, transaction_date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [name, amount, category, transaction_date, id, userId]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Transação não encontrada.' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar transação.' });
    }
});

// Deletar uma transação
app.delete('/api/finances/:id', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM finances WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Transação não encontrada.' });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar transação.' });
    }
});

// --- ROTAS DA API DE LISTA DE MERCADO (PROTEGIDAS) ---

// Listar itens do mercado (com filtro de categoria)
app.get('/api/grocery', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { category } = req.query;
  try {
    let query = 'SELECT * FROM grocery_items WHERE user_id = $1';
    const params = [userId];
    if (category) {
      query += ' AND category = $2';
      params.push(category);
    }
    query += ' ORDER BY created_at ASC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar itens de mercado:', error);
    res.status(500).json({ message: 'Erro ao buscar itens.' });
  }
});

// Adicionar um novo item
app.post('/api/grocery', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { item_name, quantity, category } = req.body;
  if (!item_name || !category) {
    return res.status(400).json({ message: 'Nome do item e categoria são obrigatórios.' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO grocery_items (user_id, item_name, quantity, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, item_name, quantity, category]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ message: 'Erro ao adicionar item.' });
  }
});

// Atualizar um item (para editar ou marcar/desmarcar)
app.put('/api/grocery/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { item_name, quantity, category, is_checked } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE grocery_items SET item_name = $1, quantity = $2, category = $3, is_checked = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [item_name, quantity, category, is_checked, id, userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Item não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ message: 'Erro ao atualizar item.' });
  }
});

// Deletar um item
app.delete('/api/grocery/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM grocery_items WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Item não encontrado.' });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({ message: 'Erro ao deletar item.' });
  }
});




// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});