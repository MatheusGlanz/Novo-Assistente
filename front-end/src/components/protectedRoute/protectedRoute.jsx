import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Importe o useAuth

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth(); // 2. Pegue o token e o estado de carregamento

  // 3. Se estiver carregando, não mostre nada ainda (ou um spinner de loading)
  if (isLoading) {
    return <div>Carregando...</div>; // Ou retorne null para uma tela branca
  }

  // 4. Após carregar, se não houver token, redirecione para o login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // 5. Se houver token, mostre a página protegida
  return children;
};

export default ProtectedRoute;