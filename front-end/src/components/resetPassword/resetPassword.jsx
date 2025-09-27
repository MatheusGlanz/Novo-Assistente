// src/components/ResetPassword/ResetPassword.jsx

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaLock } from "react-icons/fa";
import "./resetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams(); // Pega o token da URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("As senhas не coincidem.");
    }
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`https://assistente-backend-auus.onrender.com/api/reset-password/${token}`, { password });
      setMessage(res.data.message + " Redirecionando para o login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Ocorreu um erro. O link pode ter expirado.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Crie sua Nova Senha</h1>

        {message && <p style={{ color: "lightgreen", textAlign: "center" }}>{message}</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <div className="input-field">
          <input
            type="password"
            placeholder="Digite a nova senha"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>
        <div className="input-field">
          <input
            type="password"
            placeholder="Confirme a nova senha"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <button type="submit">Redefinir Senha</button>
        
        {message && (
             <div className="signup-link">
                <p><Link to="/login">Ir para o Login</Link></p>
             </div>
        )}
      </form>
    </div>
  );
};


export default ResetPassword;
