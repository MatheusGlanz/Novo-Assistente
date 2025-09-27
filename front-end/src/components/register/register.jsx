import { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.css";

// CORREÇÃO: Configurando o Axios para apontar para o seu backend no Render
const api = axios.create({
  baseURL: "https://assistente-backend-auus.onrender.com/api",
});

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    try {
      // Usando a instância 'api' corrigida
      await api.post("/register", {
        name,
        email,
        password,
      });

      setSuccess("Cadastro realizado com sucesso! Redirecionando para o login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        // Este é o erro que você está vendo, indicando falha na conexão
        setError("Ocorreu um erro ao tentar realizar o cadastro.");
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Criar Conta</h1>

        {error && <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</p>}
        {success && <p style={{ color: "lightgreen", textAlign: "center", margin: "10px 0" }}>{success}</p>}

        <div className="input-field">
          <input
            type="text"
            placeholder="Seu nome completo"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FaUser className="icon" />
        </div>

        <div className="input-field">
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaEnvelope className="icon" />
        </div>

        <div className="input-field">
          <input
            type="password"
            placeholder="Crie uma senha"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <div className="input-field">
          <input
            type="password"
            placeholder="Confirme sua senha"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <button type="submit">Registrar</button>

        <div className="signup-link">
          <p>
            Já tem uma conta? <Link to="/login">Faça o Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;