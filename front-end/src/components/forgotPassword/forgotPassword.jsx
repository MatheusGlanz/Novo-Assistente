// src/components/ForgotPassword/ForgotPassword.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import "./forgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post("https://assistente-backend-auus.onrender.com/api/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError("Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Esqueceu a Senha</h1>
        <p style={{textAlign: 'center', marginBottom: '20px'}}>
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        {message && <p style={{ color: "lightgreen", textAlign: "center" }}>{message}</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <div className="input-field">
          <input
            type="email"
            placeholder="Seu e-mail de cadastro"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaEnvelope className="icon" />
        </div>

        <button type="submit">Enviar Link</button>

        <div className="signup-link">
          <p>
            Lembrou a senha? <Link to="/login">Voltar para o Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};


export default ForgotPassword;
