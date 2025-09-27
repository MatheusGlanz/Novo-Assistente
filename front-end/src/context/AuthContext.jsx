import { createContext, useState, useEffect, useContext } from 'react';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (o componente que vai gerenciar o estado)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Começa carregando

  useEffect(() => {
    // Esta função roda apenas uma vez quando a aplicação carrega
    const storedToken = localStorage.getItem('authToken');
    const storedUserName = localStorage.getItem('userName');

    if (storedToken && storedUserName) {
      setUser({ name: storedUserName });
      setToken(storedToken);
    }
    
    // Termina o carregamento após a verificação
    setIsLoading(false);
  }, []);

  const value = {
    user,
    token,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Cria um "hook" customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};