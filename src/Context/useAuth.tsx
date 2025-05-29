
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id?: string;
  name: string;
  email?: string;
  role: 'admin' | 'student';
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: { name: string; role: 'admin' | 'student'; token: string }) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user from localStorage
    const savedUser = localStorage.getItem('eduSyncUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: 'student', // Default role, will be updated on login
          token: userData.token
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('eduSyncUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: { name: string; role: 'admin' | 'student'; token: string }) => {
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduSyncUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
