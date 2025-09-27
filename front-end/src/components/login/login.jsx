import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // Importe o Link
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/login", {
        name,
        email,
        password,
      });

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('userName', response.data.user.name);

      navigate("/dashboard");

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Ocorreu um erro ao tentar fazer o login.");
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Acesse o sistema</h1>

        {error && <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</p>}

        <div className="input-field">
          <input
            type="email"
            placeholder="E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaUser className="icon" />
        </div>
        <div className="input-field">
          <input
            type="password"
            placeholder="Senha"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <div className="recall-forget">
          <label>
            <input type="checkbox" />
            Lembre de mim
          </label>
          {/* AQUI ESTÁ A ATUALIZAÇÃO */}
          <Link to="/forgot-password">Esqueceu sua senha?</Link>
        </div>
        
        <button type="submit">Login</button>

        <div className="signup-link">
          <p>
            Não tem uma conta? <Link to="/register">Registar</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;