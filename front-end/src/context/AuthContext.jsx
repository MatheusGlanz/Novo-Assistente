import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserName = localStorage.getItem('userName');

    if (storedToken && storedUserName) {
      setUser({ name: storedUserName });
      setToken(storedToken);
    }
    
    setIsLoading(false);
  }, []);

  // Adicionando funções de login e logout para gerenciar o estado globalmente
  const login = (userData, userToken) => {
    localStorage.setItem('authToken', userToken);
    localStorage.setItem('userName', userData.name);
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    login, // Exportando a função login
    logout, // Exportando a função logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};