import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import "./forgotPassword.css";

// CORREÇÃO 1: Adicionando a configuração do axios para apontar para o backend no Render
const api = axios.create({
  baseURL: "https://assistente-backend-auus.onrender.com/api",
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      // CORREÇÃO 2: Usando a instância 'api' e o caminho correto
      const res = await api.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError("Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Recuperar Senha</h1>
        <p style={{textAlign: 'center', marginBottom: '20px', color: '#cbd5e1', textShadow: 'none'}}>
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

        <button type="submit">Enviar Link de Recuperação</button>

        <div className="signup-link">
          <p>
            <Link to="/login">
                <FaArrowLeft style={{marginRight: '5px'}} /> Voltar para o Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;