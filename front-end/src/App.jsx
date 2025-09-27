// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// 1. Importação de todos os componentes de página e de rota
import Login from "./components/login/login";
import Register from "./components/register/register";
import Dashboard from "./components/dashboard/dashboard";
import ProtectedRoute from "./components/protectedRoute/protectedRoute";
import ForgotPassword from "./components/forgotPassword/forgotPassword";
import ResetPassword from "./components/resetPassword/resetPassword";
import Tarefas from "./components/tarefa/tarefa";
import Agenda from "./components/agenda/agenda";
import Financas from "./components/financas/financas";
import ListaDeMercado from "./components/lista_de_mercado/lista_de_mercado";



function App() {
  return (
    // O BrowserRouter deve envolver toda a aplicação para que o roteamento funcione
    <BrowserRouter>
      {/* Este div principal mantém o plano de fundo em todas as páginas */}
      <div className="App">
        {/* O componente Routes gerencia qual rota é renderizada */}
        <Routes>
          {/* Rota Raiz: Redireciona automaticamente para a página de login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rotas Públicas: Acessíveis a todos os usuários */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Rota Protegida: Acessível apenas para usuários autenticados */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tarefas"
            element={
              <ProtectedRoute>
                <Tarefas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agenda"
            element={
              <ProtectedRoute>
                <Agenda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/financas"
            element={
              <ProtectedRoute>
                <Financas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/lista-de-mercado"
            element={
              <ProtectedRoute>
                <ListaDeMercado />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;