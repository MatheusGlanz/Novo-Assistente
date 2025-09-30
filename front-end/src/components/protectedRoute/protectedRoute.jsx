import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth();

  // 1. PRIMEIRO: Verificamos se a autenticação ainda está carregando.
  // Se estiver, exibimos uma mensagem e não fazemos mais nada.
  // ISSO EVITA O "FLASH".
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // 2. SEGUNDO: Apenas depois de ter certeza que não está mais carregando,
  // verificamos se o usuário NÃO tem um token.
  if (!token) {
    // Se não tiver token, aí sim redirecionamos para o login.
    return <Navigate to="/login" />;
  }

  // 3. Se passou pelas duas verificações, o usuário está logado.
  // Mostramos a página que ele quer acessar.
  return children;
};

export default ProtectedRoute;