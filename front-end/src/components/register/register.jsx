import { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.css";

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
      return setError("As senhas não coincidem!");
    }
    try {
      await axios.post("http://localhost:3000/api/register", { name, email, password });
      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Ocorreu um erro no cadastro.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Criar Conta</h1>
        {error && <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</p>}
        {success && <p style={{ color: "lightgreen", textAlign: "center", margin: "10px 0" }}>{success}</p>}
        <div className="input-field">
          <input type="text" placeholder="Seu nome completo" required value={name} onChange={(e) => setName(e.target.value)} />
          <FaUser className="icon" />
        </div>
        <div className="input-field">
          <input type="email" placeholder="Seu melhor e-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <FaEnvelope className="icon" />
        </div>
        <div className="input-field">
          <input type="password" placeholder="Crie uma senha" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <FaLock className="icon" />
        </div>
        <div className="input-field">
          <input type="password" placeholder="Confirme sua senha" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <FaLock className="icon" />
        </div>
        <button type="submit">Registrar</button>
        <div className="signup-link">
          <p>Já tem uma conta? <Link to="/login">Faça o Login</Link></p>
        </div>
      </form>
    </div>
  );
};
export default Register;