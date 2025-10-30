// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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
  useEffect(() => {
    const wrap = document.querySelector(".wrap");
    if (!wrap) return;

    const total = window.innerWidth < 600 ? 150 : 300; // Menos partículas em telas pequenas
    const orbSize = 100;
    const particleSize = 2;
    const time = 14;
    const baseHue = 0;

    // Criação das partículas
    for (let i = 0; i < total; i++) {
      const c = document.createElement("div");
      c.className = "c";
      c.style.width = `${particleSize}px`;
      c.style.height = `${particleSize}px`;

      const hue = (40 / total) * i + baseHue;
      c.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
      c.style.animation = `orbit ${time}s infinite`;
      c.style.animationDelay = `${i * 0.01}s`;

      const z = Math.random() * 360;
      const y = Math.random() * 360;

      c.style.setProperty("--z", `${z}deg`);
      c.style.setProperty("--y", `${y}deg`);
      c.style.setProperty("--orb", `${orbSize}px`);

      wrap.appendChild(c);
    }

    // Keyframes dinâmicos
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
      @keyframes orbit {
        20% { opacity: 1; }
        30%, 80% { 
          transform: rotateZ(var(--z)) rotateY(var(--y)) translateX(var(--orb)) rotateZ(calc(-1 * var(--z))); 
          opacity: 1; 
        }
        100% { 
          transform: rotateZ(var(--z)) rotateY(var(--y)) translateX(calc(var(--orb) * 3)) rotateZ(calc(-1 * var(--z))); 
        }
      }
    `, styleSheet.cssRules.length);

    // Limpeza ao desmontar
    return () => (wrap.innerHTML = "");
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        {/* Fundo animado */}
        <div className="wrap"></div>

        {/* Conteúdo principal (rotas) */}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

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
      </div>
    </BrowserRouter>
  );
}

export default App;
